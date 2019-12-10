import { Component, ElementRef, ViewChild, OnInit, ViewContainerRef } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TabindexService } from '../serwisy/tabindex.service';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { Page } from 'tns-core-modules/ui/page/page';
import { SecureStorage } from 'nativescript-secure-storage';
import { LogowanieJakoComponent } from '../shared/modale/logowanie-jako/logowanie-jako.component';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { HttpService } from '../serwisy/http.service';
import { UserService } from '../serwisy/user.service';
import { User } from '../serwisy/user.model';
import { ParafiaService } from '../serwisy/parafia.service';
import { UiService } from '../serwisy/ui.service';

@Component({
    selector: 'ns-logowanie',
    templateUrl: './logowanie.component.html',
    styleUrls: ['./logowanie.component.css'],
    moduleId: module.id,
})
export class LogowanieComponent implements OnInit {

    form: FormGroup;

    @ViewChild('email', { static: false }) emailRef: ElementRef<TextField>;
    @ViewChild('haslo', { static: false }) hasloRef: ElementRef<TextField>;

    _email: string = null;
    _haslo: string = null;

    emailValid = true;
    hasloValid = true;

    ladowanie = false;

    zapamietaj: boolean = false;

    secureStorage: SecureStorage

    constructor(private router: RouterExtensions, private tabIndexService: TabindexService,
        private page: Page, private modal: ModalDialogService, private vcRef: ViewContainerRef,
        private http: HttpService, private userService: UserService, private parafiaService: ParafiaService, private ui: UiService) {}

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.form = new FormGroup({
            email: new FormControl(this._email, { updateOn: 'change', validators: [Validators.required, Validators.email] }),
            haslo: new FormControl(this._haslo, { updateOn: 'change', validators: [Validators.required] })
        });

        this.form.get('email').statusChanges.subscribe(status => {
            this.emailValid = status === 'VALID';
        });
        this.form.get('haslo').statusChanges.subscribe(status => {
            this.hasloValid = status === 'VALID';
        });

        this.secureStorage = new SecureStorage;

        this.secureStorage.clearAllOnFirstRunSync()

        this.secureStorage.get({ key: 'pasy' }).then(value => {
            if (value !== null) {
                this.zapamietaj = true
                let dane = JSON.parse(value)
                this._email = dane.email
                this._haslo = dane.haslo

                this.emailRef.nativeElement.text = this._email
                this.hasloRef.nativeElement.text = this._haslo
            }

        }).then(() => {
            if(this.zapamietaj)
            {
                setTimeout(() => {
                    this.zaloguj()
                },100)
            }
        })

    }


    zapomnialem() {
        this.router.navigate(['/zapomnialem'], { transition: { name: 'slideBottom' } });
    }

    zaloguj() {
        this.ladowanie = true;
        this._email = this.form.get('email').value;
        this._haslo = this.form.get('haslo').value;

        this.http.logowanie(this._email, this._haslo).then(res => {
            if (res === 'brak' || res === 'niepoprawne') {
                this.ladowanie = false;
                this.ui.showFeedback('warning',"Niepoprawny adres e-mail i/lub hasło",3)
            }
            else if (res === 'nieaktywne') {
                this.ladowanie = false;
                this.ui.showFeedback('warning',"Musisz najpierw aktywować konto aby móc się zalogować",3)
            }
            else if (res === 'blad') {
                this.ladowanie = false;
                this.ui.showFeedback('error',"Wystąpił nieoczekiwany błąd",3)

            }
            else {
                let user: User = JSON.parse(JSON.stringify(res))
                this.http.nadajId_Parafii(user.id_parafii);
                this.http.nadajId_User(user.id_user);
                this.userService.zmienUsera(user);

                if (user.admin === 1) {
                    //    this.ladowanie = false;
                    this.modal.showModal(LogowanieJakoComponent, {
                        context: null,
                        viewContainerRef: this.vcRef,
                        fullscreen: false,
                        stretched: false,
                        animated: true,
                        closeCallback: null,
                        dimAmount: 0 // Sets the alpha of the background dim,

                    } as ExtendedShowModalOptions).then((result) => {

                        if (result !== undefined) {
                            this.ladowanie = true;
                            if (result === 1) {
                                this.tabIndexService.zmianaOpiekuna(true).then(resss => {
                                    if (resss === 1) {
                                        this.parafiaService.pobierzParafie().then(res => {
                                            if (res === 1) {
                                                if (this.zapamietaj) {
                                                    this.secureStorage.set({ key: 'pasy', value: JSON.stringify({ email: this._email, haslo: this._haslo }) })
                                                }
                                                else {
                                                    this.secureStorage.set({ key: 'pasy', value: null })
                                                }
                                                this.router.navigate(['/menu'], { transition: { name: 'slideTop' }, clearHistory: true });
                                            }
                                            else {
                                                this.ui.showFeedback('error',"Wystąpił nieoczekiwany błąd",3)
                                            }
                                        })
                                    }
                                    else {
                                        this.ladowanie = false;
                                        this.ui.showFeedback('error',"Wystąpił nieoczekiwany błąd",3)
                                    }
                                })
                            }
                            else if (result === 0) {

                                this.tabIndexService.zmianaOpiekuna(false).then(res => {
                                    if (res === 1) {
                                        this.router.navigate(['/menu'], { transition: { name: 'slideTop' }, clearHistory: true });
                                        if (this.zapamietaj) {
                                            this.secureStorage.set({ key: 'pasy', value: JSON.stringify({ email: this._email, haslo: this._haslo }) })
                                        }
                                        else {
                                            this.secureStorage.set({ key: 'pasy', value: null })
                                        }
                                    }
                                    else {
                                        this.ladowanie = false;
                                        this.ui.showFeedback('error',"Wystąpił nieoczekiwany błąd",3)
                                    }
                                })

                            }
                        }
                        else {
                            this.ladowanie = false;
                        }
                    });
                }
                else {
                    this.tabIndexService.zmianaOpiekuna(false).then(res => {
                        if (res === 1) {
                            this.router.navigate(['/menu'], { transition: { name: 'slideTop' }, clearHistory: true });
                            if (this.zapamietaj) {
                                this.secureStorage.set({ key: 'pasy', value: JSON.stringify({ email: this._email, haslo: this._haslo }) })
                            }
                            else {
                                this.secureStorage.set({ key: 'pasy', value: null })
                            }
                        }
                        else {
                            this.ladowanie = false;
                            this.ui.showFeedback('error',"Wystąpił nieoczekiwany błąd",3)
                        }
                    })
                }
            }
        })

    }

    doRejestracji() {
        this.router.navigate(['/rejestracja'], { transition: { name: 'slideLeft' } });
    }

    nadajHaslo() {
        this.router.navigate(['/nadaj-haslo'], { transition: { name: 'slideRight' } });
    }



    onSwipe(args: SwipeGestureEventData) {

        if (args.direction === 1) {
            this.nadajHaslo();
        }
        else if (args.direction === 2) {
            this.doRejestracji();
        }
        else if (args.direction === 8) {
            this.zapomnialem();
        }
    }

    nic() {

    }

    zmienZapamietaj() {
        this.zapamietaj = !this.zapamietaj
    }

    dismiss()
    {
        this.emailRef.nativeElement.dismissSoftInput()
    }
}


