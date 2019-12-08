import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { Feedback, FeedbackType} from "nativescript-feedback";
import { userInfo } from 'os';
import { UserService } from '~/app/serwisy/user.service';


@Component({
    selector: 'ns-zmien-haslo-m',
    templateUrl: './zmien-haslo-m.component.html',
    styleUrls: ['./zmien-haslo-m.component.css'],
    moduleId: module.id,
})
export class ZmienHasloMComponent implements OnInit {

    private feedback: Feedback;

    constructor(private page: Page, private router: RouterExtensions, private tabIndexService: TabindexService, private userService: UserService) {
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

        if(this._nowe !== this._powtorz)
        {
            this.powtorzValid = false;
            return;
        }

        this.userService.zmienHaslo(this._stare,this._nowe).then(res => {
            switch (res) {
                case 1:
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
                    break;
                case 2:
                        this.feedback.show({
                            title: "Uwaga!",
                            message: "Aktualne hasło nie jest poprawne",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color(255, 255, 207, 51),
                            type: FeedbackType.Warning,
                        });
                    break;
                case 0:
                        this.feedback.show({
                            title: "Błąd!",
                            message: "Wystąpił nieoczekiwany błąd",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color("#e71e25"),
                            type: FeedbackType.Error,
                        });
                    break;
                default:
                        this.feedback.show({
                            title: "Błąd!",
                            message: "Wystąpił nieoczekiwany błąd",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color("#e71e25"),
                            type: FeedbackType.Error,
                        });
                    break;
            }
        })
    }

    anuluj() {
        this.tabIndexService.nowyOutlet(6,"ustawieniaO")
        this.router.back();
    }

    dismiss()
    {
        this.noweRef.nativeElement.dismissSoftInput()
    }
}
