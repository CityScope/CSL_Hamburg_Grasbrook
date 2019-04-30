import {Injectable} from "@angular/core";
import {CsLayer} from "../../typings";
import {GridLayerService} from "./grid-layer.service";
import {ConfigurationService} from "./configuration.service";

@Injectable({
  providedIn: "root"
})
export class LayerLoaderService  {

  constructor(
    private cityio: GridLayerService,
    private config: ConfigurationService) {}

  getLayers(): CsLayer[] {
    const layers: CsLayer[] = [];

    const cityioLayer = this.cityio.getGridLayer();

    // TODO: This should maybe come from cityIo or be configured by default
    cityioLayer.addOnMapInitialisation = true;

    layers.push(cityioLayer);
    Array.prototype.push.apply(layers, this.config.layers);

    return layers;
  }

}
