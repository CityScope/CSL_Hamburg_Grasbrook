import { Injectable } from '@angular/core';
import { CityioService } from '../cityio/cityio.service'

@Injectable({
  providedIn: 'root'
})
export class ModuleDataToMapHandler {
  constructor(private cityio: CityioService) { }

  getLayers(): [object] {
    const cityioLayer = this.cityio.getLayer();
    return [cityioLayer];
  }
}
