import json
import random

# Load your JSON data
with open('reprojected_WECA.json', 'r') as f:
    geojson = json.load(f)

# Define the list of colors
colors = [
    "#5D61B6",
    "#353EA4",
    "#202562"
]

# Add unique IDs and random 'susycolor' property
for i, feature in enumerate(geojson['features'], start=1):
    feature['id'] = i  # Assigning the ID as an integer
    feature['properties']['susycolor'] = random.choice(colors)  # Add a random color from the list

# Save the updated JSON
with open('OA_w_ids.json', 'w') as f:
    json.dump(geojson, f, indent=2)

print(f"Added unique IDs and random 'susycolor' to {len(geojson['features'])} features.")
