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
    sliderDisabled = true;

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

    onChangeSlider(event: any) {
        if(event.value === 1) {
            this.sliderDisabled = true;
            this.cell.bld_useUpper = null
        }
        else {
            this.sliderDisabled = false;
        }
    }

    // Button actions

    // onPreview() {
    //     this.menuOutput.emit(this.cell);
    // }

    onCancel() {
        this.isDismissed = true;
        this.dismissMenu.emit(this.currentCell)
    }

    onSave() {
        console.log(this.cell)
        if (this.cell.type === 0 && this.cell.bld_useGround == null) {
            console.log("no ground use!")
            return;
        } else if (this.cell.type === 0 && this.cell.bld_numLevels > 1 && this.cell.bld_useUpper == null) {
            console.log("no upper level use!")
            return;
        } else if (this.cell.type === 2 && this.cell.os_type == null) {
            console.log("no open space type!")
            return;
        }
        this.isDismissed = true;
        this.dismissMenu.emit(this.cell);
    }

    ngOnDestroy() {
        // WHAT TO DO HERE????
        if (!this.isDismissed) {
            this.menuOutput.emit(this.cell);
        }
    }

}
