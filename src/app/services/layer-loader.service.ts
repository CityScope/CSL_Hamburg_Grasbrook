import { Injectable } from "@angular/core";
import { CsLayer } from "../../typings";
import { ConfigurationService } from "./configuration.service";

@Injectable({
  providedIn: "root"
})
export class LayerLoaderService {
  constructor(private config: ConfigurationService) {}

  getLayers(): CsLayer[] {
    const layers: CsLayer[] = [];
    Array.prototype.push.apply(layers, this.config.layers);

    return layers;
  }
}
