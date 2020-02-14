import { Injectable } from "@angular/core";
import { CsLayer } from "../../typings";
import { ConfigurationService } from "./configuration.service";
import { TripsDeckGlLayer } from "../layers/trips.deck-gl.layer";
import { GamaDeckGlLayer } from "../layers/gama.deck-gl.layer";
import { GridLayer } from "../layers/grid.layer";
import { AccessLayer } from "../layers/access.layer";
import {GeoJSONSourceRaw, ImageSource, RasterSource} from 'mapbox-gl/';
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
        // create all CsLayer for grouped layers
      } else if (layer.groupedLayersData) {
        layer.groupedLayers = [];

        for (const dataset of layer.groupedLayersData) {
          const subLayer: CsLayer = JSON.parse(JSON.stringify(layer));

          // delete irrelevant information
          subLayer.groupedLayers = [];
          subLayer.groupedLayersData = [];

          // add data for sublayer
          subLayer.addOnMapInitialisation = false;
          subLayer.showInLayerList = false;
          subLayer.id = dataset['id'];
          subLayer.displayName = dataset['displayName'];
          subLayer.reloadUrl = dataset['url'];
          subLayer.legend.description = dataset['legendDescription'];
          subLayer.legend.styleField = dataset['legendStyleField'];

          if (subLayer.type === "fill-extrusion" && subLayer.sourceType === 'geojson') {
            (subLayer.source as GeoJSONSourceRaw).data = dataset['url'];
            (subLayer.paint as FillExtrusionPaint)['fill-extrusion-color']['property'] = dataset['propertyToDisplay'];
          }
          if (subLayer.type === 'raster') {
            (subLayer.source as RasterSource).url = dataset.url;
          }

          // add sublayer to groupedLayers of layer
          layer.groupedLayers.push(subLayer);
        }
      }
    }

    // sets the user specific cityIO endpoint
    for (const layer of layers) {
      this.setUserUrlForLayer(layer);
    }

    return layers;
  }

  setUserUrlForLayer(layer) {
    let source = layer.source
    console.log(source)
    if((source as mapboxgl.Source).type === "geojson") {
      let data = (source as GeoJSONSourceRaw).data
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
