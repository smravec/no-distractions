## CHROME
# Clean up
rm -rf ./builds/no-distractions-chrome

# Create temporary directory
mkdir -p ./builds/no-distractions-chrome

# Copy all files except manifest.json to temp directory
cp ./assets/* manifest.json popup.js popup.html popup.css background.js ./builds/no-distractions-chrome/
cp -r  js css ./builds/no-distractions-chrome/


## FIREFOX
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
mkdir -p ../builds/no-distractions-firefox
cp -r ./* ../builds/no-distractions-firefox/.
zip -r ../builds/no-distractions-firefox.xpi *
cd ..

# Clean up
rm -rf temp_dir