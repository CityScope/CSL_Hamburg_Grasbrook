import { Component, OnInit } from "@angular/core";
import { environment } from "../../environments/environment";
import * as mapboxgl from "mapbox-gl";

@Component({
  selector: "basemap",
  templateUrl: "./basemap.component.html",
  styleUrls: ["./basemap.component.css"]
})
export class BasemapComponent implements OnInit {
  map: mapboxgl.Map;
  style = "mapbox://styles/relnox/cjs9rb33k2pix1fo833uweyjd";
  latitude: number;
  longitude: number;
  rotation: number;
  center: number[];
  gridDataCells: any;
  gridDataCellsSource: any;
  simDataSource: any;
  constructor() {
    mapboxgl.accessToken = environment.mapbox.accessToken;
  }

  ngOnInit() {
    this.initializeMap();
  }

  private initializeMap() {
    this.center = [74, 15];
    // [this.latitude, this.longitude];
    this.map = new mapboxgl.Map({
      container: "basemap",
      style: this.style,
      zoom: 10,
      bearing: 0,
      // this.rotation,
      pitch: 0,
      center: this.center
    });

    /// Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());
  }

  /// Helpers
  resetCameraPosition(rotation: number) {
    // clamp the rotation between 0 -360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    this.map.rotateTo(0, { duration: 200 });

    if (rotation !== 0)
      this.map.flyTo({
        center: this.findMiddleOfModel(),
        bearing: this.rotation,
        pitch: 0,
        zoom: 15
      });
  }

  findMiddleOfModel() {
    //Earth’s radius, sphere
    let earthRadius = 6378137;
    let offsetEast = -600;
    let offsetNorth = 1300;
    //Coordinate offsets in radians
    let dLat = offsetNorth / earthRadius;
    let dLon =
      offsetEast / (earthRadius * Math.cos((Math.PI * this.latitude) / 180));
    //OffsetPosition, decimal degrees
    return [
      this.latitude + (dLat * 180) / Math.PI,
      this.longitude + (dLon * 180) / Math.PI
    ];
  }
}
