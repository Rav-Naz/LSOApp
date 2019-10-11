import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';

@Component({
  selector: 'ns-potwierdzenie-modal',
  templateUrl: './potwierdzenie-modal.component.html',
  styleUrls: ['./potwierdzenie-modal.component.css'],
  moduleId: module.id,
})
export class PotwierdzenieModalComponent implements OnInit {

  constructor(private modal: ModalDialogParams) { }

  text: string = "";

  ngOnInit() {
    this.text = this.modal.context;
  }

  wybor(bool: boolean)
  {
    this.modal.closeCallback(bool);
  }

}
