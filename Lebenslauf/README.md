# CV Generation with Typst

This directory contains the CV generation system using Typst and data from `../src/content/`.
Programs and awards are read from `../src/content/misc/data.json`.

## Quick Start

```bash
# Install Typst (if not already installed)
curl -fsSL https://typst.app/install.sh | sh

# Generate CVs
./build-cv.sh

# Or compile manually
typst compile cv.typ output/cv.pdf
typst compile cv_ats.typ output/cv_ats.pdf

# Watch mode (auto-recompile on changes)
typst watch cv.typ output/cv.pdf
```

## Structure

- `cv.typ` - Main CV document (generated from JSON data)
- `cv_ats.typ` - ATS-focused CV document (generated from JSON data)
- `template.typ` - Reusable styling and functions
- `build-cv.sh` - Build script that converts JSON → Typst
- `output/` - Generated PDFs
- `personal.typ` - Personal info (address, phone) - NOT in git

## JSON Schema Extension

To use CV-specific concise text instead of website text, add optional `cvText` or `cvDescription` fields to your JSON files. For the ATS version, you can also add `atsText` or `atsDescription` to be even more explicit:

```json
{
  "description": "Long website description with full details...",
  "cvDescription": "Concise CV version",
  "atsDescription": "Expanded ATS version with keywords and tools",
  "achievements": [
    "Full website achievement text",
    {
      "text": "Full website achievement",
      "cvText": "Concise CV bullet",
      "atsText": "Expanded ATS bullet with keyword details"
    }
  ]
}
```

The build script will prefer `atsText`/`atsDescription` for the ATS version, then `cvText`/`cvDescription`, and fall back to the regular fields. For the intro summary, you can add `atsSummary` in `src/content/intro/data.json`.

## Customization

Edit `template.typ` to change:
- Colors, fonts, spacing
- Section layouts
- Header/footer styles

Edit `personal.typ` to add:
- Full address
- Phone number
- Other contact details
