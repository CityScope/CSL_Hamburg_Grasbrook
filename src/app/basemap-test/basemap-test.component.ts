import {Component, NgZone, OnInit} from '@angular/core';
import * as mapboxgl from "mapbox-gl";
import {environment} from "../../environments/environment";
import {ConfigurationService} from "../services/configuration.service";

import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";
import { GLTFScenegraphLoader } from "@luma.gl/addons";
import { registerLoaders } from "@loaders.gl/core";
import { MapboxLayer } from "@deck.gl/mapbox";

@Component({
  selector: 'app-basemap-test',
  templateUrl: './basemap-test.component.html',
  styleUrls: ['./basemap-test.component.scss']
})
export class BasemapTestComponent implements OnInit {
  map: mapboxgl.Map;
  mapCanvas;
  // Map config
  center: any;
  zoom: number;
  pitch: number;
  bearing: number;
  style;
  scene: MapboxLayer;
  GLTF_URL = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb";

  state = {
    geojson: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [10.020708136717523, 53.531946765795354]
          }
        }
      ]
    }
  };


  constructor(
      private config: ConfigurationService,
      private zone: NgZone) {
    (mapboxgl as typeof mapboxgl).accessToken = environment.mapbox.accessToken;
    registerLoaders([GLTFScenegraphLoader]);
  }

  ngOnInit() {
    console.log('init map');
    this.initializeMap([10.0143909533867, 53.53128461384861]);
  }

  private initializeMap(cityIOdata) {
    this.zoom = this.config.mapZoom;
    this.bearing = this.config.bearing;
    this.pitch = this.config.pitch;
    this.style = this.config.mapStyle;
    this.center = cityIOdata;

    // add the base map and config
    this.map = new mapboxgl.Map({
      container: 'basemap',
      style: this.style,
      zoom: this.zoom,
      bearing: this.bearing,
      pitch: this.pitch,
      center: this.center
    });

    this.map.boxZoom.disable();

    this.map.on('load', event => {
      this.mapCanvas = this.map.getCanvasContainer();
      this.initDeck();
    });

    this.map.on('mousedown', this.onMouseDown);

  }

  onMouseDown = e => {
    let newFeature = this.createFeature([e.lngLat.lng, e.lngLat.lat]);
    this.zone.run(() => {
      this.state.geojson.features.push(newFeature);
    });
  }

  private createFeature(coordinates) {
    return {
      type: "Feature",
          properties: {},
      geometry: {
        type: "Point",
            coordinates: coordinates
      }
    }
  }

  private initDeck() {
    const editableLayer = new MapboxLayer({
      id: "geojson",
      type: EditableGeoJsonLayer,
      data: this.state.geojson,
      mode: "drawPoint",
      onEdit: ({ updatedData, editType  }) => {
        console.log("update");
        let newFeatureCollection = [].concat(this.state.geojson.features);
        this.scene.setProps({
          data: newFeatureCollection
        });
      }
    });

    // This layer renders the glTF objects
    this.scene = new MapboxLayer({
      id: "scene",
      type: ScenegraphLayer,
      scenegraph: this.GLTF_URL,
      data: this.state.geojson.features,
      getPosition: f => f.geometry.coordinates,
      sizeScale: 2000,
      getOrientation: [0, 180, 90],
      getTranslation: [0, 0, 10],
      getScale: [1, 1, 1]
    });

    this.map.addLayer(this.scene );
    this.map.addLayer(editableLayer);
  }
}
