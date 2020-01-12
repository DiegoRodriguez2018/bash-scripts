#!/bin/bash

# This script retrieves the NASA image of the day and set it as cinnamon desktop background.

# NASA API
NASA_URL=https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY

rm data.json

echo "$(curl -s $NASA_URL)" >> data.json

# using python to parse json and extract url
IMAGE_URL="$(cat data.json | \
python3 -c "import sys, json; print(json.load(sys.stdin)['url'])")" 

echo Downloading $IMAGE_URL
wget $IMAGE_URL -O background.jpg


echo Setting background
path="$(pwd)/background.jpg"
uri="$(python -c "import urllib;print urllib.quote(raw_input())" <<< "$path")"

# Setting the background with gsettings
gsettings set org.cinnamon.desktop.background picture-uri "file:///$uri"