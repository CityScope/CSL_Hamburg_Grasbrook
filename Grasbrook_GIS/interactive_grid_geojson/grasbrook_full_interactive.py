import json
import os
import sys
import requests
file_dir = os.path.dirname('grid_geojson')
sys.path.append(file_dir)
from module.grid_geojson import *  # nopep8

# =============================================================================
# Full Interactive Grid
# =============================================================================

top_left_lon = 10.006299477123012
top_left_lat = 53.53810980906281

nrows = 78
ncols = 44
rotation = 145.5
cell_size = 16
crs_epsg = '31468'
properties = {
    'id': [i for i in range(nrows*ncols)],
    'usage': [0 for i in range(nrows*ncols)],
    'height': [5 for i in range(nrows*ncols)],
    'pop_density': [2 for i in range(nrows*ncols)]}
crs_epsg = '31468'
col_margin_left = 0  # columns to add to left of interactive grid to create full grid
row_margin_top = 0  # rows to add to top of interactive grid to create full grid
grasbrook_grid = Grid(top_left_lon, top_left_lat, rotation,
                      crs_epsg, cell_size, nrows, ncols)
grasbrook_grid.extend_int_grid_to_full(
    col_margin_left,  row_margin_top, nrows, ncols)
meta_map = json.dumps(grasbrook_grid.int_to_meta_map)
grid_geo = grasbrook_grid.get_grid_geojson(properties)

# Convert to string format
grid_geo_str = json.dumps(grid_geo)
f = open("meta_grid.json", "w+")
f.write(grid_geo_str)
f.close()

f = open("grid_map.json", "w+")
f.write(meta_map)
f.close()
