# Create temporary directory
mkdir -p temp_dir

# Copy all files except manifest.json to temp directory
cp no_distractions_logo.png popup.js popup.html background.js temp_dir/
cp -r js css temp_dir/

cp popup-firefox.css temp_dir/popup.css

# Copy manifest-firefox.json as manifest.json to temp directory
cp manifest-firefox.json temp_dir/manifest.json

# Create zip from temp directory
cd temp_dir
zip -r ../builds/no-distractions-firefox.xpi *
cd ..

# Clean up
rm -rf temp_dir