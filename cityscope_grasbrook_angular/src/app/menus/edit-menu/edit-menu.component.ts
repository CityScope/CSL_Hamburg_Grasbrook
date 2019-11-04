import {Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {GridCell} from "../../entities/cell";

@Component({
  selector: 'app-edit-menu',
  templateUrl: './edit-menu.component.html',
  styleUrls: ['./edit-menu.component.scss']
})
export class EditMenuComponent implements OnInit {

  @Input() currentCell: GridCell;
  @Output() menuOutput = new EventEmitter<GridCell>();
  cell:GridCell = new GridCell();

  constructor() {
  }

  ngOnInit() {
      if (this.currentCell) {
          this.cell = this.currentCell;
      }
  }

  onInputChange(event: any, attributeId) {
    //TODO: vielleicht auch die ganze zeit die changes vershicken!
  }

  onCloseMenu(event: any) {
    // let output = {}
    // output['height'] = this.currentHeight;
    // this.menuOutput.emit(output);
  }

    ngOnDestroy() {
        this.menuOutput.emit(this.cell);
    }

}
