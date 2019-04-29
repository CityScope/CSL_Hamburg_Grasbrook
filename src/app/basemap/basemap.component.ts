import {AfterViewInit, Component, OnInit, NgZone} from "@angular/core";
import {environment} from "../../environments/environment";
import * as mapboxgl from "mapbox-gl";
import * as Maptastic from "maptastic/dist/maptastic.min.js";
import {CsLayer} from "../../typings";
import {AnySourceData, Layer, LngLat, LngLatBounds, LngLatBoundsLike, LngLatLike} from "mapbox-gl";
import {interval} from 'rxjs';
import {GeoJSONSource} from "mapbox-gl";
import {ConfigurationService} from "../service/configuration.service";
import {GridLayerService} from "../service/grid-layer.service";
import {LayerLoaderService} from "../service/layer-loader.service";

@Component({
  selector: "app-basemap",
  templateUrl: "./basemap.component.html",
  styleUrls: ["./basemap.component.css"]
})
export class BasemapComponent implements OnInit, AfterViewInit {
  map: mapboxgl.Map;
  style;
  mapKeyLayer: CsLayer;
  mapKeyVisible: boolean;
  layers: CsLayer[] = [];

  // Map config
  center: any;
  zoom: number;
  pitch: number;
  bearing: number;

  initialExtrusionHeight: any = null;

  constructor(private gridLayerService: GridLayerService,
              private layerLoader: LayerLoaderService,
              private config: ConfigurationService,
              private zone: NgZone) {
    // get the acess token
    // mapboxgl.accessToken = environment.mapbox.accessToken;
    (mapboxgl as typeof mapboxgl).accessToken = environment.mapbox.accessToken;
  }

  ngOnInit() {
    this.gridLayerService.getCityIOdata().subscribe(cityIOdata => {
      this.initializeMap(cityIOdata);
    });
  }

  ngAfterViewInit() {
  }

  private initializeMap(cityIOdata) {
    // TODO: more variables from cityIO or we would suggest setting them via config.json since not everyone has a cityio server
    // this.zoom = cityIOdata.header.###;
    this.zoom = this.config.mapZoom;
    // this.bearing = cityIOdata.header.###;
    this.bearing = this.config.bearing;
    // this.pitch = cityIOdata.header.###;
    this.pitch = this.config.pitch;

    this.style = this.config.mapStyle;
    this.center = [
      cityIOdata.header.spatial.latitude,
      cityIOdata.header.spatial.longitude
    ];

    // Just what I would suggest to center GB - more or less
    this.center = [10.014390953386766, 53.53128461384861];

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
      this.updateMapLayers(event);
    });

    this.map.on("mousedown", event => {
      console.log(event)
    });

    this.map.on("error", event => {
      console.log("Map error: " + event);
    });
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
    const layers: CsLayer[] = this.layerLoader.getLayers();
    layers.map(l => this.deployLayers(l));
  }

  deployLayers(csLayer: CsLayer) {
    if (csLayer.addOnMapInitialisation) {
      this.map.addLayer(csLayer);
      csLayer.visible = true;
    }
    if (csLayer.hasReloadInterval) {
      /**
      this.map.addSource(csLayer.id, { type: 'geojson', data: csLayer.reloadUrl });
      this.map.addLayer(csLayer);
      interval(2000).subscribe(n =>
        this.resetDataUrl(csLayer)
      );
       **/
    }
    if (csLayer.showInLayerList) {
      this.zone.run(() => {
        this.layers.push(csLayer);
      });
    }
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

  resetDataUrl = (csLayer: CsLayer) => {
    /**
    console.log('data reload')
    this.map.getSource('drone').setData(csLayer.reloadUrl );
     **/
  }

  showMapLegend(layer: CsLayer) {
    // Activate the potential legend for the layer
    // this.mapKeyLayer = layer;
    // this.mapKeyVisible = true;
  }

  zoomToBounds() {
    const coordinates: LngLatBoundsLike = [
      [10.007443106532065, 53.536988036579146],
      [10.017010433937628, 53.527408296213764],
    ];
    const topLeft: LngLatLike = coordinates[0];
    const bottomRight: LngLatLike = coordinates[1];

    const bounds = coordinates.reduce(
      function (bounds, coord) {
        return bounds.extend(LngLat.convert(coord));
      },
      new mapboxgl.LngLatBounds(topLeft, bottomRight));

    this.map.fitBounds(bounds, {
      padding: 0, bearing: this.config.gridBearing, zoom: this.config.gridZoom, pitch: this.config.gridPitch
    });
  }


  /*
  *   Listen to the map menu
  */

  public mapSettingsListener(menuOutput: Object[]) {
    switch (menuOutput[0]) {
      case "resetMap": {
        this.resetMapPosition();
        break;
      }
      case "csMode": {
        this.map.setPitch(0);
        if (this.initialExtrusionHeight) {
          this.map.setPaintProperty(
            "building",
            "fill-extrusion-height",
            this.initialExtrusionHeight
          );
          this.initialExtrusionHeight = null;
          this.resetMapPosition();
        } else {
          this.initialExtrusionHeight = this.map.getPaintProperty(
            "building",
            "fill-extrusion-height"
          );
          this.map.setPaintProperty("building", "fill-extrusion-height", 0);
        }
        break;
      }
      case "maptasticMode": {
        this.toggleMaptasticMode();
        break;
      }
      case "fitToGrid": {
        this.zoomToBounds();
        break;
      }
    }
  }
}
