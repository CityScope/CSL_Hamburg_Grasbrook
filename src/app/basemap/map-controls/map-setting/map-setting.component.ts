import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-map-setting',
  templateUrl: './map-setting.component.html',
  styleUrls: ['./map-setting.component.scss']
})
export class MapSettingComponent implements OnInit {

  @Output() mapSettings: EventEmitter<{}> = new EventEmitter();

  isTopDownMode = false;

  constructor() { }

  ngOnInit() {
  }

  resetMap() {
    this.mapSettings.emit(['resetMap' , true]);
  }

  toggleMapMode() {
    this.isTopDownMode = !this.isTopDownMode;
    this.mapSettings.emit(['csMode' , this.isTopDownMode]);
  }

  maptasticMode() {
    this.mapSettings.emit(['maptasticMode' , true]);
  }

  fitToGrid() {
    this.mapSettings.emit(['fitToGrid' , true]);
  }

}
