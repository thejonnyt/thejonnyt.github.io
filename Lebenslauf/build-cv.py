#!/usr/bin/env python3
"""
Build script to generate CV from JSON data.
Converts src/content/*.json → cv.typ → ../public/files/Johannes_Tauscher_CV.pdf
"""

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List

# Paths
ROOT = Path(__file__).parent.parent
CONTENT_DIR = ROOT / "src" / "content"
CV_DIR = ROOT / "Lebenslauf"
OUTPUT_FILE = CV_DIR / "cv.typ"

# Global glossary map
GLOSSARY_MAP = {}


def load_json(path: Path) -> Any:
    """Load and parse JSON file."""
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_cv_text(item: Any, field: str, cv_field: str = None) -> str:
    """Get CV-specific text if available, otherwise fall back to regular field."""
    if cv_field is None:
        cv_field = f"cv{field.capitalize()}"

    if isinstance(item, dict):
        return item.get(cv_field, item.get(field, ""))
    return str(item)


def escape_typst(text: str) -> str:
    """Escape special characters for Typst and replace glossary terms."""
    if not text:
        return ""

    def replace_term(match):
        term_id = match.group(1)
        return GLOSSARY_MAP.get(term_id, term_id)

    # Replace template placeholders like {{microservices}}
    text = re.sub(r'\{\{([^}]+)\}\}', replace_term, text)

    # Clean up any leftover weirdness, but less aggressively
    text = re.sub(r'\s+', ' ', text)  # Multiple spaces -> single space
    text = re.sub(r'\s*,\s*', ', ', text) # Normalize commas

    # Escape special Typst characters
    text = text.replace("#", "\\#")
    text = text.replace("[", "\\[")
    text = text.replace("]", "\\]")
    text = text.replace("@", "\\@")
    return text.strip()


def format_achievements(achievements: List[Any]) -> List[str]:
    """Format achievements list, using cvText when available."""
    formatted = []
    for item in achievements:
        if isinstance(item, dict):
            text = get_cv_text(item, "text", "cvText")
        else:
            text = str(item)
        formatted.append(escape_typst(text))
    return formatted


def generate_experience_section(data: List[Dict]) -> str:
    """Generate experience section from JSON."""
    lines = ['#section("Professional Experience")\n']

    # Filter experiences: only include if cvInclude=true OR started after 2019
    filtered = []
    for exp in data:
        cv_include = exp.get("cvInclude", None)
        if cv_include is True:
            filtered.append(exp)
        elif cv_include is None:
            # No flag set - auto-filter by date (show 2019 onwards)
            start = exp.get("startDate", "")
            if start and start >= "2019-01":
                filtered.append(exp)
        # If cvInclude is explicitly False, skip it

    for exp in filtered:
        company = escape_typst(exp.get("company", ""))
        position = escape_typst(exp.get("position", ""))
        location = escape_typst(exp.get("location", ""))
        start = exp.get("startDate", "")
        end = exp.get("endDate", "")
        current = exp.get("current", False)

        description = get_cv_text(exp, "description", "cvDescription")
        description = escape_typst(description)

        achievements = format_achievements(exp.get("achievements", []))
        technologies = [escape_typst(t) for t in exp.get("technologies", [])]

        # Build entry call
        lines.append("#entry(")
        lines.append(f'  "{position}",')
        lines.append(f'  "{company}",')
        lines.append(f'  "{location}",')
        lines.append(f'  format-date("{start}", "{end}", current: {str(current).lower()}),')

        if description:
            lines.append(f'  description: [{description}],')

        if achievements:
            lines.append('  achievements: (')
            for ach in achievements:
                lines.append(f'    [{ach}],')
            lines.append('  ),')

        if technologies and len(technologies) <= 10:  # Only show if not too many
            tech_str = '", "'.join(technologies)
            lines.append(f'  technologies: ("{tech_str}"),')

        lines.append(')\n')

    return '\n'.join(lines)


def generate_education_section(data: List[Dict]) -> str:
    """Generate education section from JSON."""
    lines = ['#section("Education")\n']

    for edu in data:
        institution = escape_typst(edu.get("institution", ""))
        degree = escape_typst(edu.get("degree", ""))
        field = escape_typst(edu.get("field", ""))
        location = escape_typst(edu.get("location", ""))
        start = edu.get("startDate", "")
        end = edu.get("endDate", "")

        title = f"{degree} {field}"
        highlights = format_achievements(edu.get("highlights", []))

        lines.append("#simple-entry(")
        lines.append(f'  "{title}",')
        lines.append(f'  "{institution}",')
        lines.append(f'  "{location}",')
        lines.append(f'  format-date("{start}", "{end}"),')

        if highlights:
            lines.append('  highlights: (')
            for hl in highlights:
                lines.append(f'    [{hl}],')
            lines.append('  ),')

        lines.append(')\n')

    return '\n'.join(lines)


