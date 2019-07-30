// **************************************
//! DeckGL imports
import { MapboxLayer } from "@deck.gl/mapbox";
import { TripsLayer } from "@deck.gl/geo-layers";
import { CsLayer } from "../../typings";

// **************************************

export class GamaDeckGlLayer {
  // **************************************

  public static createTripsLayer(): CsLayer {
    const DATA_URL = {
      TRIPS:
        "https://cityio.media.mit.edu/api/table/grasbrook/cityIO_Gama_Hamburg"
    };

    function renderLayers() {
      let loopLength = 500;
      let animationSpeed = 50;
      const timestamp = Date.now() / 1000;
      const loopTime = loopLength / animationSpeed;
      let time = ((timestamp % loopTime) / loopTime) * loopLength;

      tripLayer.setProps({
        currentTime: time
      });
    }

    const tripLayer = new MapboxLayer({
      type: TripsLayer,
      id: "gama",
      data: DATA_URL.TRIPS,
      getPath: d => d.segments,
      getColor: d => {
        switch (d.profile) {
          case 0:
            return [255, 0, 255];
          case 1:
            return [60, 128, 255];
          case 2:
            return [153, 255, 51];
          case 3:
            return [153, 180, 100];
          case 4:
            return [0, 250, 100];
        }
      },
      opacity: 0.5,
      widthMinPixels: 2,
      rounded: true,
      trailLength: 50,
      currentTime: 0
    });

    // start animation loop
    setInterval(() => {
      renderLayers();
    });

    let csLayer: CsLayer = tripLayer;
    csLayer.addOnMapInitialisation = true;
    csLayer.showInLayerList = true;
    csLayer.displayName = "gama";
    return csLayer;

    // **************************************
  }
}
