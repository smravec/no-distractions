#!/bin/bash

#Chrome

# Remove any existing zip file
rm -f builds/no-distractions-chrome.zip

# Zip the folder, preserving directory structure
zip -r builds/no-distractions-chrome.zip builds/no-distractions-chrome

echo "Zipped builds/no-distractions-chrome to builds/no-distractions-chrome.zip"

#Firefox
# Remove any existing zip file
rm -f builds/no-distractions-firefox.zip

# Zip the folder, preserving directory structure
zip -r builds/no-distractions-firefox.zip builds/no-distractions-firefox

echo "Zipped builds/no-distractions-firefox to builds/no-distractions-firefox.zip"