import { Deck } from "@deck.gl/core";
import { TripsLayer } from "@deck.gl/geo-layers";
import mapboxgl from "mapbox-gl";

const DATA_URL = {
  TRIPS:
    "https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips.json" // eslint-disable-line
};

// let time = 0;
const INITIAL_VIEW_STATE = {
  longitude: -74,
  latitude: 40.72,
  zoom: 13,
  pitch: 45,
  bearing: 0
};

/*
// Set your mapbox token here
mapboxgl.accessToken =
  "pk.eyJ1IjoicmVsbm94IiwiYSI6ImNqd2VwOTNtYjExaHkzeXBzYm1xc3E3dzQifQ.X8r8nj4-baZXSsFgctQMsg";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/relnox/cjl58dpkq2jjp2rmzyrdvfsds",
  // Note: deck.gl will be in charge of interaction and event handling
  interactive: true,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom,
  bearing: INITIAL_VIEW_STATE.bearing,
  pitch: INITIAL_VIEW_STATE.pitch
});
*/

export const deck = new Deck({
  canvas: "deck-canvas",
  width: "100%",
  height: "100%",
  initialViewState: INITIAL_VIEW_STATE,
  controller: true

  /*
  // ! mapbox map control sync
  onViewStateChange: ({ viewState }) => {
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch
    });
  }
  */
});

function renderLayers(time) {
  let loopLength = 1800;
  let animationSpeed = 50;
  const timestamp = Date.now() / 1000;
  const loopTime = loopLength / animationSpeed;
  time = ((timestamp % loopTime) / loopTime) * loopLength;
  let trailLength = 300;

  const tripLayer = new TripsLayer({
    id: "trips",
    data: DATA_URL.TRIPS,
    getPath: d => d.segments,
    getColor: d => (d.vendor === 0 ? [255, 50, 255] : [60, 150, 255]),
    opacity: 0.5,
    widthMinPixels: d => {
      d;
      return 2;
    },
    rounded: true,
    trailLength,
    currentTime: time
  });
  // then put this updated layer into deck
  deck.setProps({
    layers: [tripLayer]
  });

  window.requestAnimationFrame(renderLayers);
}

renderLayers();
