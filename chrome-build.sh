# Clean up
rm -rf no-distractions

# Create temporary directory
mkdir -p no-distractions

# Copy all files except manifest.json to temp directory
cp no_distractions_logo.png popup.js popup.html popup.css manifest.json background.js no-distractions/
cp -r js css no-distractions/



