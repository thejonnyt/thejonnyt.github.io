#!/bin/bash
# Build script: JSON → Typst → PDF

set -e

cd "$(dirname "$0")"

echo "=== CV Build Pipeline ==="
echo ""

# Step 1: Generate Typst from JSON
echo "[1/3] Converting JSON data to Typst..."
python3 build-cv.py

# Step 2: Check if Typst is installed
if ! command -v typst &> /dev/null; then
    echo ""
    echo "Error: Typst is not installed."
    echo "Install with: curl -fsSL https://typst.app/install.sh | sh"
    echo "Or visit: https://github.com/typst/typst#installation"
    exit 1
fi

# Step 3: Create output directories
echo "[2/4] Creating output directories..."
mkdir -p output
mkdir -p ../public/files

# Step 4: Compile to PDF (outputs to both local and public directories)
echo "[3/4] Compiling Typst to PDF..."
typst compile cv_ats.typ ../public/files/Johannes_Tauscher_CV.pdf
typst compile cv.typ output/cv_human.pdf
typst compile cv_ats.typ output/cv_ats.pdf

# Also create a local copy for convenience
cp ../public/files/Johannes_Tauscher_CV.pdf output/cv.pdf

echo "[4/4] Done!"
echo ""
echo "✓ CV generated: ../public/files/Johannes_Tauscher_CV.pdf"
echo "✓ Local copy: output/cv.pdf"
echo "✓ Local copy: output/cv_human.pdf"
echo "✓ Local copy: output/cv_ats.pdf"
echo ""
echo "To view:"
echo "  xdg-open ../public/files/Johannes_Tauscher_CV.pdf      # Linux"
echo "  xdg-open output/cv_human.pdf                           # Linux"
echo "  xdg-open output/cv_ats.pdf                             # Linux"
echo "  open ../public/files/Johannes_Tauscher_CV.pdf          # macOS"
echo "  open output/cv_human.pdf                               # macOS"
echo "  open output/cv_ats.pdf                                 # macOS"
echo ""
echo "To watch for changes:"
echo "  typst watch cv_ats.typ ../public/files/Johannes_Tauscher_CV.pdf"
echo "  typst watch cv.typ output/cv_human.pdf"
echo "  typst watch cv_ats.typ output/cv_ats.pdf"
