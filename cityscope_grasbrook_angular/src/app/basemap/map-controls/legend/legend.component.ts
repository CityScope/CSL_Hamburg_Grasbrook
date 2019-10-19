import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import {CsLayer} from "../../../../typings";

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LegendComponent implements OnInit {
  @Input() layer: CsLayer;
  @Input() visible: boolean;
  @Output() close: EventEmitter<{}> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onClose() {
    this.visible = false;
    this.close.emit();
  }

}
