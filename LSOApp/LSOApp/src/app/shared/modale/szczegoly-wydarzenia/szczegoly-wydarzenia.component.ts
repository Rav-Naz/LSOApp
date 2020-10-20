import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { lista } from '~/app/serwisy/stopien.model';
import { EventData } from "tns-core-modules/data/observable";
import { ListPicker } from "tns-core-modules/ui/list-picker";
import { TimePicker } from 'tns-core-modules/ui/time-picker/time-picker';
import { device, isAndroid, isIOS } from "tns-core-modules/platform";
import { Label } from 'tns-core-modules/ui/label/label';
import { FlexboxLayout } from 'tns-core-modules/ui/layouts/flexbox-layout';
import { AnimationCurve } from "tns-core-modules/ui/enums";
import { popupClose, popupOpen } from '../../animations/popup';

declare var java, NSLocale;
@Component({
    selector: 'ns-szczegoly-wydarzenia',
    templateUrl: './szczegoly-wydarzenia.component.html',
    styleUrls: ['./szczegoly-wydarzenia.component.css'],
    moduleId: module.id,
})
export class SzczegolyWydarzeniaComponent{

    constructor() { }

    typ: number = null;
    godzina: Date = null;
    stopien: number = 0;
    lista: Array<string> = ["Wszyscy"];
    edycja: boolean = true;
    jednorazowe: boolean = false;
    teraz: Date;
    data_dokladna: string = null;
    dzien_tygodnia: number;
    mozliwe_daty: Array<string> = [];
    dzien: number = 0;

    context = Array<any>();

    public visible = false;
    public isUserInteractionEnabled = false;

    @Output() decision = new EventEmitter<any>();
    @ViewChild('window', { static: false }) modal: ElementRef<FlexboxLayout>;

    async awaitToDecision(context: any) {
        let duration = 300;
        let element = undefined;
        this.lista = this.lista.concat(lista);
        this.context = context;

        if (this.context.length >= 3) {
            this.typ = this.context[0];
            this.godzina = this.context[1];
            this.stopien = this.context[2] !== undefined ? (this.context[2] === 12 ? 12 : this.context[2] + 1) : null;
            this.edycja = this.context[3];
            this.data_dokladna = this.context[4] !== null ? this.context[4] : null;
            this.jednorazowe = (this.data_dokladna !== null && this.data_dokladna !== undefined) ? true : false;
            this.dzien_tygodnia = this.context[5];
        }

        this.teraz = new Date();
        this.teraz.setDate(this.teraz.getDate() + (7 + this.dzien_tygodnia - this.teraz.getDay()) % 7)
        this.mozliwe_daty.push(this.teraz.toJSON().slice(0, 10))
        for (let index = 0; index < 9; index++) {
            this.teraz.setDate(this.teraz.getDate() + 7)
            this.mozliwe_daty.push(this.teraz.toJSON().slice(0, 10))
        }
        if (this.jednorazowe) {
            let index = this.mozliwe_daty.indexOf(this.data_dokladna)
            this.dzien = index > 0 ? index : 0;
        }

        this.isUserInteractionEnabled = true;
        this.visible = true;

        element = this.modal.nativeElement;
        if(isAndroid) {
            popupOpen(element, duration)
        }
        else {
            element.opacity = 0;
            element.animate({
                opacity: 1,
                curve: AnimationCurve.easeInOut,
                duration: duration
            })
        }

        return new Promise<any>((resolve) => {
            this.decision.subscribe(event => {
                if(isAndroid) {
                    popupClose(element,duration).then(() => {
                        resolve(event);
                        this.visible = false;
                    })
                }
                else
                {
                    element.animate(
                        {
                            opacity: 0,
                            curve: AnimationCurve.easeInOut,
                            duration: duration
                        }).then(() => {
                            resolve(event);
                            this.visible = false;
                        })
                }
            });
        });
    }

    decide(value: any) {
        if (!this.isUserInteractionEnabled) { return; }
        this.isUserInteractionEnabled = false;
        this.decision.emit(value);
    }

    wybierz(id: number) {
        this.isUserInteractionEnabled = false;
        setTimeout(() => {
            this.isUserInteractionEnabled = true;
        },100)
        if (this.edycja) {
            return;
        }
        this.typ = id;
    }

    onSelectedIndexChanged(event: EventData) {
        const picker = <ListPicker>event.object;
        this.stopien = picker.selectedIndex;
    }

    onTimeChanged(args: EventData) {
        const tp = args.object as TimePicker;

        this.godzina = tp.time;
        this.godzina.setFullYear(2018, 10, 15);
    }

    get godzinaString() {
        return this.godzina ? new Date(this.godzina).toString().slice(16, 21) : "--:--";
    }

    onPickerLoaded(args: EventData) {
        const timePicker: TimePicker = <TimePicker>args.object;

        if (isAndroid) {
            timePicker.android.setIs24HourView(java.lang.Boolean.TRUE);
        } else if (isIOS) {
            const local = NSLocale.alloc().initWithLocaleIdentifier("PL");
            timePicker.ios.locale = local;
        }
    }

    onDateChanged(event: EventData) {
        const picker = <ListPicker>event.object;
        this.dzien = picker.selectedIndex;
    }

    onLblLoaded(args: EventData) {
        if (isAndroid) {
            const lbl = args.object as Label;
            lbl.android.setGravity(17);
        }
    }

    zapisz() {
        this.decide([this.typ, this.godzina, this.typ === 2 ? (this.stopien === null ? -1 : (this.stopien === 12 ? this.stopien : this.stopien - 1)) : null, this.edycja ,this.jednorazowe ? this.mozliwe_daty[this.dzien] : null, this.dzien_tygodnia]);
    }

    zmienJednorazowe() {
        this.jednorazowe = !this.jednorazowe;
    }

    get isAndroid() {
        return isAndroid;
    }

    get isIOS14() {
        return isIOS && parseFloat(device.osVersion) >= 14;
    }

}
