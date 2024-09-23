import json
import sys
from shapely.geometry import shape, mapping
from shapely.ops import transform
import pyproj

def simplify_geometry(geometry, tolerance):
    geom = shape(geometry)
    simplified = geom.simplify(tolerance, preserve_topology=True)
    return mapping(simplified)

def process_feature(feature, precision, tolerance):
    if 'geometry' in feature:
        feature['geometry'] = simplify_geometry(feature['geometry'], tolerance)
    return feature

def reduce_geojson_precision(input_file, output_file, precision, tolerance):
    with open(input_file, 'r') as f:
        geojson_data = json.load(f)
    
    total_features = len(geojson_data.get('features', []))
    
    if 'features' in geojson_data:
        for i, feature in enumerate(geojson_data['features']):
            geojson_data['features'][i] = process_feature(feature, precision, tolerance)
            progress = (i + 1) / total_features * 100
            sys.stdout.write(f'\rProcessing features: {progress:.2f}% complete')
            sys.stdout.flush()
        print()  
    elif 'geometry' in geojson_data:
        geojson_data['geometry'] = simplify_geometry(geojson_data['geometry'], tolerance)

    with open(output_file, 'w') as f:
        json.dump(geojson_data, f, separators=(',', ':'))

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python reduce_geojson.py <input.geojson> <output.geojson> <precision> <tolerance>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    precision = int(sys.argv[3])
    tolerance = float(sys.argv[4])

    reduce_geojson_precision(input_file, output_file, precision, tolerance)
