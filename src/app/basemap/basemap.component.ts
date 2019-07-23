import {
  AfterViewInit,
  Component,
  OnInit,
  NgZone,
  HostListener
} from "@angular/core";
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
import { AuthenticationService } from "../services/authentication.service";
import { MatDialog } from "@angular/material";
import { ExitEditorDialog } from "../dialogues/exit-editor-dialog";
import { Router } from "@angular/router";

@Component({
  selector: "app-basemap",
  templateUrl: "./basemap.component.html",
  styleUrls: ["./basemap.component.scss"]
})
export class BasemapComponent implements OnInit, AfterViewInit {
  map: mapboxgl.Map;
  mapCanvas;
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
  //
  featureArray = [];

  popUp: mapboxgl.Popup;

  initialExtrusionHeight: any = null;
  isShowMenu = true;

  // Multiple element selection
  start;
  current;
  box;

  constructor(
    private cityio: CityIOService,
    private layerLoader: LayerLoaderService,
    private config: ConfigurationService,
    private authenticationService: AuthenticationService,
    public dialog: MatDialog,
    private router: Router,
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
      cityIOdata.header.spatial.longitude,
      cityIOdata.header.spatial.latitude
    ];

    // Just what I would suggest to center GB - more or less
    // this.center = [10.014390953386766, 53.53128461384861];

    // add the base map and config
    this.map = new mapboxgl.Map({
      container: "basemap",
      style: this.style,
      zoom: this.zoom,
      bearing: this.bearing,
      pitch: this.pitch,
      center: this.center
    });

    this.map.boxZoom.disable();

