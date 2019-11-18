import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { RouterExtensions } from 'nativescript-angular/router';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { FeedbackType, Feedback } from 'nativescript-feedback';
import { HttpService } from '../serwisy/http.service';


@Component({
    selector: 'ns-zapomnialem',
    templateUrl: './zapomnialem.component.html',
    styleUrls: ['./zapomnialem.component.css'],
    moduleId: module.id,
})
export class ZapomnialemComponent implements OnInit {

    form: FormGroup;

    @ViewChild('email', { static: false }) emailRef: ElementRef<TextField>;

    emailValid: boolean = true;
    btnEnabled: boolean = false;

    wyslanePrzyp: boolean = false;

    private feedback: Feedback;

    constructor(private router: RouterExtensions, private page: Page, private httpService: HttpService) {
        this.feedback = new Feedback();
    }

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.form = new FormGroup({
            email: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.email] })
        });


        this.form.get('email').statusChanges.subscribe(status => {
            this.emailValid = status === 'VALID';
            if (this.emailValid) {
                this.btnEnabled = true;
            }
            else {
                this.btnEnabled = false;
            }
        });
    }

    powrot() {
        this.router.back();
    }

    wyslij() {
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

        let email = this.form.get('email').value

        this.httpService.przypomnij(email).then(res => {
            if(res === 1)
            {
                this.powrot()
                    setTimeout(() => {
                        this.feedback.show({
                            title: "Sukces!",
                            message: "Kod do zmiany hasła został wysłany na adres e-mail: " + email,
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
                    title: "Uwaga!",
                    message: "Brak konta z przypisanym danym adresem e-mail",
                    titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                    messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                    duration: 3000,
                    backgroundColor: new Color(255,255, 207, 51),
                    type: FeedbackType.Warning,

                  });
                  return
            }
        })

    }

    onSwipe(args: SwipeGestureEventData) {

        if (args.direction === 2) {
            this.powrot();
        }
    }
}
