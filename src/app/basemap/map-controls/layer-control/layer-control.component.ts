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
  collapsed_main: boolean;
  openedGroupedLayers: CsLayer[];

  constructor() { }

  ngOnInit() {
  this.openedGroupedLayers = [];
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
    if (this.openedGroupedLayers.indexOf(layer) >= 0) {
      return true;
    }
    return false;
  }

}
