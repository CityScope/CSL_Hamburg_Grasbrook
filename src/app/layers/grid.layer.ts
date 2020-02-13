import gridGeoJSON from "../../assets/layers_json/geojson_grid.json";

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
        "fill-extrusion-base": 1,
        "fill-extrusion-opacity": 0.8,
        "fill-extrusion-vertical-gradient": true
      },
      source: {
        type: "geojson",
        data: gridGeoJSON
      },
      legend: {
        type: "rect",
        styleField: ["building_uses", "open_space_uses"],
        styleValues: [{
            styleFieldValue: "residential",
            color: "#FF6E40",
            label: "Building: Residential"
          },
          {
            styleFieldValue: "commercial",
            color: "#FF5252",
            label: "Building: Commercial"
          },
            {
            styleFieldValue: "office",
            color: "#FF4081",
            label: "Building: Offices"
          },
          {
            styleFieldValue: "educational",
            color: "#40C4FF",
            label: "Building: Education"
          },
          {
            styleFieldValue: "culture",
            color: "#7C4DFF",
            label: "Building: Culture"
          },
          {
            styleFieldValue: "green_space",
            color: "#69F0AE",
            label: "Open space: Green Space"
          },
          {
            styleFieldValue: "promenade",
            color: "#48A377",
            label: "Open space: Promenade"
          },
          {
            styleFieldValue: "athletic_field",
            color: "#AFF7D3",
            label: "Open space: Athletic Field"
          },
          { 
            styleFieldValue: "playground",
            color: "#AFF7D3",
            label: "Open space: Playground"
          },
          { 
            styleFieldValue: "daycare-playground",
            color: "#AFF7D3",
            label: "Open space: Daycare Playground"
          },
          {
            styleFieldValue: "schoolyard",
            color: "#AFF7D3",
            label: "Open space: Schoolyard"
          },
          {
            styleFieldValue: "exhibition_space",
            color: "#A3A5FF",
            label: "Open space: Exhibition Space"
          },
          {
            styleFieldValue: "recycling_center",
            color: "#4D4D4D",
            label: "Open space: Recycling Center"
          },
          {
            styleFieldValue: "water",
            color: "#9FE1FF",
            label: "Open space: Water"
          }
        ]
      }
    };
    return gridLayer;
  }
}
