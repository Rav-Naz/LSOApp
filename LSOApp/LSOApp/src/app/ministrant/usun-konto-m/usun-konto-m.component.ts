import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { Feedback, FeedbackType } from "nativescript-feedback";
import { SecureStorage } from "nativescript-secure-storage";
import { UserService } from '~/app/serwisy/user.service';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';

@Component({
    selector: 'ns-usun-konto-m',
    templateUrl: './usun-konto-m.component.html',
    styleUrls: ['./usun-konto-m.component.css'],
    moduleId: module.id,
})
export class UsunKontoMComponent implements OnInit {
    private feedback: Feedback;
    private secureStroage = new SecureStorage;

    constructor(private page: Page, private router: RouterExtensions, private tabIndexService: TabindexService, private userService: UserService) {
        this.feedback = new Feedback();
    }

    hasloValid: boolean = true;
    form: FormGroup;
    _haslo: string;

    @ViewChild('haslo', { static: false }) hasloRef: ElementRef<TextField>;

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

        this.userService.usunKonto(this.form.get('haslo').value).then(res => {
            switch (res) {
                case 1:
                    this.userService.zmienPowiadomienia(false).then(() => {
                        this.secureStroage.removeAll().then(() => {
                            this.router.navigate([""], { clearHistory: true, transition: { name: 'slideBottom' } }).then(() => {
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
                        })
                    })
                    break;
                case 2:
                        this.feedback.show({
                            title: "Uwaga!",
                            message: "Aby usunąć swoje konto musisz nadać prawa administratora innej osobie w Twojej parafii",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color(255, 255, 207, 51),
                            type: FeedbackType.Warning,
                        });
                    break;
                case 3:
                        this.feedback.show({
                            title: "Uwaga!",
                            message: "Aktualne hasło jest niepoprawne",
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
        this.tabIndexService.nowyOutlet(2, "ustawieniaM");
        this.router.back();
    }

    dismiss()
    {
        this.hasloRef.nativeElement.dismissSoftInput()
    }
}
