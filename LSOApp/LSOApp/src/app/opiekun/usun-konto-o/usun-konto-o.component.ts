import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { HttpService } from '~/app/serwisy/http.service';
import { UserService } from '~/app/serwisy/user.service';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { WiadomosciService } from '~/app/serwisy/wiadomosci.service';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { UiService } from '~/app/serwisy/ui.service';
import { SecureStorage } from 'nativescript-secure-storage';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';

@Component({
    selector: 'ns-usun-konto-o',
    templateUrl: './usun-konto-o.component.html',
    styleUrls: ['./usun-konto-o.component.css'],
    moduleId: module.id,
})
export class UsunKontoOComponent implements OnInit {

    constructor(private page: Page, private router: RouterExtensions, private userService: UserService,
        private tabIndexService: TabindexService, private http: HttpService,
        private parafiaService: ParafiaService, private wiadomosciService: WiadomosciService, private wydarzeniaService: WydarzeniaService, public ui: UiService) {}

    @ViewChild('haslo', { static: false }) hasloRef: ElementRef<TextField>;

    hasloValid: boolean = true;
    form: FormGroup;
    _haslo: string;

    secureStorage: SecureStorage;

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.secureStorage = new SecureStorage;

        this.form = new FormGroup({
            haslo: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.minLength(1)] })
        });

        this.form.get('haslo').statusChanges.subscribe(status => {
            this.hasloValid = status === 'VALID';
        });
    }

    zapisz() {

        this._haslo = this.form.get('haslo').value;
        this.ui.zmienStan(4, true)
        this.http.usuwanieParafii(this._haslo).then(res => {
            switch (res) {
                case 0:
                    this.ui.zmienStan(4, false)
                    this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    break;
                case 1:
                    this.secureStorage.removeAll().then(() => {
                        this.router.navigate([""], { clearHistory: true, transition: { name: 'slideBottom' } }).then(() => {
                            this.http.wyczysc()
                            this.parafiaService.wyczysc()
                            this.tabIndexService.wyczysc()
                            this.userService.wyczysc()
                            this.wiadomosciService.wyczysc()
                            this.wydarzeniaService.wyczysc()
                            setTimeout(() => {
                                this.ui.showFeedback('succes',"Konto zostało usunięte pomyślnie. Dziękujemy za skorzystanie z aplikacji :)",3)
                            }, 400)
                        });
                    })

                    break;
                case 2:
                    this.ui.zmienStan(4, false)
                    this.ui.showFeedback('warning',"Wpisane hasło jest niepoprawne",3)
                    break;
                case 3:
                    this.secureStorage.removeAll().then(() => {
                        setTimeout(() => {
                            this.ui.zmienStan(4, false)
                            this.router.navigate([""], { clearHistory: true, transition: { name: 'slideBottom' } }).then(() => {
                                this.ui.showFeedback('error',"BŁĄD KRYTYCZNY",3)
                            });
                        }, 100)
                    })

                    break;
                default:
                    this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    break;
            }
        })

    }

    anuluj() {
        this.tabIndexService.nowyOutlet(6, "ustawieniaO");
        this.router.back();
    }

    dismiss()
    {
        this.hasloRef.nativeElement.dismissSoftInput()
    }

}
