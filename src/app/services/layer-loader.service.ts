import { Injectable } from "@angular/core";
import { CsLayer } from "../../typings";
import { ConfigurationService } from "./configuration.service";
import { TripsDeckGlLayer } from "../layers/trips.deck-gl.layer";
import { GamaDeckGlLayer } from "../layers/gama.deck-gl.layer";

@Injectable({
  providedIn: "root"
})
export class LayerLoaderService {
  constructor(private config: ConfigurationService) {}

  getLayers(): CsLayer[] {
    const layers: CsLayer[] = [];
    Array.prototype.push.apply(layers, this.config.layers);

    for (let layer of layers) {
      if (layer.id === "trips-deckgl") {
        let tripsDeck = TripsDeckGlLayer.createTripsLayer();
        layers[layers.indexOf(layer)] = this.castCSLayer(tripsDeck, "trips");
      } else if (layer.id === "gama-deckgl") {
        let gamaDeck = GamaDeckGlLayer.createTripsLayer();
        layers[layers.indexOf(layer)] = this.castCSLayer(gamaDeck, "gama");
      }
    }
    return layers;
  }

  castCSLayer(layer, displayName) {
    let csLayer: CsLayer = layer;
    csLayer.addOnMapInitialisation = true;
    csLayer.showInLayerList = true;
    csLayer.displayName = displayName;
    return csLayer;
  }
}
