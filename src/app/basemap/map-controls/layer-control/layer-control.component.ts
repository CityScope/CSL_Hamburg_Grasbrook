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
    "walkability_adult": 'assets\\images\\icons_grasbrook_walkability_walk.svg',
    "walkability_child": 'assets\\images\\icons_grasbrook_walkability_child.svg',
    "walkability_wheelchair": 'assets\\images\\icons_grasbrook_walkability_accessible.svg',
  };

  selectedSublayers: object = {
    walkability: {},
    xyz: {},
  };

  // see config.json for defaults
  selectedSubResults: object = {
    walkability: '',
    xyz: '',
  };

  constructor() { }

  ngOnInit() {
  this.openedGroupedLayers = [];
  }

  onToggleLayer(layer: CsLayer, state?: boolean) {
    if (state) {
      layer.visible = state;
    } else {
      layer.visible = !layer.visible;
    }

    this.toggleLayer.emit();
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

  onSwitchSubLayer(layerId: string, subLayer: CsLayer) {
    if (subLayer.visible) {
      // do nothing
      return;
    }
    if (this.selectedSubResults[layerId] === '') {
      this.setSelectedSublayer(layerId, subLayer);
    } else {
      // remove current sublayer from map
      this.onToggleLayer(this.selectedSublayers[layerId]);
      this.setSelectedSublayer(layerId, subLayer);
      this.updateSubResultForMapLayer(layerId);
      // add sublayer to map
      this.onToggleLayer(subLayer);
    }
  }

  setSelectedSublayer(layerId: string, subLayer: CsLayer) {
    this.selectedSublayers[layerId] = subLayer;
  }

  onToggleSubResult(layerId: string, subResult: string) {
    // remove layer from map
    this.onToggleLayer(this.selectedSublayers[layerId], false);

    if (subResult === this.selectedSubResults[layerId]) {
     // checkbox unchecked - set selectedSubResult to empty
     this.selectedSubResults[layerId] = '';
   } else {
      this.selectedSubResults[layerId] = subResult;
      this.updateSubResultForMapLayer(layerId);
      // add updated sublayer to map
      this.onToggleLayer(this.selectedSublayers[layerId], true);
   }
  }

  updateSubResultForMapLayer(mainLayerId: string) {
    (this.selectedSublayers[mainLayerId].paint as FillExtrusionPaint)['fill-extrusion-color']['property'] = this.selectedSubResults[mainLayerId];
  }

  getIconForLayerId(id: string) {
    return this.layerIcons[id];
  }
}
