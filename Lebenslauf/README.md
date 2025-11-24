# CV Generation with Typst

This directory contains the CV generation system using Typst and data from `../src/content/`.

## Quick Start

```bash
# Install Typst (if not already installed)
curl -fsSL https://typst.app/install.sh | sh

# Generate CV
./build-cv.sh

# Or compile manually
typst compile cv.typ output/cv.pdf

# Watch mode (auto-recompile on changes)
typst watch cv.typ output/cv.pdf
```

## Structure

- `cv.typ` - Main CV document (generated from JSON data)
- `template.typ` - Reusable styling and functions
- `build-cv.sh` - Build script that converts JSON → Typst
- `output/` - Generated PDFs
- `personal.typ` - Personal info (address, phone) - NOT in git

## JSON Schema Extension

To use CV-specific concise text instead of website text, add optional `cvText` or `cvDescription` fields to your JSON files:

```json
{
  "description": "Long website description with full details...",
  "cvDescription": "Concise CV version",
  "achievements": [
    "Full website achievement text",
    {
      "text": "Full website achievement",
      "cvText": "Concise CV bullet"
    }
  ]
}
```

The build script will prefer `cvText`/`cvDescription` when available, falling back to the regular fields.

## Customization

Edit `template.typ` to change:
- Colors, fonts, spacing
- Section layouts
- Header/footer styles

Edit `personal.typ` to add:
- Full address
- Phone number
- Other contact details
