import { Injectable } from "@angular/core";
import { CsLayer } from "../../typings";
import { ConfigurationService } from "./configuration.service";
import { TripsDeckGlLayer } from "../layers/trips.deck-gl.layer";
import { GamaDeckGlLayer } from "../layers/gama.deck-gl.layer";
import { GridLayer } from "../layers/grid.layer";
import { AccessLayer } from "../layers/access.layer";

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
        let tripsDeck = TripsDeckGlLayer.createTripsLayer(layer.id);
        layers[layers.indexOf(layer)] = this.castCSLayer(
          tripsDeck,
          layer.id,
          false
        );
      } else if (layer.id === "gama-deckgl") {
        let gamaDeck = GamaDeckGlLayer.createTripsLayer(layer.id);
        layers[layers.indexOf(layer)] = this.castCSLayer(
          gamaDeck,
          layer.id,
          false
        );
      } else if (layer.id === "grid") {
        let gridLayer = GridLayer.createGridLayer(layer.id);
        layers[layers.indexOf(layer)] = this.castCSLayer(
          gridLayer,
          layer.id,
          true
        );
      } else if (layer.id === "access") {
        let accessLayer = AccessLayer.createAccessLayer(layer.id);
        layers[layers.indexOf(layer)] = this.castCSLayer(
          accessLayer,
          layer.id,
          true
        );
      }
    }
    return layers;
  }

  castCSLayer(layer, displayName, showOnInit) {
    let csLayer: CsLayer = layer;
    csLayer.addOnMapInitialisation = showOnInit;
    csLayer.showInLayerList = true;
    csLayer.displayName = displayName;
    return csLayer;
  }
}
