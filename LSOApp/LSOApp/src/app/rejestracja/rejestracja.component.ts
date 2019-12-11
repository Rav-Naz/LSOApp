import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import * as utils from "tns-core-modules/utils/utils";
import { TextField } from 'tns-core-modules/ui/text-field';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterExtensions } from 'nativescript-angular/router';
import { Switch } from 'tns-core-modules/ui/switch/switch';
import { ScrollView } from 'tns-core-modules/ui/scroll-view'
import { Page } from 'tns-core-modules/ui/page/page';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { WyborModalComponent } from '../shared/modale/wybor-modal/wybor-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { HttpService } from '../serwisy/http.service';
import { UiService } from '../serwisy/ui.service';


@Component({
    selector: 'ns-rejestracja',
    templateUrl: './rejestracja.component.html',
    styleUrls: ['./rejestracja.component.css'],
    moduleId: module.id,
})
export class RejestracjaComponent implements OnInit {

    ladowanie: boolean = false;

    formP: FormGroup;

    @ViewChild('scroll', { static: false }) scrollView: ElementRef<ScrollView>;
    @ViewChild('wezwanie', { static: false }) wezwanieRef: ElementRef<TextField>;
    @ViewChild('emailP', { static: false }) emailPRef: ElementRef<TextField>;
    @ViewChild('hasloP', { static: false }) hasloPRef: ElementRef<TextField>;
    @ViewChild('powtorzP', { static: false }) powtorzPRef: ElementRef<TextField>;
    @ViewChild('regulaminP', { static: false }) regulaminPRef: ElementRef<Switch>;

    diecezjaValid: boolean = true;
    miastoValid: boolean = true;
    wezwanieValid: boolean = true;
    rodzajValid: boolean = true;
    imieValid: boolean = true;
    nazwiskoValid: boolean = true;
    stopienValid: boolean = true;
    emailPValid: boolean = true;
    hasloPValid: boolean = true;
    powtorzPValid: boolean = true;

    udanaRejP: boolean = false;

    _diecezja: string = "Wybierz diecezję";
    _diecezja_id: number = 1;
    _miasto: string;
    _rodzaj: string = "Wybierz rodzaj parafii";
    _rodzaj_id: number = 1;
    _stopien: string = "Wybierz stopień"
    _stopien_id: number = 1
    _wezwanie: string = '';
    _imie: string;
    _nazwisko: string;
    _emailP: string;
    _hasloP: string;

    ////////////////////////////

    dialog: { title: string; message: string; cancelButtonText: string; actions: string[]; };

    constructor(private router: RouterExtensions, private page: Page, private modal: ModalDialogService,
        private vcRef: ViewContainerRef, private httpService: HttpService, private ui: UiService) {}


