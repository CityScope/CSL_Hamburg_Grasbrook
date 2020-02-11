import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CsLayer} from '../../../../typings';

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
    walkability: '',
    xyz: '',
  };


  constructor() { }

  ngOnInit() {
  this.openedGroupedLayers = [];
  }

  onToggleLayer(layer: CsLayer, subResult: string = '') {
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
    console.log("icon for layer: ", id, this.layerIcons[id]);
    return this.layerIcons[id];
  }

  setSelectedSublayer(id: string, type: string) {
    console.log('setting sublayer to ', id);
    this.selectedSublayers[type] = id;
  }
}
