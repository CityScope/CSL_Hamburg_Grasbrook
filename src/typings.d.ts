/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

import * as mapboxgl from "mapbox-gl";

declare interface CsLayer extends mapboxgl.Layer {
  visible: boolean;
  displayName: string;
  addOnMapInitialisation: boolean;
  showInLayerList: boolean;

  sourceType: string;
  hasReloadInterval: boolean;
  reloadUrl: string;
}

declare interface Config {
  mapCenter: [number, number];
  mapZoom: number;
  bearing: number;
  pitch: number;
  gridZoom: number;
  gridBearing: number;
  gridPitch: number;
  style: string,
  layers: CsLayer[];
}

declare module '*.json' {
  const value: Config;
  export default value;
}

declare var mQuery:any;
