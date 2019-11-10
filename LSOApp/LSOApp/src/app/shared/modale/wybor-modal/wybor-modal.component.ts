import { Component, OnInit} from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';

@Component({
  selector: 'ns-wybor-modal',
  templateUrl: './wybor-modal.component.html',
  styleUrls: ['./wybor-modal.component.css'],
  moduleId: module.id,
})
export class WyborModalComponent implements OnInit {

  constructor(private modal: ModalDialogParams) { }

    context = new Array<string>();
    lista = new Array<string>();
    rows: string = '';
    height='';

  ngOnInit() {
      this.context = this.modal.context;

      this.context.forEach(item => {
          let sp = item.replace('-',' ');
          this.lista.push(sp);
      })

      if(this.lista.length>20)
      {
          this.height = "85%"
      }
      else
      {
         this.height = "auto"
      }

      for (let index = 0; index < Math.ceil((this.lista.length)/2); index++) {
        this.rows = this.rows + 'auto,';
      }

      this.rows = this.rows.slice(0,this.rows.length-1);

  }

  wiersz(index: number)
  {
      return Math.floor(index/2);
  }

  wybierz(wybor: any)
  {
      this.modal.closeCallback(wybor) // zwraca index z listy
  }

}
