# Create temporary directory
mkdir -p temp_dir

# Copy all files except manifest.json to temp directory
cp default_icon.png popup.js popup.html popup.css temp_dir/
cp -r scripts css temp_dir/

# Copy manifest-firefox.json as manifest.json to temp directory
cp manifest-firefox.json temp_dir/manifest.json

# Create zip from temp directory
cd temp_dir
zip -r ../no-distractions.xpi *
cd ..

# Clean up
rm -rf temp_dir