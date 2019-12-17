import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { HttpService } from '~/app/serwisy/http.service';
import { UiService } from '~/app/serwisy/ui.service';

@Component({
  selector: 'ns-sesja-wygasla',
  templateUrl: './sesja-wygasla.component.html',
  styleUrls: ['./sesja-wygasla.component.css'],
  moduleId: module.id,
})
export class SesjaWygaslaComponent implements OnInit {

  constructor(private modal: ModalDialogParams,private http: HttpService,private ui: UiService) { }

  form: FormGroup;

  @ViewChild('email', { static: false }) emailRef: ElementRef<TextField>;
  @ViewChild('haslo', { static: false }) hasloRef: ElementRef<TextField>;

  _email: string = null;
  _haslo: string = null;

  emailValid = true;
  hasloValid = true;

  ladowanie = false;

  niepoprawny: boolean = false;

  ngOnInit() {
    this.form = new FormGroup({
        email: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.email] }),
        haslo: new FormControl(null, { updateOn: 'change', validators: [Validators.required] })
    });

    this.form.get('email').statusChanges.subscribe(status => {
        this.emailValid = status === 'VALID';
    });
    this.form.get('haslo').statusChanges.subscribe(status => {
        this.hasloValid = status === 'VALID';
    });

  }

  zaloguj() {
    this.ladowanie = true;
    this.niepoprawny = false;
    this._email = this.form.get('email').value;
    this._haslo = this.form.get('haslo').value;

    this.http.logowanie(this._email, this._haslo).then(res => {
        if (res === 'brak' || res === 'niepoprawne') {
            this.ladowanie = false;
            this.niepoprawny = true;
        }
        else if (res === 'nieaktywne') {
            this.ladowanie = false;
            this.niepoprawny = true;
        }
        else if (res === 'blad') {
            this.ladowanie = false;
            this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
            this.modal.closeCallback()
        }
        else {
            this.modal.closeCallback()
        }
    })
  }

  dismiss()
    {
        this.emailRef.nativeElement.dismissSoftInput()
    }
}
