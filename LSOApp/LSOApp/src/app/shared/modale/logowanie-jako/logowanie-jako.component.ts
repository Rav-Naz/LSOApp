import { Component} from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';

@Component({
  selector: 'ns-logowanie-jako',
  templateUrl: './logowanie-jako.component.html',
  styleUrls: ['./logowanie-jako.component.css'],
  moduleId: module.id,
})
export class LogowanieJakoComponent{

    constructor(private modal: ModalDialogParams) { }

    wybierz(wybor: number)
  {
      this.modal.closeCallback(wybor) // zwraca index z listy
  }

}
