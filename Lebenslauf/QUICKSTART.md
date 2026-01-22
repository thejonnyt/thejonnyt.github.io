# CV Quick Start Guide

## Your CV is Ready!

Your CVs have been generated at: `output/cv.pdf` and `output/cv_ats.pdf`

## Making Changes

### Option 1: Quick edits (for immediate changes)
Edit the generated `cv.typ` file directly and recompile:
```bash
typst compile cv.typ output/cv.pdf
typst compile cv_ats.typ output/cv_ats.pdf
```

### Option 2: Update JSON data (recommended for content updates)
1. Edit your JSON files in `../src/content/`:
   - `intro/data.json` - Name, title, contact info
   - `experience/data.json` - Work experience
   - `education/data.json` - Education
   - `skillsDatabase.json` - Skills

2. Rebuild:
```bash
./build-cv.sh
```

### Option 3: CV-specific text (for concise versions)
Add `cvDescription` or `cvText` fields to your JSON. For the ATS version, you can use `atsDescription` or `atsText`:

```json
{
  "description": "Long description for website...",
  "cvDescription": "Concise version for CV",
  "achievements": [
    {
      "text": "Long achievement description",
      "cvText": "Short bullet point",
      "atsText": "Expanded ATS bullet point with keywords"
    }
  ]
}
```

## Customization

### Add Personal Information
Edit lines 12-13 in `cv.typ`:
```typst
  phone: "+49 XXX XXXXXXX",
  address: "Your Street, City, ZIP",
```

### Change Colors/Fonts/Layout
Edit `template.typ`:
- Line 4: `accent-color` - Main accent color
- Line 10-11: Fonts
- Line 23: Page margins
- Line 29: Font size

### Watch Mode (auto-recompile on save)
```bash
typst watch cv.typ output/cv.pdf
```

## Current Status

Generated from your data:
- ✅ Professional Experience (8 positions)
- ✅ Education (3 degrees)
- ✅ Technical Skills (7 categories)
- ✅ Professional formatting with dates, locations
- ✅ Technologies listed for each role
- ✅ Achievements as bullet points

## Next Steps

1. **Review** the PDFs: `xdg-open output/cv.pdf` and `xdg-open output/cv_ats.pdf`
2. **Add** phone number and address (optional)
3. **Customize** colors/fonts in template.typ
4. **Refine** content:
   - Make descriptions more concise using `cvDescription` fields
   - Highlight key achievements
   - Adjust which skills are featured
