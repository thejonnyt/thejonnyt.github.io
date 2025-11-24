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

# Step 3: Create output directory
mkdir -p output

# Step 4: Compile to PDF
echo "[2/3] Compiling Typst to PDF..."
typst compile cv.typ output/cv.pdf

echo "[3/3] Done!"
echo ""
echo "✓ CV generated: output/cv.pdf"
echo ""
echo "To view:"
echo "  xdg-open output/cv.pdf  # Linux"
echo "  open output/cv.pdf      # macOS"
echo ""
echo "To watch for changes:"
echo "  typst watch cv.typ output/cv.pdf"
