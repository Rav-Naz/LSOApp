import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { Feedback, FeedbackType} from "nativescript-feedback";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ns-zmien-haslo-o',
  templateUrl: './zmien-haslo-o.component.html',
  styleUrls: ['./zmien-haslo-o.component.css'],
  moduleId: module.id,
})
export class ZmienHasloOComponent implements OnInit {

    private feedback: Feedback;

    constructor(private page: Page, private router: RouterExtensions, private tabIndexService: TabindexService, private active: ActivatedRoute) {
        this.feedback = new Feedback();
    }

    form: FormGroup;

    diecezjaValid: boolean = true;
    miastoValid: boolean = true;
    wezwanieValid: boolean = true;
    rodzajValid: boolean = true;

    _diecezja: string = "Wybierz diecezję";
    _diecezja_id: number = 1;
    _miasto: string;
    _rodzaj: string = "Wybierz rodzaj parafii";
    _rodzaj_id: number = 1;
    _stopien: string = "Wybierz stopień"
    _stopien_id: number = 1
    _wezwanie: string = '';

    @ViewChild('wezwanie', { static: false }) wezwanieRef: ElementRef<TextField>;
    @ViewChild('miasto', { static: false }) miastoRef: ElementRef<TextField>;


    ngOnInit() {
        this.page.actionBarHidden = true;

        this.form = new FormGroup({
            wezwanie: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń .]{2,30})')] }),
            miasto:  new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń -]{2,30})')] })
        })

        this.form.get('wezwanie').statusChanges.subscribe(status => {
            this.wezwanieValid = status === 'VALID';
        });
        this.form.get('miasto').statusChanges.subscribe(status => {
            this.miastoValid = status === 'VALID';
        });
    }

    zapisz() {

        if(!this.form.valid)
        {
            this.feedback.show({
                title: "Błąd!",
                message: "Formularz nie jest poprawny",
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 3000,
                backgroundColor: new Color("#e71e25"),
                type: FeedbackType.Error,
              });
            return;
        }

        this._wezwanie = this.form.get('wezwanie').value;
        this._miasto = this.form.get('miasto').value;

        setTimeout(() => {
            this.feedback.show({
                title: "Sukces!",
                message: "Hasło zostało zmienione",
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 3000,
                backgroundColor: new Color(255,49, 155, 49),
                type: FeedbackType.Success,
              });
        }, 400)

        this.anuluj();
    }

    anuluj() {
        this.tabIndexService.nowyOutlet(6,"ustawieniaO")
        this.router.back()
    }

    focus() {
        this.wezwanieRef.nativeElement.focus();
    }

    dismiss()
    {
        this.wezwanieRef.nativeElement.dismissSoftInput()
    }
}
