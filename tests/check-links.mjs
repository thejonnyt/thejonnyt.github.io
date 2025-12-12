import fs from 'fs/promises';
import path from 'path';

const URL_REGEX = /https?:[^"'`<>|]+/g;
const EXCLUDED_DIRS = ['node_modules', 'dist', 'output', '.git', '.astro', '.vscode'];
const EXCLUDED_FILES = ['package-lock.json', 'link-check-report.md', 'check-links.mjs'];
const EXCLUDED_URL_PATTERNS = [
    /registry.npmjs.org/,
    /http:\/\/www.w3.org/,
    /http:\/\/ns.adobe.com/,
    /http:\/\/ns.apple.com/,
    /purl.org/, // DC elements
    /localhost/
];
const CONCURRENT_CHECKS = 10;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';


async function findFiles(dir) {
  let files = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.includes(entry.name)) {
          files = files.concat(await findFiles(fullPath));
        }
      } else if (!EXCLUDED_FILES.includes(path.basename(fullPath))) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    // Ignore permission errors
  }
  return files;
}

async function extractUrlsFromFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const urls = content.match(URL_REGEX) || [];
    return urls.map(url => url.replace(/[).,\;]$/, ''));
  } catch (error) {
    return [];
  }
}

async function checkUrlStatus(url) {
  try {
    const controller = new AbortController();
    const signal = controller.signal;
    setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
        method: 'GET',
        signal,
        redirect: 'follow',
        headers: { 'User-Agent': USER_AGENT }
    });
    
    if (!response.body.locked) {
      response.body.cancel().catch(() => {});
    }

    return { url, status: response.status, statusText: response.statusText, ok: response.ok };
  } catch (error) {
     if (error.name === 'AbortError') {
        return { url, status: 'ERROR', statusText: 'Request timed out', ok: false };
     }
    return { url, status: 'ERROR', statusText: error.message, ok: false };
  }
}

function generateMarkdownReport(resultsMap, allUrlsWithSource) {
  let report = '# Link Status Report\n\n';
  report += `Checked on: ${new Date().toUTCString()}\n\n`;

  const items = allUrlsWithSource.map(({url, source}) => {
      const result = resultsMap.get(url) || { ok: false, status: 'ERROR', statusText: 'Not Checked' };
      return { url, source, ...result };
  });

  const successes = items.filter(r => r.ok);
  const failures = items.filter(r => !r.ok);

  if (failures.length > 0) {
    report += `## ❌ Found ${failures.length} Potentially Dead Links\n\n`;
    report += '| URL | Source File | Status |\n';
    report += '| --- | --- | --- |\n';
    failures.sort((a,b) => a.url.localeCompare(b.url) || a.source.localeCompare(b.source)).forEach(item => {
        const { url, source, status, statusText } = item;
        const relativeSource = path.relative(process.cwd(), source);
        report += `| ${url} | ${relativeSource} | ❌ ${status} ${statusText} |\n`;
    });
    report += '\n';
  }

  if (successes.length > 0) {
    const status = failures.length === 0 ? '## ✅ All Links Successful' : '## ✅ Successful Links'
    report += `${status}\n\n`;
    report += '| URL | Source File | Status |\n';
    report += '| --- | --- | --- |\n';
    successes.sort((a,b) => a.url.localeCompare(b.url) || a.source.localeCompare(b.source)).forEach(item => {
        const { url, source, status, statusText } = item;
        const relativeSource = path.relative(process.cwd(), source);
        report += `| ${url} | ${relativeSource} | ✅ ${status} ${statusText} |\n`;
    });
  }

  return report;
}

async function runWithConcurrency(urls, concurrency, checkFn) {
    const results = new Map();
    const queue = [...urls];
    let processedCount = 0;

    async function worker() {
        while (queue.length > 0) {
            const url = queue.shift();
            if (url) {
                try {
                    const result = await checkFn(url);
                    results.set(url, result);
                } catch(e) {
                    results.set(url, { url, status: 'ERROR', statusText: 'Script crashed during check', ok: false });
                }
                processedCount++;
                if (processedCount % 10 === 0 || processedCount === urls.length) {
                    console.log(`Progress: ${processedCount}/${urls.length} URLs checked.`);
                }
            }
        }
    }

    const workers = Array(concurrency).fill(null).map(() => worker());
    await Promise.all(workers);
    return results;
}


async function main() {
  console.log('Scanning project for files...');
  const files = await findFiles(process.cwd());
  console.log(`Found ${files.length} files to scan.`);

  let allUrlsWithSource = [];
  for (const file of files) {
    const urlsInFile = await extractUrlsFromFile(file);
    for (const url of urlsInFile) {
        allUrlsWithSource.push({ url, source: file });
    }
  }

  const uniqueUrls = [...new Set(allUrlsWithSource.map(item => item.url))];
  
  const filteredUrls = uniqueUrls.filter(url => {
    if (EXCLUDED_URL_PATTERNS.some(pattern => pattern.test(url))) {
        return false;
    }
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
  });

  if (filteredUrls.length === 0) {
    console.log('No relevant URLs found in the project.');
    return;
  }

  console.log(`Found ${filteredUrls.length} unique URLs to check (from ${allUrlsWithSource.length} occurrences). Checking with a concurrency of ${CONCURRENT_CHECKS}...`);

  const resultsMap = await runWithConcurrency(filteredUrls, CONCURRENT_CHECKS, checkUrlStatus);

  console.log('All URLs checked. Generating report...');

  const report = generateMarkdownReport(resultsMap, allUrlsWithSource);

  console.log(report);

  const reportPath = path.join(process.cwd(), 'link-check-report.md');
  await fs.writeFile(reportPath, report);
  console.log(`\nReport saved to ${reportPath}`);

  const failedLinksCount = Array.from(resultsMap.values()).filter(r => !r.ok).length;
  if (failedLinksCount > 0) {
      console.error(`\nFound ${failedLinksCount} unique URLs that are potentially dead.`);
  } else {
      console.log("\nAll unique links seem to be working correctly!");
  }
}

main().catch(console.error);