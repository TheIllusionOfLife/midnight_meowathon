#!/bin/bash

# Build script for itch.io deployment
# Creates a zip file ready for upload

cd "$(dirname "$0")"

OUTPUT="midnight_meowathon.zip"

# Remove old build if exists
rm -f "$OUTPUT"

# Create zip with only necessary game files
zip -r "$OUTPUT" index.html css js

echo "Created $OUTPUT"
echo "Upload this file to itch.io as an HTML game."
