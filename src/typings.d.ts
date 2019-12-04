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
  isLoading: boolean;
  legend: Legend;

  sourceType: string;
  hasReloadInterval: boolean;
  reloadUrl: string;
}

declare interface Legend {
  styleField: string | string[],
  styleValues: LegendValue[],
  description: string,
  credits: string | string[],
  html: string,
  url: string
}

declare interface LegendValue {
  styleFieldValue: string | number | [number, number], // string Value, numerical Value or interval
  color: string,
  label: string
}

declare interface Config {
  mapCenter: [number, number];
  mapZoom: number;
  bearing: number;
  pitch: number;
  gridZoom: number;
  gridBearing: number;
  gridPitch: number;
  style: string;
  layers: CsLayer[];
  isShowPopUp: boolean;
}

declare module '*.json' {
  const value: Config;
  export default value;
}

declare var mQuery:any;
