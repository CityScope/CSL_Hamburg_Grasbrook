import { Injectable } from '@angular/core';
import config from '../../config.json';
import {CsLayer} from "../../../typings";

@Injectable()
export class ConfigurationService {

  mapCenter: [number, number];
  mapZoom: number;
  bearing: number;
  pitch: number;
  style: string;

  layers: CsLayer[];

  constructor() {
    for (const key in config) {
      if (config.hasOwnProperty(key)) {
        this[key] = config[key];
      }
    }
  }

}
