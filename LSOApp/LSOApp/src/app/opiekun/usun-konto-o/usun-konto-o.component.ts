import { Component, OnInit } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { Feedback, FeedbackType } from "nativescript-feedback";
import { HttpService } from '~/app/serwisy/http.service';
import { UserService } from '~/app/serwisy/user.service';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { WiadomosciService } from '~/app/serwisy/wiadomosci.service';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';

@Component({
    selector: 'ns-usun-konto-o',
    templateUrl: './usun-konto-o.component.html',
    styleUrls: ['./usun-konto-o.component.css'],
    moduleId: module.id,
})
export class UsunKontoOComponent implements OnInit {
    private feedback: Feedback;

    constructor(private page: Page, private router: RouterExtensions, private userService: UserService,
        private tabIndexService: TabindexService, private http: HttpService,
        private parafiaService: ParafiaService, private wiadomosciService: WiadomosciService, private wydarzeniaService: WydarzeniaService) {
        this.feedback = new Feedback();
    }

    hasloValid: boolean = true;
    form: FormGroup;
    _haslo: string;

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.form = new FormGroup({
            haslo: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.minLength(1)] })
        });

        this.form.get('haslo').statusChanges.subscribe(status => {
            this.hasloValid = status === 'VALID';
        });
    }

    zapisz() {

        this._haslo = this.form.get('haslo').value;
        this.http.usuwanieParafii(this._haslo).then(res => {
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
                    this.router.navigate([""], { clearHistory: true, transition: { name: 'slideBottom' } }).then(() => {
                        this.http.wyczysc()
                        this.parafiaService.wyczysc()
                        this.tabIndexService.wyczysc()
                        this.userService.wyczysc()
                        this.wiadomosciService.wyczysc()
                        this.wydarzeniaService.wyczysc()
                        setTimeout(() => {
                            this.feedback.show({
                                title: "Sukces!",
                                message: "Konto zostało usunięte pomyślnie. Dziękujemy za skorzystanie z aplikacji :)",
                                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                                duration: 3000,
                                backgroundColor: new Color(255, 49, 155, 49),
                                type: FeedbackType.Success,
                            });
                        }, 400)
                    });

                    break;
                case 2:
                    this.feedback.show({
                        title: "Uwaga!",
                        message: "Wpisane hasło jest niepoprawne",
                        titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                        messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                        duration: 3000,
                        backgroundColor: new Color(255, 255, 207, 51),
                        type: FeedbackType.Warning,
                    });
                    break;
                case 3:
                    this.router.navigate([""], { clearHistory: true, transition: { name: 'slideBottom' } }).then(() => {
                        this.feedback.show({
                            title: "!!!!",
                            message: "BŁĄD KRYTYCZNY",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color("#e71e25"),
                            type: FeedbackType.Error,

                        });
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
        this.tabIndexService.nowyOutlet(6, "ustawieniaO");
        this.router.back();
    }

}
