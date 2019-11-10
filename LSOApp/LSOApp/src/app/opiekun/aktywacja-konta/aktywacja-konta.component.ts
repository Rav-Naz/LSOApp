import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { RouterExtensions } from 'nativescript-angular/router';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { FeedbackType, Feedback } from 'nativescript-feedback';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { HttpService } from '~/app/serwisy/http.service';

@Component({
    selector: 'ns-aktywacja-konta',
    templateUrl: './aktywacja-konta.component.html',
    styleUrls: ['./aktywacja-konta.component.css'],
    moduleId: module.id,
})
export class AktywacjaKontaComponent implements OnInit {

    form: FormGroup;

    @ViewChild('email', { static: false }) emailRef: ElementRef<TextField>;

    emailValid: boolean = true;
    btnEnabled: boolean = false;

    wyslanePrzyp: boolean = false;

    private feedback: Feedback;

    constructor(private router: RouterExtensions, private page: Page, private tabIndexService: TabindexService,
        private parafiService: ParafiaService, private http: HttpService) {
        this.feedback = new Feedback();
    }

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.wyslanePrzyp = this.parafiService.wyslanyEmail

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
        this.tabIndexService.nowyOutlet(4, 'ministrant-szczegoly');
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
                backgroundColor: new Color(255, 255, 207, 51),
                type: FeedbackType.Warning,

            });
            return;
        }

        this.http.aktywacjaMinistranta(this.form.get('email').value, this.parafiService.aktualnyMinistrantId).then(res => {
            switch (res) {
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

                case 1:
                    this.parafiService.pobierzMinistrantow().then(() => {
                        this.wyslanePrzyp = true;
                    })
                    break;

                case 2:
                        this.feedback.show({
                            title: "Uwaga!",
                            message: "Ten adres e-mail jest już przypisany do innego konta!",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color(255, 255, 207, 51),
                            type: FeedbackType.Warning,

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
}
