import {
  Component,
  AfterViewInit,
  Input,
  Output,
  NgZone,
  EventEmitter
} from "@angular/core";

import { Deck } from "@deck.gl/core";
import { TripsLayer } from "@deck.gl/geo-layers";

const DATA_URL = {
  TRIPS:
    "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips.json" // eslint-disable-line
};

@Component({
  selector: "app-deckgl",
  templateUrl: "./deckgl.component.html",
  styleUrls: ["./deckgl.css"]
})
export class DeckglComponent implements AfterViewInit {
  @Input() glId: string;
  @Output() viewPortChange = new EventEmitter();
  private deckgl;
  private viewport = {
    latitude: 40.75,
    longitude: -74,
    zoom: 12,
    pitch: 45,
    bearing: 0
  };

  constructor(public ngZone: NgZone) {}

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.deckgl = new Deck({
        ...this.viewport,
        debug: true,
        layers: [],
        canvas: document.getElementById(this.glId),
        initialViewState: this.viewport,
        controller: true
      });
      setInterval(() => {
        this.renderLayers();
      });
    });
  }

  renderLayers() {
    let loopLength = 1800;
    let animationSpeed = 50;
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed;
    let time = ((timestamp % loopTime) / loopTime) * loopLength;
    let trailLength = 300;

    const tripLayer = new TripsLayer({
      id: "trips",
      data: DATA_URL.TRIPS,
      getPath: d => d.segments,
      getColor: d => (d.vendor === 0 ? [255, 50, 255] : [60, 150, 255]),
      opacity: 0.5,
      widthMinPixels: 2,
      rounded: true,
      trailLength,
      currentTime: time
    });
    // then put this updated layer into deck
    this.deckgl.setProps({
      layers: [tripLayer]
    });
  }
}
