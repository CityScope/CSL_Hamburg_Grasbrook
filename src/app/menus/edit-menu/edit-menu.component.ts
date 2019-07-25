import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-edit-menu',
  templateUrl: './edit-menu.component.html',
  styleUrls: ['./edit-menu.component.scss']
})
export class EditMenuComponent implements OnInit {

  @Input() currentHeight = 10;
  @Output() heightOutput = new EventEmitter<Object>();
  constructor() { }

  ngOnInit() {
  }

  onInputChange(event: any) {
  }

  onCloseMenu(event: any) {
    let output = {}
    output['height'] = this.currentHeight;
    this.heightOutput.emit(output);
  }

}
