# Personal Portfolio & Resume

My personal website and online resume, built with [Astro](https://astro.build) and deployed to GitHub Pages.

**Live site:** https://thejonnyt.github.io

## Tech Stack

- **Astro** - Modern static site generator
- **TypeScript** - Type-safe development
- **JSON** - Content management system
- **CSS** - Minimalist, clean design with dark mode support

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Content Structure

All content is managed through JSON files in `src/content/`:

- `intro/` - Personal information and bio
- `education/` - Educational background
- `experience/` - Work experience
- `projects/` - Project showcase
- `publications/` - Academic publications
- `skills/` - Skills and technologies
- `misc/` - Awards, certifications, speaking engagements

To update the site, simply edit the relevant JSON file and commit your changes.

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions.

## Development Guide

See [CLAUDE.md](./CLAUDE.md) for detailed development instructions and architecture information.