    this.map.on("load", event => {
      this.mapCanvas = this.map.getCanvasContainer();
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
        if (layer.id === "grid-test") {
          this.removeGridInteraction();
        }
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
   *   Handle grid interactions
   */

  private addGridInteraction() {
    this.map.on("click", "grid-test", this.clickOnGrid);
    // keyboard event
    this.mapCanvas.addEventListener("keydown", this.keyStrokeOnMap);

    // map multi select for logged in users
    if (this.authenticationService.currentUserValue) {
      this.mapCanvas.addEventListener("mousedown", this.mouseDown, true);
    }

    this.map.on("dragstart", e => {
      this.removePopUp();
    });
    this.map.on("zoomstart", e => {
      this.removePopUp();
    });
  }

  private removeGridInteraction() {
    this.map.off("click", "grid-test", this.clickOnGrid);
    // keyboard event
    this.mapCanvas.removeEventListener("keydown", this.keyStrokeOnMap);

    this.map.off("dragstart", e => {
      this.removePopUp();
    });
    this.map.off("zoomstart", e => {
      this.removePopUp();
    });
  }

  //
  // Handle all map keystroke interactions

  keyStrokeOnMap = e => {
    if (this.authenticationService.currentUserValue) {
      let clickedLayer: GeoJSONSource = this.map.getSource(
        "grid-test"
      ) as GeoJSONSource;
      let currentSource = clickedLayer["_data"];
      if (e.key === "w") {
        this.removePopUp();
        for (let feature of currentSource["features"]) {
          if (this.featureArray.includes(feature.properties["id"])) {
            const height = feature.properties["height"];
            console.log(height);

            if (height !== null) {
              if (height < 50) {
                feature.properties["height"] = height + 1;
              } else {
                feature.properties["height"] = 0;
              }
            }
          }
          clickedLayer.setData(currentSource);
        }
      }
    }

    //Keystroke for menu toggle
    if (e.code === "Space") {
      // TODO: we could make this option only available for superusers
      this.toggleMenu();
    }
  };

  private removePopUp() {
    if (this.popUp) {
      this.popUp.remove();
      this.popUp = null;
    }
  }

  clickOnGrid = e => {
    //Manipulate the clicked feature
    let clickedFeature = e.features[0];
    if (this.authenticationService.currentUserValue) {
      this.showFeaturesSelected([clickedFeature]);
    }

    // add a popup data window
    this.popUp = new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        "type: " +
          clickedFeature.properties.type +
          " id: " +
          clickedFeature.properties.id
      )
      .addTo(this.map);
  };

  private showFeaturesSelected(selectedFeature: any[]) {
    for (let clickedFeature of selectedFeature) {
      let clickedLayer: GeoJSONSource = this.map.getSource(
        "grid-test"
      ) as GeoJSONSource;
      let currentSource = clickedLayer["_data"];
      for (let feature of currentSource["features"]) {
        if (feature.properties["id"] === clickedFeature.properties["id"]) {
          if (feature.properties["color"] === "#ff00ff") {
            feature.properties["color"] = "#008dd5";
            // remove this cell from array
            for (var i = this.featureArray.length - 1; i >= 0; i--) {
              if (this.featureArray[i] === clickedFeature.properties["id"]) {
                this.featureArray.splice(i, 1);
              }
            }
          } else {
            feature.properties["color"] = "#ff00ff";
            this.featureArray.push(clickedFeature.properties["id"]);
          }
        }
      }
      clickedLayer.setData(currentSource);
    }
  }

  /*
   *   Handle multiple element selection
   */

  mousePos = e => {
    let rect = this.mapCanvas.getBoundingClientRect();
    return new mapboxgl.Point(
      e.clientX - rect.left - this.mapCanvas.clientLeft,
      e.clientY - rect.top - this.mapCanvas.clientTop
    );
  };

  mouseDown = e => {
    // Continue the rest of the function if the shiftkey is pressed.
    if (!(e.shiftKey && e.button === 0)) return;

    // Disable default drag zooming when the shift key is held down.
    this.map.dragPan.disable();
    // this.map.boxZoom.disable();

    // Call functions for the following events
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("keydown", this.onKeyDown);

    // Capture the first xy coordinates
    this.start = this.mousePos(e);
  };

  onMouseMove = e => {
    // Capture the ongoing xy coordinates
    this.current = this.mousePos(e);

    // Append the box element if it doesnt exist
    if (!this.box) {
      this.box = document.createElement("div");
      this.box.style.cssText =
        "background: rgba(56,135,190,0.1); border: 2px solid #3887be;";
      this.mapCanvas.appendChild(this.box);
    }

    let minX = Math.min(this.start.x, this.current.x),
      maxX = Math.max(this.start.x, this.current.x),
      minY = Math.min(this.start.y, this.current.y),
      maxY = Math.max(this.start.y, this.current.y);

    // Adjust width and xy position of the box element ongoing
    let pos = "translate(" + minX + "px," + minY + "px)";
    this.box.style.transform = pos;
    this.box.style.WebkitTransform = pos;
    this.box.style.width = maxX - minX + "px";
    this.box.style.height = maxY - minY + "px";
  };

  onMouseUp = e => {
    // Capture xy coordinates
    this.finish([this.start, this.mousePos(e)]);
  };

  onKeyDown = e => {
    // If the ESC key is pressed
    if (e.keyCode === 27) this.finish(null);
  };

  finish(bbox) {
    // Remove these events now that finish has been called.
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("mouseup", this.onMouseUp);

    if (this.box) {
      this.box.parentNode.removeChild(this.box);
      this.box = null;
    }

    // If bbox exists. use this value as the argument for `queryRenderedFeatures`
    if (bbox) {
      let features = this.map.queryRenderedFeatures(bbox, {
        layers: ["grid-test"]
      });

      if (features.length >= 1000) {
        return window.alert("Select a smaller number of features");
      }

      // Run through the selected features and set a filter
      // to match features with unique FIPS codes to activate
      // the `counties-highlighted` layer.
      /*      let filter = features.reduce(function (memo, feature) {
        memo.push(feature.properties.FIPS);
        return memo;
      }, ['in', 'FIPS']);

      this.map.setFilter("counties-highlighted", filter);*/
      this.showFeaturesSelected(features);
    }

    this.map.dragPan.enable();
  }

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

  private toggleMenu() {
    this.isShowMenu = !this.isShowMenu;
  }

  private closeAndLogout() {
    if (this.authenticationService.currentUserValue) {
      this.openDialog();
    } else {
      this.router.navigate([""]);
    }
  }

  /*
   *   On exit actions
   */

  openDialog(): void {
    const dialogRef = this.dialog.open(ExitEditorDialog, {
      width: "250px",
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // TODO: send data to cityIO
      }
      this.router.navigate([""]);
      this.authenticationService.logout();
    });
  }
}
