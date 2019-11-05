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
    @Output() dismissMenu: EventEmitter<any> = new EventEmitter();
    cell: GridCell = new GridCell();
    isDismissed = false;

    constructor() {
    }

    ngOnInit() {
        if (this.currentCell) {
            this.cell = Object.assign({}, this.currentCell);
        }
    }

    onChangeSetCellType(event: any, newType: number) {
        this.cell.type = newType;
    }

    // Button actions

    onPreview() {
        this.menuOutput.emit(this.cell);
    }

    onCancel() {
        this.isDismissed = true;
        this.dismissMenu.emit(this.currentCell)
    }

    onSave() {
        this.dismissMenu.emit(null)
    }

    ngOnDestroy() {
        if (!this.isDismissed) {
            this.menuOutput.emit(this.cell);
        }
    }

}
