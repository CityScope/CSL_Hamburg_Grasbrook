import { Injectable } from "@angular/core";
import { CsLayer } from "../../typings";
import { GridLayer } from '../layer/grid.layer';
import { ConfigurationService } from "./configuration.service";

@Injectable({
  providedIn: "root"
})
export class LayerLoaderService  {

  constructor(
    private gridMaker: GridLayer,
    private config: ConfigurationService) {}

  getLayers(): CsLayer[] {
    const layers: CsLayer[] = [];
    const cityioLayer = this.gridMaker.makeGridFromCityIO();
    layers.push(cityioLayer);
    Array.prototype.push.apply(layers, this.config.layers);

    return layers;
  }
}
