import { Injectable } from "@angular/core";
import { CityioService } from "./grid/grid.service";
import { TestHeatmapService } from "./testHeatmap/test-heatmap.service";
import {CsLayer} from "../../../typings";
import {ConfigurationService} from "../service/configuration.service";

@Injectable({
  providedIn: "root"
})
export class ModuleDataToMapHandler {
  constructor(
    private cityio: CityioService,
    private TestHeatmapService: TestHeatmapService,
    private config: ConfigurationService) {}

  getLayers(): CsLayer[] {
    const layers: CsLayer[] = [];

    const cityioLayer = this.cityio.getLayer();

    // TODO: This should maybe come from cityIo or be configured by default
    cityioLayer.addOnMapInitialisation = true;

    layers.push(cityioLayer);
    Array.prototype.push.apply(layers, this.config.layers)

    // TODO: get the HeatMap in the Layerlist as well
    const testHeatmapService = this.TestHeatmapService.getLayer();

    return layers;
  }

}
