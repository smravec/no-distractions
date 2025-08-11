# Clean up
rm -rf ./builds/no-distractions-chrome

# Create temporary directory
mkdir -p ./builds/no-distractions-chrome

# Copy all files except manifest.json to temp directory
cp no_distractions_logo.png manifest.json popup.js popup.html popup.css background.js ./builds/no-distractions-chrome/
cp -r js css ./builds/no-distractions-chrome/



