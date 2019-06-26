import { AfterViewInit, Component, OnInit, NgZone } from "@angular/core";
import { environment } from "../../environments/environment";
import { interval } from "rxjs";
import * as mapboxgl from "mapbox-gl";
import * as Maptastic from "maptastic/dist/maptastic.min.js";
import { CsLayer } from "../../typings";
import {
  AnySourceData,
  Layer,
  LngLat,
  MapboxGeoJSONFeature,
  LngLatBounds,
  LngLatBoundsLike,
  LngLatLike
} from "mapbox-gl";
import { GeoJSONSource } from "mapbox-gl";
import { ConfigurationService } from "../services/configuration.service";
import { LayerLoaderService } from "../services/layer-loader.service";
import { CityIOService } from "../services/cityio.service";

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
  intervalMap = {};

  // Map config
  center: any;
  zoom: number;
  pitch: number;
  bearing: number;

  initialExtrusionHeight: any = null;

  constructor(
    private cityio: CityIOService,
    private layerLoader: LayerLoaderService,
    private config: ConfigurationService,
    private zone: NgZone
  ) {
    // get the acess token
    // mapboxgl.accessToken = environment.mapbox.accessToken;
    (mapboxgl as typeof mapboxgl).accessToken = environment.mapbox.accessToken;
  }

  ngOnInit() {
    if (this.cityio.table_data == null) {
      this.cityio.fetchCityIOdata().subscribe(data => {
        this.initializeMap(data);
      });
    } else {
      this.initializeMap(this.cityio.table_data);
    }
  }

  ngAfterViewInit() {}

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
      this.cityio.mapPosition.next(event.point);
    });

    this.map.on("error", event => {
      console.log("Map error: " + event);
    });
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
    if (csLayer.hasReloadInterval) {
      this.toggleIntervalLayer(csLayer, csLayer.addOnMapInitialisation);
    } else if (csLayer.addOnMapInitialisation) {
      this.map.addLayer(csLayer);
      csLayer.visible = true;
      // Too static - has to go somewhere
      if (csLayer.id === "grid-test") {
        this.addGridInteraction();
      }
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
        if (layer.hasReloadInterval) {
          this.toggleIntervalLayer(layer, true);
        } else {
          this.map.addLayer(layer);
          // Too static - has to go somewhere
          if (layer.id === "grid-test") {
            this.addGridInteraction();
          }
        }
      } else if (!layer.visible && this.map.getLayer(layer.id) != null) {
        this.map.removeLayer(layer.id);
        this.map.removeSource(layer.id);
      }
    }
  }

  private toggleIntervalLayer(csLayer: CsLayer, isShowLayer: boolean) {
    if (isShowLayer) {
      this.map.addLayer(csLayer);
      const layerInterval = interval(2000).subscribe(n =>
        this.resetDataUrl(csLayer)
      );
      this.intervalMap[csLayer.id] = layerInterval;
      csLayer.visible = true;
    } else {
      if (this.intervalMap.hasOwnProperty(csLayer.id)) {
        clearInterval(this.intervalMap[csLayer.id]);
      }
    }
  }

  resetDataUrl = (csLayer: CsLayer) => {
    console.log("data reload");
    (this.map.getSource(csLayer.id) as GeoJSONSource).setData(
      csLayer["source"]["data"]
    );
  };

  showMapLegend(layer: CsLayer) {
    // Activate the potential legend for the layer
    // this.mapKeyLayer = layer;
    // this.mapKeyVisible = true;
  }

  /*
   *   Initiate grid interaction
   */

  private addGridInteraction() {
    this.map.on("click", "grid-test", this.clickOnGrid);
    this.map.on("mousemove", "grid-test", e => {
      const features = this.map.queryRenderedFeatures(e.point);
      console.log(features[0]);
    });
  }

  clickOnGrid = e => {
    //Manipulate the clicked feature

    let clickedFeature = e.features[0];
    console.log(clickedFeature);

    let clickedLayer: GeoJSONSource = this.map.getSource(
      "grid-test"
    ) as GeoJSONSource;
    let currentSource = clickedLayer["_data"];
    for (let feature of currentSource["features"]) {
      if (feature.properties["id"] === clickedFeature.properties["id"]) {
        if (feature.properties["color"] === "#ff00ff") {
          feature.properties["color"] = "#008dd5";
        } else {
          feature.properties["color"] = "#ff00ff";
        }
      }
    }
    clickedLayer.setData(currentSource);

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        "<h3> Cell details </h3>" +
          "type: " +
          clickedFeature.properties.type +
          " id: " +
          clickedFeature.properties.id
      )
      .addTo(this.map);
  };

  /*
   *   Map menu logic
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

  zoomToBounds() {
    const coordinates: LngLatBoundsLike = [
      [10.007443106532065, 53.536988036579146],
      [10.017010433937628, 53.527408296213764]
    ];
    const topLeft: LngLatLike = coordinates[0];
    const bottomRight: LngLatLike = coordinates[1];

    const bounds = coordinates.reduce(function(bounds, coord) {
      return bounds.extend(LngLat.convert(coord));
    }, new mapboxgl.LngLatBounds(topLeft, bottomRight));

    this.map.fitBounds(bounds, {
      padding: 0,
      bearing: this.config.gridBearing,
      zoom: this.config.gridZoom,
      pitch: this.config.gridPitch
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
}
