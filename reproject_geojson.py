import json
import sys
from pyproj import Transformer
from shapely.geometry import shape, mapping
from shapely.ops import transform

def reproject_geometry(geometry, transformer):
    geom = shape(geometry)
    reprojected_geom = transform(transformer.transform, geom)
    return mapping(reprojected_geom)

def reproject_geojson(input_file, output_file, from_epsg="EPSG:27700", to_epsg="EPSG:4326"):
    transformer = Transformer.from_crs(from_epsg, to_epsg, always_xy=True)

    with open(input_file, 'r') as f:
        geojson_data = json.load(f)
    
    if 'features' in geojson_data:
        for feature in geojson_data['features']:
            feature['geometry'] = reproject_geometry(feature['geometry'], transformer)

    with open(output_file, 'w') as f:
        json.dump(geojson_data, f, separators=(',', ':'))

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python reproject_geojson.py <input.geojson> <output.geojson>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    reproject_geojson(input_file, output_file)
