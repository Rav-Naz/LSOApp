import { Component, OnInit} from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { lista } from '~/app/serwisy/stopien.model'
import { EventData } from "tns-core-modules/data/observable";
import { ListPicker } from "tns-core-modules/ui/list-picker";
import { TimePicker } from 'tns-core-modules/ui/time-picker/time-picker';
import {isAndroid, isIOS} from "tns-core-modules/platform";
import { Label } from 'tns-core-modules/ui/label/label';

declare var java, NSLocale;
@Component({
  selector: 'ns-szczegoly-wydarzenia',
  templateUrl: './szczegoly-wydarzenia.component.html',
  styleUrls: ['./szczegoly-wydarzenia.component.css'],
  moduleId: module.id,
})
export class SzczegolyWydarzeniaComponent implements OnInit {

  constructor(private modal: ModalDialogParams) { }

    typ: number = null;
    godzina: Date = null;
    stopien: number = 0;
    lista: Array<string> = ["Wszyscy"];
    edycja: boolean = true;

    context = Array<any>();

  ngOnInit() {
    this.lista = this.lista.concat(lista);
    this.context = this.modal.context;
    if(this.context.length >= 3)
    {
        this.typ = this.context[0];
        this.godzina = this.context[1];
        this.stopien = this.context[2] !== undefined ? this.context[2] + 1 : null;
        this.edycja = this.context[3];
    }
  }

  wybierz(id: number)
  {
    if(this.edycja)
    {
        return
    }
    this.typ = id;
  }

  onSelectedIndexChanged(event: EventData)
  {
    const picker = <ListPicker>event.object;
    this.stopien = picker.selectedIndex;
  }

  onTimeChanged(args: EventData)
  {
    const tp = args.object as TimePicker;

    this.godzina = tp.time;
    this.godzina.setFullYear(2018,10,15);
  }

  get godzinaString()
  {
    return this.godzina ? new Date(this.godzina).toString().slice(16,21) : "--:--";
  }

  onPickerLoaded(args:EventData) {
    const timePicker: TimePicker = <TimePicker> args.object;

    if (isAndroid) {
        timePicker.android.setIs24HourView(java.lang.Boolean.TRUE);
    } else if (isIOS) {
        const local = NSLocale.alloc().initWithLocaleIdentifier("PL");
        timePicker.ios.locale = local;
    }
  }

  onLblLoaded(args:EventData)
  {
    if(isAndroid)
    {
        const lbl = args.object as Label;
        lbl.android.setGravity(17);
    }
  }

  zapisz()
  {
    this.modal.closeCallback([this.typ,this.godzina,this.typ === 2 ? (this.stopien === null ? -1 : this.stopien - 1) : null])
  }

}
