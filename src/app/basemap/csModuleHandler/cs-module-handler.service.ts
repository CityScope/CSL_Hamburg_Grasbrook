import { Injectable } from "@angular/core";
import { CityioService } from "./cityio/cityio.service";
import { TestHeatmapService } from "./testHeatmap/test-heatmap.service";
@Injectable({
  providedIn: "root"
})
export class CSModuleHandler {
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