def generate_publications_section(data: List[Dict]) -> str:
    """Generate publications section from JSON."""
    if not data:
        return ""

    lines = ['#section("Publications")\n']

    for pub in data:
        title = escape_typst(pub.get("title", ""))
        authors = [escape_typst(a) for a in pub.get("authors", [])]
        authors_str = ", ".join(authors)
        venue = escape_typst(pub.get("venue", ""))
        year = pub.get("year", "")
        doi = pub.get("links", {}).get("doi", "")
        citations = pub.get("citations", None)

        lines.append("#publication(")
        lines.append(f'  "{title}",')
        lines.append(f'  "{authors_str}",')
        lines.append(f'  "{venue}",')
        lines.append(f'  {year},')

        if doi:
            lines.append(f'  doi: "{doi}",')
        if citations:
            lines.append(f'  citations: {citations},')

        lines.append(')\n')

    return '\n'.join(lines)


def generate_skills_section(data: Dict) -> str:
    """Generate skills section from skillsDatabase.json."""
    lines = ['#section("Technical Skills")\n']

    # Group skills by category, only show featured or high-proficiency ones
    categories = {}

    for skill_name, skill_data in data.get("skills", {}).items():
        category = skill_data.get("category", "Other")
        level = skill_data.get("level", "beginner")
        featured = skill_data.get("featured", False)

        # Include if featured OR proficient/expert level
        if featured or level in ["proficient", "expert", "wizard"]:
            if category not in categories:
                categories[category] = []
            # Append the raw skill name. Processing will happen later.
            categories[category].append(skill_name)

    # Build skills section
    lines.append("#skills-section((")
    for category, skills in sorted(categories.items()):
        processed_skills = []
        for s in skills:
            if s == "LaTeX":
                # Call the Typst element from the metalogo package
                processed_skills.append("LaTeX")
            else:
                processed_skills.append(f'"{escape_typst(s)}"')

        skills_array = ", ".join(processed_skills)
        lines.append(f'  ("{category}", ({skills_array},)),')
    lines.append('))\n')

    return '\n'.join(lines)


def main():
    """Main build function."""
    print("Building CV from JSON data...")

    # Load glossary
    global GLOSSARY_MAP
    try:
        glossary_data = load_json(CONTENT_DIR / "glossary.json")
        if isinstance(glossary_data, dict) and 'terms' in glossary_data and isinstance(glossary_data.get('terms'), list):
            GLOSSARY_MAP = {item['id']: item['term'] for item in glossary_data['terms'] if 'id' in item and 'term' in item}
        else:
            print("Warning: glossary.json does not contain a 'terms' list. Skipping.")
    except FileNotFoundError:
        print("Warning: glossary.json not found. Placeholders will not be replaced.")
    except (KeyError, TypeError) as e:
        print(f"Warning: Could not parse glossary.json. Placeholders may not be replaced correctly. Error: {e}")


    # Load data
    try:
        intro = load_json(CONTENT_DIR / "intro" / "data.json")
        experience = load_json(CONTENT_DIR / "experience" / "data.json")
        education = load_json(CONTENT_DIR / "education" / "data.json")
        publications = load_json(CONTENT_DIR / "publications" / "data.json")
        skills_db = load_json(CONTENT_DIR / "skillsDatabase.json")
    except FileNotFoundError as e:
        print(f"Error: Could not find data file: {e}")
        sys.exit(1)

    # Extract personal info
    name = escape_typst(intro.get("name", ""))
    title = escape_typst(intro.get("title", ""))
    email = intro.get("email", "")
    linkedin = intro.get("linkedin", "")
    github = intro.get("github", "")
    website = intro.get("website", "")
    # `cvSummary` may contain Typst markup that should be evaluated by Typst.
    # Do not run it through `escape_typst` so Typst commands are preserved.
    # If you want to ensure safety for plain-text summaries, escape manually
    # in the JSON or add a separate raw flag in the future.
    cv_summary = intro.get("cvSummary", "")

    # Build CV document
    lines = [
        '#import "template.typ": *',
        '',
        '#show: cv-document',
        '',
        '#cv-header(',
        f'  "{name}",',
        f'  "{title}",',
        f'  "{email}",',
        f'  link("{linkedin}")[{linkedin.replace("https://", "")}],',
        f'  link("{github}")[{github.replace("https://", "")}],',
        f'  link("{website}")[{website.replace("https://", "")}],',
        f'  summary: [{cv_summary}],',
        '  // phone: "YOUR PHONE",  // Uncomment and add your phone',
        '  // address: "YOUR ADDRESS",  // Uncomment and add your address',
        ')',
        '',
    ]

    # Add sections
    lines.append(generate_experience_section(experience))
    lines.append(generate_education_section(education))
    lines.append(generate_publications_section(publications))
    lines.append(generate_skills_section(skills_db))

    # Write output
    output_content = '\n'.join(lines)
    OUTPUT_FILE.write_text(output_content, encoding='utf-8')

    print(f"✓ Generated {OUTPUT_FILE}")
    print("\nNext steps:")
    print("  1. Review cv.typ and add personal info (phone, address)")
    print("  2. Run: typst compile cv.typ ../public/files/Johannes_Tauscher_CV.pdf")
    print("  3. Or run: ./build-cv.sh (compiles automatically to public/files/)")


if __name__ == "__main__":
    main()