    ngOnInit() {
        this.page.actionBarHidden = true;

        this.formP = new FormGroup({
            wezwanie: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń .]{2,30})')] }),
            miasto:  new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń -]{2,30})')] }),
            imie: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń ]{1,20})')] }),
            nazwisko: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń-]{1,20})')] }),
            emailP: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.email] }),
            // hasloP: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń0-9+*@#$&^~?_]{6,15})')] }),
            // powtorzP: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
        })

        this.formP.get('wezwanie').statusChanges.subscribe(status => {
            this.wezwanieValid = status === 'VALID';
            this._wezwanie = this.formP.get('wezwanie').value
        });
        this.formP.get('miasto').statusChanges.subscribe(status => {
            this.miastoValid = status === 'VALID';
        });
        this.formP.get('imie').statusChanges.subscribe(status => {
            this.imieValid = status === 'VALID';
        });
        this.formP.get('nazwisko').statusChanges.subscribe(status => {
            this.nazwiskoValid = status === 'VALID';
        });
        this.formP.get('emailP').statusChanges.subscribe(status => {
            this.emailPValid = status === 'VALID';
        });
        // this.formP.get('hasloP').statusChanges.subscribe(status => {
        //     this.hasloPValid = status === 'VALID';
        // });
        // this.formP.get('powtorzP').statusChanges.subscribe(status => {
        //     this.powtorzPValid = status === 'VALID';
        // });
    }

    displayActionDialog(akcja: 'stopien' | 'diecezja' | 'rodzaj') {

        let wybory: Array<any>;

        if (akcja === 'diecezja') {
            wybory = ['białostocka', 'bielsko-żywiecka', 'bydgoska', 'częstochowska', 'drohiczyńska', 'elbląska', 'ełcka', 'gdańska', 'gliwicka', 'gnieźnieńska', 'kaliska', 'katowicka', 'kielecka', 'koszalińsko-kołobrzeska', 'krakowska', 'legnicka', 'lubelska', 'łomżyńska', 'łowicka', 'łódzka', 'opolska', 'Ordynariat Polowy WP', 'pelplińska', 'płocka', 'Polska Misja Katolicka', 'poznańska', 'Prałatura Opus Dei', 'przemyska', 'radomska', 'rzeszowska', 'sandomierska', 'siedlecka', 'sosnowiecka', 'szczecińsko-kamieńska', 'świdnicka', 'tarnowska', 'toruńska', 'warmińska', 'warszawsko-praska', 'włocławska', 'wrocławska', 'zamojsko-lubaczowska', 'zielonogórsko-gorzowska']

        }
        else if (akcja === 'stopien') {
            wybory = ["Ceremoniarz", "Szafarz", "Ksiądz", "Opiekun"]
        }

        else if (akcja === 'rodzaj') {
            wybory = ['Diecezjalni', 'Albertyni', 'Augustianie', 'Barnabici', 'Bazylianie', 'Benedyktyni', 'Bernardyni', 'Bonifratrzy', 'Bracia Gabrieliści', 'Bracia Pocieszyciele', 'Bracia Serca Jezusowego', 'Bracia Szkolni', 'Chrystusowcy', 'Cystersi', 'Doloryści', 'Dominikanie', 'Duchacze', 'Filipini', 'Franciszkanie OFM', 'Franciszkanie Konwentualni OFMConv', 'Guanellianie', 'Jezuici', 'Józefici', 'Kameduli', 'Kamilianie', 'Kanonicy Regularni', 'Kapucyni OFMCap', 'Kapucyni Tercjarze', 'Karmelici', 'Karmelici Bosi', 'Klaretyni', 'Kombonianie', 'Mali Bracia Jezusa', 'Marianie', 'Marianiści', 'Michalici', 'Misjonarze', 'Misjonarze Krwi Chrystusa', 'Misjonarze Matki Bożej Pocieszenia', 'Misjonarze Montfortanie', 'Misjonarze Oblaci Maryi Niepokalanej', 'Misjonarze Świętej Rodziny', 'Misjonarze z Mariannhill', 'Ojcowie Biali', 'Orioniści', 'Pallotyni', 'Pasjoniści', 'Paulini', 'Pauliści', 'Pijarzy', 'Redemptoryści', 'Rogacjoniści', 'Saletyni', 'Salezjanie', 'Salwatorianie', 'Sercanie', 'Sercanie Biali', 'Stowarzyszenie Misji Afrykańskich', 'Synowie Maryi', 'Trynitarze', 'Werbiści', 'Zmartwychwstańcy']
        }

        this.modal.showModal(WyborModalComponent, {
            context: wybory,
            viewContainerRef: this.vcRef,
            fullscreen: false,
            stretched: false,
            animated: true,
            closeCallback: null,
            dimAmount: 0.8 // Sets the alpha of the background dim,

        } as ExtendedShowModalOptions).then((result) => {

            if (akcja === 'diecezja') {
                if (result !== undefined) {
                    this._diecezja = wybory[result];
                    this._diecezja_id = result;
                    this.diecezjaValid = true;
                }
                else {
                    if (this._diecezja === 'Wybierz diecezję') {
                        this.diecezjaValid = false;
                    }
                }
            }
            else if (akcja === 'rodzaj') {
                if (result !== undefined) {
                    this._rodzaj = wybory[result];
                    this._rodzaj_id = result;
                    this.rodzajValid = true;
                }
                else {
                    if (this._rodzaj === 'Wybierz rodzaj parafii') {
                        this.rodzajValid = false;
                    }
                }
            }

            else if (akcja === 'stopien') {
                if (result !== undefined) {
                    this._stopien = wybory[result];
                    this._stopien_id = result + 9;
                    this.stopienValid = true;
                }
                else {
                    if (this._stopien === 'Wybierz stopień') {
                        this.stopienValid = false;
                    }
                }
            }
        });
    }

    displayAlertDialog(messege: string) {
        this.ui.showFeedback('warning',messege,3)
    }

    regulamin() {
        utils.openUrl("https://lsoapp.pl/polityka-prywatnosci/")
    }
    zarejestrujP() {

        if (this._diecezja === "Diecezja") {
            this.diecezjaValid = false;
        }

        if (!this.formP.valid) {
            this.ui.showFeedback('warning',"Wypełnij poprawnie wszystkie pola",3)
            return;
        }

        // if (this.formP.get('hasloP').value !== this.formP.get('powtorzP').value) {
        //     this.powtorzPValid = false;
        //     setTimeout(() => {
        //         let scroll = this.scrollView.nativeElement;
        //         scroll.scrollToVerticalOffset(scroll.scrollableHeight, true);
        //     }, 100)
        //     return;
        // }
        if (!this.regulaminPRef.nativeElement.checked) {
            this.ui.showFeedback('warning',"Zaakceptuj regulamin i politykę prywatności",3)
            setTimeout(() => {
                let scroll = this.scrollView.nativeElement;
                scroll.scrollToVerticalOffset(scroll.scrollableHeight, true);
            }, 100)
            return;
        }


        this._wezwanie = this.formP.get('wezwanie').value;
        this._miasto = this.formP.get('miasto').value;
        this._emailP = this.formP.get('emailP').value;
        // this._hasloP = this.formP.get('hasloP').value;
        this._imie = this.formP.get('imie').value;
        this._nazwisko = this.formP.get('nazwisko').value;

        this.ladowanie = true;

        this.httpService.rejestracja(this._wezwanie, this._diecezja_id, this._miasto, this._rodzaj_id, this._stopien_id, this._imie, this._nazwisko, this._emailP/*, this._hasloP*/).then((res) => {
            switch (res) {
                case 0:
                    this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    this.ladowanie = false;
                    break;

                case 1:
                    this.udanaRejP = true;
                    this.ladowanie = false;
                    break;

                case 2:
                    this.displayAlertDialog('Ten adres e-mail jest już przypisany do innego konta!')
                    this.ladowanie = false;
                    break;
                default:
                    this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    this.ladowanie = false;
                    break;
            }
        });

    }

    focus() {
        this.wezwanieRef.nativeElement.focus();
    }

    powrot() {
        this.router.back();
    }

    nic()
    {

    }

    dismiss()
    {
        if(!this.udanaRejP)
        {
            this.emailPRef.nativeElement.dismissSoftInput()
        }
    }
}
