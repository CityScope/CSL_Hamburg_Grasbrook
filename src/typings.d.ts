/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

import * as mapboxgl from "mapbox-gl";

declare interface CsLayer extends mapboxgl.Layer {
  visible: boolean;
  displayName: string;
}

declare interface Config {
  mapCenter: [number, number];
  mapZoom: number;
  bearing: number;
  pitch: number;
  style: string,
  layers: CsLayer[];
}

declare module '*.json' {
  const value: Config;
  export default value;
}

declare var mQuery:any;
