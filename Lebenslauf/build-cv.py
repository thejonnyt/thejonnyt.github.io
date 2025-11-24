#!/usr/bin/env python3
"""
Build script to generate CV from JSON data.
Converts src/content/*.json → cv.typ → output/cv.pdf
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List

# Paths
ROOT = Path(__file__).parent.parent
CONTENT_DIR = ROOT / "src" / "content"
CV_DIR = ROOT / "Lebenslauf"
OUTPUT_FILE = CV_DIR / "cv.typ"


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
    """Escape special characters for Typst."""
    if not text:
        return ""
    # Remove template placeholders like {{microservices}}
    import re
    text = re.sub(r'\{\{[^}]+\}\}', '', text)
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

    for exp in data:
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
        lines.append(f'  title: "{position}",')
        lines.append(f'  subtitle: "{company}",')
        lines.append(f'  location: "{location}",')
        lines.append(f'  date: format-date("{start}", "{end}", current: {str(current).lower()}),')

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
        lines.append(f'  title: "{title}",')
        lines.append(f'  subtitle: "{institution}",')
        lines.append(f'  location: "{location}",')
        lines.append(f'  date: format-date("{start}", "{end}"),')

        if highlights:
            lines.append('  highlights: (')
            for hl in highlights:
                lines.append(f'    [{hl}],')
            lines.append('  ),')

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
            categories[category].append(escape_typst(skill_name))

    # Build skills section
    lines.append("#skills-section((")
    for category, skills in sorted(categories.items()):
        skills_str = '", "'.join(skills)
        lines.append(f'  ("{category}", ("{skills_str}")),')
    lines.append('))\n')

    return '\n'.join(lines)


def main():
    """Main build function."""
    print("Building CV from JSON data...")

    # Load data
    try:
        intro = load_json(CONTENT_DIR / "intro" / "data.json")
        experience = load_json(CONTENT_DIR / "experience" / "data.json")
        education = load_json(CONTENT_DIR / "education" / "data.json")
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

    # Build CV document
    lines = [
        '#import "template.typ": *',
        '',
        '#show: cv-document',
        '',
        '#cv-header(',
        f'  name: "{name}",',
        f'  title: "{title}",',
        f'  email: "{email}",',
        f'  linkedin: link("{linkedin}")[{linkedin.replace("https://", "")}],',
        f'  github: link("{github}")[{github.replace("https://", "")}],',
        f'  website: link("{website}")[{website.replace("https://", "")}],',
        '  // phone: "YOUR PHONE",  // Add in personal.typ or here',
        '  // address: "YOUR ADDRESS",  // Add in personal.typ or here',
        ')',
        '',
    ]

    # Add sections
    lines.append(generate_experience_section(experience))
    lines.append(generate_education_section(education))
    lines.append(generate_skills_section(skills_db))

    # Write output
    output_content = '\n'.join(lines)
    OUTPUT_FILE.write_text(output_content, encoding='utf-8')

    print(f"✓ Generated {OUTPUT_FILE}")
    print("\nNext steps:")
    print("  1. Review cv.typ and add personal info (phone, address)")
    print("  2. Run: typst compile cv.typ output/cv.pdf")
    print("  3. Or run: ./build-cv.sh (compiles automatically)")


if __name__ == "__main__":
    main()
