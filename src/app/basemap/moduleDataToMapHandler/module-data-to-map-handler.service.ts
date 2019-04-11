import { Injectable } from "@angular/core";
import { CityioService } from "./grid/grid.service";
import { TestHeatmapService } from "./testHeatmap/test-heatmap.service";
@Injectable({
  providedIn: "root"
})
export class ModuleDataToMapHandler {
  constructor(
    private cityio: CityioService,
    private TestHeatmapService: TestHeatmapService
  ) {}

  getLayers(): [object] {
    const testHeatmapService = this.TestHeatmapService.getLayer();
    const cityioLayer = this.cityio.getLayer();
    return [cityioLayer];
  }
}
