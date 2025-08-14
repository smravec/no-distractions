#!/bin/bash

# Path to the folder to zip
FOLDER="builds/no-distractions-chrome"
ZIP_NAME="builds/no-distractions-chrome.zip"

# Remove any existing zip file
rm -f "$ZIP_NAME"

# Zip the folder, preserving directory structure
zip -r "$ZIP_NAME" "$FOLDER"

echo "Zipped $FOLDER to $ZIP_NAME"
