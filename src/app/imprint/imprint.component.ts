import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-imprint',
    templateUrl: './imprint.component.html',
    styleUrls: ['./imprint.component.scss']
})
export class ImprintComponent implements OnInit {

    ngOnInit() {
        console.log('init imprint');
    }

    onClose() {
        // this.visible = false;
        // this.close.emit();
    }
}
