import { MapboxLayer } from "@deck.gl/mapbox";
import { TripsLayer } from "@deck.gl/geo-layers";
import * as mobilityData from "../../assets/modules_json_backup/mobility_service.json";

export class TripsDeckGlLayer {
  // https://github.com/uber/deck.gl/blob/master/docs/api-reference/mapbox/mapbox-layer.md
  // https://github.com/uber/deck.gl/blob/master/docs/api-reference/mapbox/overview.md?source=post_page---------------------------#using-with-pure-js

  json: any = mobilityData;

  public static createTripsLayer(layerId): MapboxLayer {
    const DATA_URL = {
      TRIPS:
        // "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips.json" // eslint-disable-line
        "https://cityio.media.mit.edu/api/table/grasbrook/trips"
      // "https://cityio.media.mit.edu/api/table/grasbrook/cityIO_Gama_Hamburg"
    };

    function renderLayers() {
      let loopLength = 4 * 60 * 60;
      let animationSpeed = 50;
      const timestamp = Date.now() / 1000;
      const loopTime = loopLength / animationSpeed;
      let time = 30000 + ((timestamp % loopTime) / loopTime) * loopLength;

      tripLayer.setProps({
        currentTime: time
      });
    }

    const tripLayer = new MapboxLayer({
      type: TripsLayer,
      id: layerId,
      data: DATA_URL.TRIPS,
      getPath: d => d.segments,
      getColor: d => {
        switch (d.mode) {
          case 0:
            return [255, 0, 255];
          case 1:
            return [60, 128, 255];
          case 2:
            return [153, 255, 51];
          case 3:
            return [153, 180, 100];
        }
      },
      opacity: 0.5,
      widthMinPixels: 4,
      rounded: true,
      trailLength: 500,
      currentTime: 0
    });

    // start animation loop
    setInterval(() => {
      renderLayers();
    });

    return tripLayer;
  }
}
