import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-edit-menu',
  templateUrl: './edit-menu.component.html',
  styleUrls: ['./edit-menu.component.scss']
})
export class EditMenuComponent implements OnInit {

  @Input() currentHeight = 25;
  @Output() menuOutput = new EventEmitter<Object>();
  constructor() { }

  ngOnInit() {
  }

  onInputChange(event: any, attributeId) {
    let output = {};
    output[attributeId] = event.value;
    this.menuOutput.emit(output);

  }

  onCloseMenu(event: any) {
    // let output = {}
    // output['height'] = this.currentHeight;
    // this.menuOutput.emit(output);
  }

}
