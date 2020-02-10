import { Injectable } from "@angular/core";
import { CsLayer } from "../../typings";
import { ConfigurationService } from "./configuration.service";
import { TripsDeckGlLayer } from "../layers/trips.deck-gl.layer";
import { GamaDeckGlLayer } from "../layers/gama.deck-gl.layer";
import { GridLayer } from "../layers/grid.layer";
import { AccessLayer } from "../layers/access.layer";
import {GeoJSONSourceRaw} from "mapbox-gl/"
import {FillExtrusionPaint} from "mapbox-gl/"

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
          "Design area",
          true
        );
      } else if (layer.id === "access") {
        let accessLayer = AccessLayer.createAccessLayer(layer.id);
        layers[layers.indexOf(layer)] = this.castCSLayer(
          accessLayer,
          layer.id,
          false
        );
        // create all layers of grouped layers
      } else if (layer.groupedLayersData) {
        layer.groupedLayers = [];

        for (let dataset of layer.groupedLayersData) {
          let subLayer: CsLayer = JSON.parse(JSON.stringify(layer));
          subLayer.addOnMapInitialisation = false;
          subLayer.showInLayerList = false;
          subLayer.id = dataset['id'];
          subLayer.reloadUrl = dataset['url'];
          subLayer.legend.description = dataset['legendDescription'];
          subLayer.legend.styleField = dataset['styleField'];
          (subLayer.source as GeoJSONSourceRaw).data = dataset['url'];
          (subLayer.paint as FillExtrusionPaint)['fill-extrusion-color'].property = dataset['propertyToDisplay'];

          layer.groupedLayers.push(subLayer);
        }
      }
    }

    for (let layer of layers) {
      this.setUserUrlForLayer(layer);
    }

    console.log("layers returned by layer loader");
    console.log(layers);

    return layers;
  }

  setUserUrlForLayer(layer) {
    let source = layer.source
    console.log(source)
    if((source as mapboxgl.Source).type === "geojson") {
      let data = (source as GeoJSONSourceRaw).data
      console.log(data)
      if (JSON.parse(localStorage.getItem("currentUser"))['tables'].length > 0) {
        // if (!(layer.id in this.urls)) {
        // this.urls[layer.id] = data;
        // }
        (source as mapboxgl.GeoJSONSourceRaw).data = (data as string).replace('grasbrook_test', JSON.parse(localStorage.getItem('currentUser'))['tables'][0]);
      }
      // else {
      //   (source as mapboxgl.GeoJSONSourceRaw).data = this.urls[layer.id];
      // }
    }
  }

  castCSLayer(layer, displayName, showOnInit) {
    let csLayer: CsLayer = layer;
    csLayer.addOnMapInitialisation = showOnInit;
    csLayer.showInLayerList = true;
    csLayer.displayName = displayName;
    return csLayer;
  }
}
