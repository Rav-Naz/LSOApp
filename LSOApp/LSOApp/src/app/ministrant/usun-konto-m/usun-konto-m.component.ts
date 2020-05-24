import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { SecureStorage } from "nativescript-secure-storage";
import { UserService } from '~/app/serwisy/user.service';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { UiService } from '~/app/serwisy/ui.service';

@Component({
    selector: 'ns-usun-konto-m',
    templateUrl: './usun-konto-m.component.html',
    styleUrls: ['./usun-konto-m.component.css'],
    moduleId: module.id,
})
export class UsunKontoMComponent implements OnInit {
    private secureStroage = new SecureStorage;

    constructor(private page: Page, private router: RouterExtensions, private tabIndexService: TabindexService,
         private userService: UserService, private ui: UiService)
    {}

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

        this.ui.zmienStan(4,true)
        this.userService.usunKonto(this.form.get('haslo').value).then(res => {
            switch (res) {
                case 1:
                    this.userService.zmienPowiadomienia(false).then(() => {
                        this.secureStroage.removeAll().then(() => {
                            this.router.navigate([""], { clearHistory: true, transition: { name: 'slideBottom' } }).then(() => {
                                setTimeout(() => {
                                    this.ui.showFeedback('succes',"Konto zostało usunięte pomyślnie. Dziękujemy za skorzystanie z aplikacji :)",3)
                                }, 400)
                            });
                        })
                    })
                    break;
                case 2:
                        this.ui.showFeedback('warning',"Aby usunąć swoje konto musisz nadać prawa administratora innej osobie w Twojej parafii",3)
                    break;
                case 3:
                        this.ui.showFeedback('warning',"Aktualne hasło jest niepoprawne",3)
                    break;
                case 0:
                        this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    break;
                case 404:
                        this.ui.sesjaWygasla()
                    break;
                default:
                        this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    break;
            }
            this.ui.zmienStan(4,false)
        })
    }

    anuluj() {
        this.tabIndexService.nowyOutlet(2, "ustawieniaM");
        this.router.backToPreviousPage();
    }

    dismiss()
    {
        this.hasloRef.nativeElement.dismissSoftInput()
    }
}
