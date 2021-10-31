import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
// import { EventData, isAndroid, Color } from 'tns-core-modules/ui/page';
// import { Label } from 'tns-core-modules/ui/label';
// import { GridLayout } from 'tns-core-modules/ui/layouts/grid-layout';
import { popupOpen, popupClose } from '../../animations/popup';
import { GridLayout, EventData, isAndroid, Label, Color } from '@nativescript/core';

@Component({
    selector: 'ns-potwierdzenie-modal',
    templateUrl: './potwierdzenie-modal.component.html',
    styleUrls: ['./potwierdzenie-modal.component.css'],
    moduleId: module.id,
})
export class PotwierdzenieModalComponent {

    constructor() { }

    text: string = "";

    public visible = false;
    public isUserInteractionEnabled = false;

    @Output() decision = new EventEmitter<boolean>();
    @ViewChild('window', { static: false }) modal: ElementRef<GridLayout>;

    async awaitToDecision(context: string) {
        let duration = 300;
        let element = this.modal.nativeElement;
        this.visible = true;
        this.text = context;
        this.isUserInteractionEnabled = true;
        popupOpen(element, duration);

        return new Promise<boolean>((resolve) => {
            this.decision.subscribe(event => {
                popupClose(element, duration).then(() => {
                    this.visible = false;
                    resolve(event);
                })
            });
        });
    }

    decide(event: EventData,value: boolean) {
        if (!this.isUserInteractionEnabled) { return; }
        if (value === false && isAndroid) {
            const lbl = event.object as Label;
            let oldColor = "linear-gradient(to bottom, #e71e25, #a5151a)";
            lbl.background = "linear-gradient(to bottom, #a5151a, #640b0e)"
            setTimeout(() => {
                lbl.background = oldColor;
            }, 100)
        }
        else if(value === true && isAndroid)
        {
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

    onLabelLoaded(args: EventData)
    {
        const lbl = args.object as Label;
        if(isAndroid)
        {
            lbl.android.setGravity(17);
        }
    }

    get isAndroid() {
        return isAndroid;
    }

}
