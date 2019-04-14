import {AfterViewInit, Component, OnInit} from "@angular/core";
import { environment } from "../../environments/environment";
import * as mapboxgl from "mapbox-gl";
import { CityioService } from "./moduleDataToMapHandler/grid/grid.service";
import { ModuleDataToMapHandler } from "./moduleDataToMapHandler/module-data-to-map-handler.service";
import * as Maptastic from "maptastic/dist/maptastic.min.js";
import {ConfigurationService} from "./service/configuration.service";
import {CsLayer} from "../../typings";
import {Layer} from "mapbox-gl";

@Component({
  selector: "app-basemap",
  templateUrl: "./basemap.component.html",
  styleUrls: ["./basemap.component.css"]
})
export class BasemapComponent implements OnInit, AfterViewInit {
  map: mapboxgl.Map;
  style = "mapbox://styles/relnox/cjs9rb33k2pix1fo833uweyjd";
  mapKeyLayer: CsLayer;
  mapKeyVisible: boolean;
  layers: CsLayer[];

  // Map config
  center: any;
  zoom: number;
  pitch: number;
  bearing: number;

  initialExtrusionHeight: any = null;

  constructor(
    private cityioService: CityioService,
    private moduleHandler: ModuleDataToMapHandler,
    private config: ConfigurationService) {
    // get the acess token
    // mapboxgl.accessToken = environment.mapbox.accessToken;
    (mapboxgl as typeof mapboxgl).accessToken = environment.mapbox.accessToken;
  }

  ngOnInit() {
    this.cityioService.getCityIOdata().subscribe(cityIOdata => {
      this.initializeMap(cityIOdata);
    });
    this.layers = this.config.layers;
  }

  ngAfterViewInit() {
  }

  private initializeMap(cityIOdata) {

    // TODO: more variables from cityIO or we would suggest setting them via config.json since not everyone has a cityio server
    // this.zoom = cityIOdata.header.###;
    this.zoom = 16;
    // this.bearing = cityIOdata.header.###;
    this.bearing = 34.8;
    // this.pitch = cityIOdata.header.###;
    this.pitch = 60;

    this.center = [
      cityIOdata.header.spatial.latitude,
      cityIOdata.header.spatial.longitude
    ];

    // Just what I would suggest to center GB - more or less
    this.center = [
      10.014390953386766, 53.53128461384861
    ];

    // add the base map and config
    this.map = new mapboxgl.Map({
      container: "basemap",
      style: this.style,
      zoom: this.zoom,
      bearing: this.bearing,
      pitch: this.pitch,
      center: this.center
    });

    this.map.on("load", event => {
      this.updateMapLayers(event)
    });

    this.map.on("error", event => {
      console.log("Map error: " + event);
    });

    this.map.on('drag',  event => {
      console.log("Map move: " + this.map.getBearing());
    });
  }

  public mapSettingsListener(menuOutput: Object[]) {
    switch (menuOutput[0]) {
      case 'resetMap': {
        this.resetMapPosition();
        break;
      }
      case 'csMode': {
        this.map.setPitch(0);
        if (this.initialExtrusionHeight) {
          this.map.setPaintProperty('building', 'fill-extrusion-height', this.initialExtrusionHeight);
          this.initialExtrusionHeight = null;
          this.resetMapPosition();
        } else {
          this.initialExtrusionHeight = this.map.getPaintProperty('building', 'fill-extrusion-height');
          this.map.setPaintProperty('building', 'fill-extrusion-height', 0);
        }
        break;
      }
      case 'maptasticMode': {
        this.toggleMaptasticMode();
        break;
      }
    }
  }

  resetMapPosition() {
    this.map.setZoom(this.zoom);
    this.map.setCenter(this.center);
    this.map.setBearing(this.bearing);
    if (!this.initialExtrusionHeight) {
      this.map.setPitch(this.pitch);
    }
  }

  toggleMaptasticMode() {
    Maptastic("basemap");
  }

  /*
 * Set layer visibility e.g. after interaction with side panels or layer switcher
 */

  updateMapLayers(event) {
    console.log(event);
    const layers: [object] = this.moduleHandler.getLayers();
    layers.map(l => this.map.addLayer(l as Layer));
  }

  toggleLayer() {
    for (let layer of this.layers) {
      if (layer.visible && this.map.getLayer(layer.id) == null) {
          this.map.addLayer(layer);
      } else if (!layer.visible && this.map.getLayer(layer.id) != null) {
        this.map.removeLayer(layer.id);
        this.map.removeSource(layer.id);
      }
    }
  }

  showMapLegend(layer: CsLayer) {
    // Activate the potential legend for the layer
    // this.mapKeyLayer = layer;
    // this.mapKeyVisible = true;
  }
}
