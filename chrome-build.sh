# Clean up
rm -rf no-distraction

# Create temporary directory
mkdir -p no-distraction

# Copy all files except manifest.json to temp directory
cp default_icon.png popup.js popup.html popup.css manifest.json no-distraction/
cp -r js css no-distraction/



