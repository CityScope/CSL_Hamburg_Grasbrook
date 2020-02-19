import accessJSON from "../../assets/layers_json/access.json";

export class AccessLayer {
  public static createAccessLayer(layerId): any {
    const accessLayer: any = {
      id: "Education Access",
      type: "circle",
      source: {
        type: "geojson",
        data: accessJSON
        // TODO - if this layer is to be activated as CSLayer - set "loadFromCityIo" : true;
        // data: "https://cityio.media.mit.edu/api/table/grasbrook/access"
      },
      paint: {
        "circle-translate": [0, 0],
        "circle-radius": {
          property: "education",
          stops: [
            [{ zoom: 8, value: 0 }, 0.1],
            [{ zoom: 8, value: 1 }, 1],
            [{ zoom: 11, value: 0 }, 0.5],
            [{ zoom: 11, value: 1 }, 2],
            [{ zoom: 16, value: 0 }, 3],
            [{ zoom: 16, value: 1 }, 9]
          ]
        },
        "circle-color": {
          property: "education",
          stops: [[0, "red"], [0.5, "yellow"], [1, "green"]]
        }
      },
      hasReloadInterval: false,
      showInLayerList: true,
      addOnMapInitialisation: false
    };
    return accessLayer;
  }
}
