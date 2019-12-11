import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { RouterExtensions } from 'nativescript-angular/router';
import { Page} from 'tns-core-modules/ui/page/page';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { HttpService } from '~/app/serwisy/http.service';
import { UiService } from '~/app/serwisy/ui.service';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { ModalDialogService } from 'nativescript-angular/directives/dialogs';
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';

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
    dane;
    checked: boolean = false;

    wyslanePrzyp: number = 0;

    constructor(private router: RouterExtensions, private page: Page, private tabIndexService: TabindexService,
        private parafiService: ParafiaService, private http: HttpService, public ui: UiService, private modal: ModalDialogService, private vcRef: ViewContainerRef) {}

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.dane = this.parafiService.wyslanyEmail

        if(this.dane.email !== null && this.dane.aktywny === 1)
        {
            this.wyslanePrzyp = 2
        }
        else if(this.dane.email !== null && this.dane.aktywny === 0)
        {
            this.wyslanePrzyp = 1;
        }
        else
        {
            this.wyslanePrzyp = 0;
        }

        this.form = new FormGroup({
            email: new FormControl(this.dane.email, { updateOn: 'change', validators: [Validators.required, Validators.email] })
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

            this.ui.showFeedback('warning',"Wprowadź poprawny adres e-mail",3)
            return;
        }

        this.ui.zmienStan(4,true)

        this.http.aktywacjaMinistranta(this.form.get('email').value, this.parafiService.aktualnyMinistrantId).then(res => {
            switch (res) {
                case 0:
                    this.ui.zmienStan(4,false)
                    this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    break;

                case 1:
                    this.parafiService.pobierzMinistrantow().then(() => {
                        this.parafiService.WybranyMinistrant(this.parafiService.aktualnyMinistrantId)
                        this.wyslanePrzyp = 1;
                        this.ui.zmienStan(4,false)
                    })
                    break;

                case 2:
                        this.ui.zmienStan(4,false)
                        this.ui.showFeedback('warning',"Ten adres e-mail jest już przypisany do innego konta",3)
                    break;
                default:
                        this.ui.zmienStan(4,false)
                        this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    break;
            }
        })

    }

    usun()
    {
        this.czyKontynuowac(true).then(wybor => {
            if(!wybor)
            {

                this.ui.zmienStan(4,true)
                this.ui.zmienStan(5,false)
                this.parafiService.usunKontoMinistanta(this.dane.id_user).then(res => {
                    if(res === 1)
                    {

                        setTimeout(() => {
                            this.ui.showFeedback('succes',"Usunięto dostęp do konta",3)
                        }, 400)
                        this.ui.zmienStan(4,false)
                        this.powrot();
                    }
                    else
                    {
                        this.ui.zmienStan(5,false)
                        this.ui.zmienStan(4,false)
                        this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    }
                })
            }
        })
    }

    check(event: boolean)
    {
        this.checked = event

    }

    private czyKontynuowac(zmiana: boolean) {
        return new Promise<boolean>((resolve) => {
            if (zmiana === true) {
                this.modal.showModal(PotwierdzenieModalComponent, {
                    context: "Usuwając dostęp do konta dla ministranta utraci on mozliwość logowania, lecz jego dane pozostaną.\nCzy chcesz kontynuować?",
                    viewContainerRef: this.vcRef,
                    fullscreen: false,
                    stretched: false,
                    animated: true,
                    closeCallback: null,
                    dimAmount: 0.8 // Sets the alpha of the background dim,

                } as ExtendedShowModalOptions).then((wybor) => {
                    if (wybor === true) {
                        resolve(false);
                    }
                    else {
                        resolve(true);
                    }
                })
            }
            else {
                resolve(false)
            }
        })
    }

    dismiss()
    {
        if(this.wyslanePrzyp === 0)
        {
            this.emailRef.nativeElement.dismissSoftInput()
        }
    }
}
