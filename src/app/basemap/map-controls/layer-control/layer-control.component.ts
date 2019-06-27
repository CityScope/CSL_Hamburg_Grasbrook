import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {CsLayer} from "../../../../typings";

@Component({
  selector: 'app-layer-control',
  templateUrl: './layer-control.component.html',
  styleUrls: ['./layer-control.component.scss']
})
export class LayerControlComponent implements OnInit {
  @Input() layers: CsLayer[];
  @Output() toggleLayer: EventEmitter<{}> = new EventEmitter();
  @Output() showInfo: EventEmitter<CsLayer> = new EventEmitter();
  collapsed: boolean;

  constructor() { }

  ngOnInit() {
  }

  onToggleLayer(layer: CsLayer) {
    layer.visible = !layer.visible;
    this.toggleLayer.emit();
  }

  onShowInfo(layer: CsLayer) {
    this.showInfo.emit(layer);
  }

}
