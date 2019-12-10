import {Component, Input, OnInit, Output, EventEmitter, OnDestroy, ViewChild} from '@angular/core';
import {GridCell} from "../../entities/cell";
import { MatSelect } from '@angular/material';

@Component({
    selector: 'app-edit-menu',
    templateUrl: './edit-menu.component.html',
    styleUrls: ['./edit-menu.component.scss']
})
export class EditMenuComponent implements OnInit {

    @Input() currentCell: GridCell;
    @Output() menuOutput = new EventEmitter<GridCell>();
    @Output() dismissMenu: EventEmitter<any> = new EventEmitter();
    @ViewChild('selectGroundUse', {static: false}) selectGU: MatSelect;
    @ViewChild('selectUpperUse', {static: false}) selectUU: MatSelect;
    @ViewChild('selectOSType', {static: false}) selectOST: MatSelect;
    cell: GridCell = new GridCell();
    isDismissed = false;
    sliderDisabled = true;

    constructor() {
    }

    ngOnInit() {
        if (this.currentCell) {
            this.cell = Object.assign({}, this.currentCell);
            if(this.cell.bld_numLevels > 1) {
                this.sliderDisabled = false;
            }
        }
    }

    onChangeSetCellType(event: any) {
        const idx = Number.parseInt(event);
        if (idx > -1 && idx <= 3) {
            this.cell.type = event;
        }
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
            this.selectGU.open()
            this.selectGU.close()
            return;
        } else if (this.cell.type === 0 && this.cell.bld_numLevels > 1 && this.cell.bld_useUpper == null) {
            this.selectUU.open()
            this.selectUU.close()
            return;
        } else if (this.cell.type === 2 && this.cell.os_type == null) {
            this.selectOST.open()
            this.selectOST.close()
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
