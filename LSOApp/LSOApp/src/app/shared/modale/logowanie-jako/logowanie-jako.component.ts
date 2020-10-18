import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { EventData } from 'tns-core-modules/ui/page';
import { Label } from 'tns-core-modules/ui/label';
import { Color } from 'tns-core-modules/color';
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';
import { popupOpen, popupClose } from '../../animations/popup';

@Component({
    selector: 'ns-logowanie-jako',
    templateUrl: './logowanie-jako.component.html',
    styleUrls: ['./logowanie-jako.component.css'],
    moduleId: module.id,
})
export class LogowanieJakoComponent {

    public visible = false;
    public isUserInteractionEnabled = false;

    @Output() decision = new EventEmitter<number>();

    @ViewChild('window', { static: false }) modal: ElementRef<StackLayout>;

    async awaitToDecision() {
        let duration = 300;
        let element = this.modal.nativeElement;
        this.visible = true;
        this.isUserInteractionEnabled = true;
        popupOpen(element,duration)

        return new Promise((resolve) => {
            this.decision.subscribe(event => {
                popupClose(element, duration).then(() => {
                    this.visible = false;
                    resolve(event);
                })
            });
        });
    }

    decide(event: EventData, value: number) {
        if (!this.isUserInteractionEnabled) { return; }
        if (value === 0 || value === 1) {
            const lbl = event.object as Label;
            let oldColor = lbl.backgroundColor;
            lbl.backgroundColor = new Color("rgb(40, 40, 40)");
            setTimeout(() => {
                lbl.backgroundColor = oldColor;
            }, 100)
        }
        this.isUserInteractionEnabled = false;
        this.decision.emit(value);
    }


}
