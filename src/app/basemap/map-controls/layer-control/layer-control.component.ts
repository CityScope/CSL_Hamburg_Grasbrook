import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CsLayer} from '../../../../typings';
import {FillExtrusionPaint} from 'mapbox-gl';

@Component({
  selector: 'app-layer-control',
  templateUrl: './layer-control.component.html',
  styleUrls: ['./layer-control.component.scss']
})
export class LayerControlComponent implements OnInit {
  @Input() layers: CsLayer[];
  @Output() toggleLayer: EventEmitter<{}> = new EventEmitter();
  @Output() showInfo: EventEmitter<CsLayer> = new EventEmitter();
  collapsedMain: boolean;
  openedGroupedLayers: CsLayer[];
  layerIcons = {
    "walkability_walking": 'assets\\images\\icons_grasbrook_walkability_walk.svg',
    "walkability_stroller": 'assets\\images\\icons_grasbrook_walkability_child_friendly.svg',
    "walkability_wheelchair": 'assets\\images\\icons_grasbrook_walkability_accessible.svg',
  };

  selectedSublayers: object = {
    walkability: {},
    xyz: {},
  };

  selectedSubResults: object = {
    walkability: '',
    xyz: '',
  };


  constructor() { }

  ngOnInit() {
  this.openedGroupedLayers = [];
  }

  onSwitchSubResult(layer: CsLayer, subResult: string = '') {
    console.log("switching subResult to ", subResult);
    // Remove layer from map
    this.onToggleLayer(this.selectedSublayers[layer.id]);
    // update property to render for all grouped layers
    for (const subLayer of layer.groupedLayers) {
      this.setSubResultForLayer(subLayer, subResult);
    }
    // Add to map again
    this.onToggleLayer(this.selectedSublayers[layer.id]);
  }

  setSubResultForLayer(layer: CsLayer, subResult: string) {
    (layer.paint as FillExtrusionPaint)['fill-extrusion-color'].property = subResult;
  }

  onSwitchSubLayer(layerId: string, subLayer: CsLayer) {
    console.log("switching sublayer");
    // toggle old subLayer (remove from map)
    this.onToggleLayer(subLayer);
    // set new subLayer as selected sublayer
    this.setSelectedSublayer(layerId, subLayer);
    // add new subLayer to map, with propertyToRender = currentPropertyToRender


  }

  onToggleLayer(layer: CsLayer) {
      layer.visible = !layer.visible;
      this.toggleLayer.emit();
      console.log(layer);
  }

  onShowInfo(evt: MouseEvent, layer: CsLayer) {
    evt.preventDefault();
    this.showInfo.emit(layer);

    if (!layer.visible) {
      layer.visible = true;
      this.toggleLayer.emit();
    }
  }

  onCollapseGroupedLayer(evt: MouseEvent, layer: CsLayer) {
    // add to opened layers, if not opened yet
    if (!this.isLayerGroupOpened(layer)) {
      this.openedGroupedLayers.push(layer);
      return;
    }
    // remove from opened layers
    this.openedGroupedLayers.splice(this.openedGroupedLayers.indexOf(layer), 1);
  }

  isLayerGroupOpened(layer: CsLayer) {
    return this.openedGroupedLayers.indexOf(layer) >= 0;
  }

  onChangeWalkType(walkabilitytype: string) {
    console.log("walkability type change ", walkabilitytype);

  }

  getIconForLayerId(id: string) {
   // console.log("do this on init");
   // console.log("icon for layer: ", id, this.layerIcons[id]);
    return this.layerIcons[id];
  }

  setSelectedSublayer(layerId: string, subLayer: CsLayer) {
    console.log('setting sublayer to ', subLayer);
    this.selectedSublayers[layerId] = subLayer;
  }
}
