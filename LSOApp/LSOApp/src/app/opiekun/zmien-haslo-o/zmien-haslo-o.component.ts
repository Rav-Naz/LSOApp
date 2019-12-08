import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
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

    stareValid: boolean = true;
    noweValid: boolean = true;
    powtorzValid: boolean = true;

    _stare: string;
    _nowe: string;
    _powtorz: string;

    @ViewChild('stare', { static: false }) stareRef: ElementRef<TextField>;
    @ViewChild('nowe', { static: false }) noweRef: ElementRef<TextField>;
    @ViewChild('powtorz', { static: false }) powtorzRef: ElementRef<TextField>;

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.form = new FormGroup({
            stare: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
            nowe: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń0-9+*@#$&^~?_]{6,15})')]}),
            powtorz: new FormControl(null, { updateOn: 'change', validators: [Validators.required]})
        })

        this.form.get('stare').statusChanges.subscribe(status => {
            this.stareValid = status === 'VALID';
        });
        this.form.get('nowe').statusChanges.subscribe(status => {
            this.noweValid = status === 'VALID';
        });
        this.form.get('powtorz').statusChanges.subscribe(status => {
            this.powtorzValid = status === 'VALID';
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

        this._stare = this.form.get('stare').value;
        this._nowe = this.form.get('nowe').value;
        this._powtorz = this.form.get('powtorz').value;

        //Sprawdzanie czy wpisane stare hasło jest poprawne

        if(this._nowe !== this._powtorz)
        {
            this.powtorzValid = false;
            return;
        }
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

    dismiss()
    {
        this.noweRef.nativeElement.dismissSoftInput()
    }
}
