import gridGeoJSON from "../../assets/modules_json_backup/geojson_grid.json";

export class GridLayer {
  public static createGridLayer(layerId): any {
    const gridLayer: any = {
      id: layerId,
      displayName: "grid",
      showInLayerList: true,
      addOnMapInitialisation: true,
      type: "fill-extrusion",
      paint: {
        "fill-extrusion-color": ["get", "color"],
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": 5,
        "fill-extrusion-opacity": 0.95
      },
      source: {
        type: "geojson",
        data: gridGeoJSON
      }
    };
    return gridLayer;
  }
}
