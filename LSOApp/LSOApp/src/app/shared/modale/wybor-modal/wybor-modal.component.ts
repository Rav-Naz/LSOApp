import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { EventData, isAndroid } from 'tns-core-modules/ui/page';
import { Label } from 'tns-core-modules/ui/label';
import { Color } from 'tns-core-modules/color';
import { FlexboxLayout } from 'tns-core-modules/ui/layouts/flexbox-layout';
import { popupOpen, popupClose } from '../../animations/popup';

@Component({
    selector: 'ns-wybor-modal',
    templateUrl: './wybor-modal.component.html',
    styleUrls: ['./wybor-modal.component.css'],
    moduleId: module.id,
})
export class WyborModalComponent {

    constructor() { }

    lista = new Array<string>();
    rows: string = '';
    height = '';


    wiersz(index: number) {
        return Math.floor(index / 2);
    }

    public visible = false;
    public isUserInteractionEnabled = false;

    @Output() decision = new EventEmitter<number>();
    @ViewChild('window', { static: false }) modal: ElementRef<FlexboxLayout>;

    async awaitToDecision(context: Array<string>) {
        let duration = 300;
        let element = this.modal.nativeElement;

        this.rows = "";
        this.lista = context;
        this.lista.forEach(item => {
            item = item.replace('-', ' ');
        })

        if (this.lista.length > 14) {
            this.height = "85%"
        }
        else {
            this.height = "auto"
        }

        for (let index = 0; index < Math.ceil((this.lista.length) / 2); index++) {
            this.rows = this.rows + 'auto,';
        }
        this.rows = this.rows.slice(0, this.rows.length - 1);

        this.visible = true;
        this.isUserInteractionEnabled = true;

        popupOpen(element, duration)

        return new Promise<number>((resolve) => {
            this.decision.subscribe(event => {
                resolve(event);
                popupClose(element,duration).then(() => {
                    this.visible = false;
                })
            });
        });
    }

    decide(event: EventData, value: number) {
        if (!this.isUserInteractionEnabled) { return; }
        if (value !== undefined) {
            const lbl = event.object as Label;
            let oldColor = lbl.backgroundColor;
            lbl.backgroundColor = new Color("rgb(200, 200, 200)");
            setTimeout(() => {
                lbl.backgroundColor = oldColor;
            }, 100)
        }
        this.isUserInteractionEnabled = false;
        this.decision.emit(value);
    }

    onLabelLoaded(args: EventData) {
        const lbl = args.object as Label;
        if (isAndroid) {
            lbl.android.setGravity(17);
        }
    }

}
