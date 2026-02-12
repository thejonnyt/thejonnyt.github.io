#!/usr/bin/env python3
"""
Build script to generate CV from JSON data.
Converts src/content/*.json → cv.typ → ../public/files/Johannes_Tauscher_CV.pdf
"""

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

# Paths
ROOT = Path(__file__).parent.parent
CONTENT_DIR = ROOT / "src" / "content"
CV_DIR = ROOT / "Lebenslauf"

VARIANTS = {
    "standard": {
        "output_file": CV_DIR / "cv.typ",
        "experience_filter": "curated",
        "max_technologies": 10,
        "skills_mode": "featured",
        "curated_note": True,
        "include_publications": False,
        "include_programs_awards": False,
    },
    "ats": {
        "output_file": CV_DIR / "cv_ats.typ",
        "experience_filter": "all",
        "max_technologies": None,
        "skills_mode": "all",
        "curated_note": False,
        "include_publications": False,
        "include_programs_awards": False,
    },
}

# Global glossary map
GLOSSARY_MAP = {}


def load_json(path: Path) -> Any:
    """Load and parse JSON file."""
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_variant_text(
    item: Any,
    field: str,
    variant: str,
    cv_field: str = None,
    ats_field: str = None,
) -> str:
    """Get variant-specific text if available, then fall back to CV and base fields."""
    if cv_field is None:
        cv_field = f"cv{field.capitalize()}"
    if ats_field is None:
        ats_field = f"ats{field.capitalize()}"

    if isinstance(item, dict):
        if variant == "ats" and ats_field in item and item.get(ats_field):
            return item.get(ats_field, "")
        if cv_field in item and item.get(cv_field):
            return item.get(cv_field, "")
        return item.get(field, "")
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


def format_achievements(achievements: List[Any], variant: str) -> List[str]:
    """Format achievements list, using variant-specific text when available."""
    formatted = []
    for item in achievements:
        if isinstance(item, dict):
            text = get_variant_text(item, "text", variant, "cvText", "atsText")
        else:
            text = str(item)
        formatted.append(escape_typst(text))
    return formatted


def filter_experiences(data: List[Dict], variant: str) -> List[Dict]:
    """Filter experiences based on variant rules."""
    filtered = []
    for exp in data:
        cv_include = exp.get("cvInclude", None)
        if variant == "ats":
            if cv_include is False:
                continue
            filtered.append(exp)
        else:
            if cv_include is True:
                filtered.append(exp)
            elif cv_include is None:
                start = exp.get("startDate", "")
                if start and start >= "2019-01":
                    filtered.append(exp)
    return filtered


def generate_experience_section(
    data: List[Dict],
    website: str,
    variant: str,
    max_technologies: Optional[int],
    curated_note: bool,
) -> str:
    """Generate experience section from JSON."""
    lines = ['#section("Professional Experience")\n']

    for exp in filter_experiences(data, variant):
        if exp.get("pageBreakBefore", False):
            lines.append("#pagebreak()")
        company = escape_typst(exp.get("company", ""))
        position = escape_typst(exp.get("position", ""))
        location = escape_typst(exp.get("location", ""))
        start = exp.get("startDate", "")
        end = exp.get("endDate", "")
        current = exp.get("current", False)

        description = get_variant_text(exp, "description", variant, "cvDescription", "atsDescription")
        description = escape_typst(description)

        short_achievements = exp.get("achievementsShort") or exp.get("achievements_short")
        achievements_source = short_achievements if short_achievements else exp.get("achievements", [])
        achievements = format_achievements(achievements_source, variant)
        if variant == "ats" and exp.get("atsTechnologies"):
            raw_technologies = exp.get("atsTechnologies", [])
        elif exp.get("cvTechnologies"):
            raw_technologies = exp.get("cvTechnologies", [])
        else:
            raw_technologies = exp.get("technologies", [])

        technologies = [escape_typst(t) for t in raw_technologies]

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

        if technologies and (max_technologies is None or len(technologies) <= max_technologies):
            tech_str = '", "'.join(technologies)
            lines.append(f'  technologies: ("{tech_str}"),')

        lines.append(')\n')

    if curated_note:
        lines.append('')
        lines.append('#v(0.2em)')
        lines.append('#align(center)[')
        if website:
            note = f'For brevity, this CV is curated. A complete work history is available on my #link("{website}")[webpage] or upon request.'
        else:
            note = 'For brevity, this CV is curated. A complete work history is available upon request.'
        lines.append(f'  #text(size: 9pt, style: "italic", fill: gray-color)[{note}]')
        lines.append(']')

    return '\n'.join(lines)


def generate_education_section(data: List[Dict], variant: str) -> str:
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
        highlights = format_achievements(edu.get("highlights", []), variant)

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


