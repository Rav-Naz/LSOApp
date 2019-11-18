import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { RouterExtensions } from 'nativescript-angular/router';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { FeedbackType, Feedback } from 'nativescript-feedback';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { HttpService } from '../serwisy/http.service';
@Component({
  selector: 'ns-nadaj-haslo',
  templateUrl: './nadaj-haslo.component.html',
  styleUrls: ['./nadaj-haslo.component.css'],
  moduleId: module.id,
})
export class NadajHasloComponent implements OnInit {

  form: FormGroup;

    @ViewChild('email', { static: false }) emailRef: ElementRef<TextField>;
    @ViewChild('kod', { static: false }) kodRef: ElementRef<TextField>;
    @ViewChild('haslo', { static: false }) hasloRef: ElementRef<TextField>;
    @ViewChild('powtorz', { static: false }) powtorzRef: ElementRef<TextField>;

    emailValid: boolean = true;
    kodValid: boolean = true;
    hasloValid: boolean = true;
    powtorzValid: boolean = true;

    wyslanePrzyp: boolean = false;

    private feedback: Feedback;

    constructor(private router: RouterExtensions, private page: Page, private httpService: HttpService) {
        this.feedback = new Feedback();
    }

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.form = new FormGroup({
            email: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.email] }),
            kod: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([0-9]{6})')] }),
            haslo: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń0-9+*@#$&^~?_]{6,15})')] }),
            powtorz: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
        });


        this.form.get('email').statusChanges.subscribe(status => {
            this.emailValid = status === 'VALID';
        });
        this.form.get('kod').statusChanges.subscribe(status => {
            this.kodValid = status === 'VALID';
        });
        this.form.get('haslo').statusChanges.subscribe(status => {
            this.hasloValid = status === 'VALID';
        });
        this.form.get('powtorz').statusChanges.subscribe(status => {
            this.powtorzValid = status === 'VALID';
        });
    }

    powrot() {
        this.router.back();
    }

    wyslij() {
        this.powtorzRef.nativeElement.dismissSoftInput()
        if (!this.form.valid) {
            this.feedback.show({
                title: "Uwaga!",
                message: "Wprowadź poprawny adres e-mail",
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 3000,
                backgroundColor: new Color(255,255, 207, 51),
                type: FeedbackType.Warning,

              });
            return;
        }
        if (this.form.get('haslo').value !== this.form.get('powtorz').value) {
            this.powtorzValid = false;
            return;
        }
        let email = this.form.get('email').value;
        let kod = this.form.get('kod').value;
        let haslo = this.form.get('haslo').value;

        this.httpService.aktywacjaUsera(email,kod,haslo).then((res) => {
            if(res === 'nieistnieje')
                {
                    this.feedback.show({
                        title: "Uwaga!",
                        message: "Brak konta z przypisanym danym adresem e-mail",
                        titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                        messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                        duration: 3000,
                        backgroundColor: new Color(255,255, 207, 51),
                        type: FeedbackType.Warning,

                      });
                }
                else if(res === 'niepoprawny')
                {
                    this.feedback.show({
                        title: "Uwaga!",
                        message: "Wprowadzony kod aktywacyjny jest niepoprawny",
                        titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                        messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                        duration: 3000,
                        backgroundColor: new Color(255,255, 207, 51),
                        type: FeedbackType.Warning,

                      });
                }
                else if(res === 'niemakodu' || res === 'wygaslo')
                {
                    this.feedback.show({
                        title: "Uwaga!",
                        message: "Kod aktywacyjny nie został jeszcze wygenerowany lub wygasł",
                        titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                        messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                        duration: 3000,
                        backgroundColor: new Color(255,255, 207, 51),
                        type: FeedbackType.Warning,

                      });
                }
                else if(res.hasOwnProperty('changedRows'))
                {
                    this.powrot()
                    setTimeout(() => {
                        this.feedback.show({
                            title: "Sukces!",
                            message: "Hasło do konta zostało nadane! Możesz sie teraz zalogować",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color(255,49, 155, 49),
                            type: FeedbackType.Success,
                          });
                    }, 200)
                }
                else
                {
                    this.feedback.show({
                        title: "Błąd!",
                        message: "Wystąpił nieoczekiwany błąd",
                        titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                        messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                        duration: 3000,
                        backgroundColor: new Color("#e71e25"),
                        type: FeedbackType.Error,
                    });
                }
        })

    }

    onSwipe(args: SwipeGestureEventData) {

        if (args.direction === 2) {
            this.powrot();
        }
    }

}