def generate_programs_awards_section(misc: Dict, variant: str) -> str:
    """Generate programs & awards section from misc.json."""
    programs = misc.get("programs", [])
    awards = misc.get("awards", [])
    if not programs and not awards:
        return ""

    lines = ['#section("Programs & Awards")\n']

    for item in programs + awards:
        if item.get("cvInclude", True) is False:
            continue
        title = escape_typst(item.get("title", ""))
        organization = escape_typst(item.get("organization", ""))
        location = escape_typst(item.get("location", ""))
        year = item.get("year", "")
        date = escape_typst(str(year)) if year != "" else ""

        description = get_variant_text(item, "description", variant, "cvDescription", "atsDescription")
        description = escape_typst(description)
        achievements = format_achievements(item.get("achievements", []), variant)

        lines.append("#entry(")
        lines.append(f'  "{title}",')
        lines.append(f'  "{organization}",')
        lines.append(f'  "{location}",')
        lines.append(f'  "{date}",')

        if description:
            lines.append(f'  description: [{description}],')

        if achievements:
            lines.append('  achievements: (')
            for ach in achievements:
                lines.append(f'    [{ach}],')
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


def generate_skills_section(data: Dict, skills_mode: str) -> str:
    """Generate skills section from skillsDatabase.json."""
    lines = ['#section("Technical Skills")\n']

    # Group skills by category, only show featured or high-proficiency ones
    categories = {}
    category_order = [
        "Programming Languages",
        "Backend & DevOps",
        "Analysis, ML & AI",
        "Web & Creative",
        "Tools & Systems",
    ]

    for skill_name, skill_data in data.get("skills", {}).items():
        category = skill_data.get("category", "Other")
        if skills_mode == "all":
            include = True
        else:
            level = skill_data.get("level", "beginner")
            featured = skill_data.get("featured", False)
            include = featured or level in ["proficient", "expert", "wizard"]

        if include:
            if category not in categories:
                categories[category] = []
            categories[category].append(skill_name)

    # Build skills section
    lines.append("#skills-section((")
    ordered_categories = [c for c in category_order if c in categories]
    remaining_categories = [c for c in categories.keys() if c not in category_order]
    ordered_categories.extend(sorted(remaining_categories))

    for category in ordered_categories:
        skills = categories[category]
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


def build_cv(
    variant: str,
    intro: Dict,
    experience: List[Dict],
    education: List[Dict],
    publications: List[Dict],
    skills_db: Dict,
    misc: Dict,
) -> None:
    """Build a single CV variant."""
    config = VARIANTS[variant]

    # Extract personal info
    name = escape_typst(intro.get("name", ""))
    title = escape_typst(intro.get("title", ""))
    email = intro.get("email", "")
    linkedin = intro.get("linkedin", "")
    github = intro.get("github", "")
    website = intro.get("website", "")
    summary = get_variant_text(intro, "summary", variant, "cvSummary", "atsSummary")
    safe_summary = escape_typst(summary)

    # Build CV document
    lines = [
        '#import "template.typ": *',
        '',
        '#show: cv-document',
        '',
        '#cv-header(',
        f'  "{name}",',
        f'  "{title}",',
        f'  summary: "{safe_summary}",',
        f'  email: "{email}",',
        f'  linkedin: link("{linkedin}")[{linkedin.replace("https://", "")}],',
        f'  github: link("{github}")[{github.replace("https://", "")}],',
        f'  website: link("{website}")[{website.replace("https://", "")}]',
        ')',
        ''
    ]

    # Add sections
    lines.append(
        generate_experience_section(
            experience,
            website=website,
            variant=variant,
            max_technologies=config["max_technologies"],
            curated_note=config["curated_note"],
        )
    )
    lines.append(generate_education_section(education, variant))
    if config.get("include_publications", True):
        lines.append(generate_publications_section(publications))
    lines.append(generate_skills_section(skills_db, config["skills_mode"]))
    if config.get("include_programs_awards", True):
        lines.append(generate_programs_awards_section(misc, variant))

    # Write output
    output_content = '\n'.join(lines)
    config["output_file"].write_text(output_content, encoding='utf-8')
    print(f"✓ Generated {config['output_file']}")


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
        misc = load_json(CONTENT_DIR / "misc" / "data.json")
    except FileNotFoundError as e:
        print(f"Error: Could not find data file: {e}")
        sys.exit(1)

    for variant in VARIANTS.keys():
        build_cv(variant, intro, experience, education, publications, skills_db, misc)

    print("\nNext steps:")
    print("  1. Review cv.typ and cv_ats.typ")
    print("  2. Run: ./build-cv.sh (standard goes to public/files/, ATS to output/)")


if __name__ == "__main__":
    main()
