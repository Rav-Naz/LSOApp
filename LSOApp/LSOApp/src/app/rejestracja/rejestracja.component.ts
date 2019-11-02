import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import * as utils from "tns-core-modules/utils/utils";
import { TextField } from 'tns-core-modules/ui/text-field';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterExtensions } from 'nativescript-angular/router';
import { Switch } from 'tns-core-modules/ui/switch/switch';
import { ScrollView } from 'tns-core-modules/ui/scroll-view'
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { Feedback, FeedbackType } from "nativescript-feedback";
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { WyborModalComponent } from '../shared/modale/wybor-modal/wybor-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { HttpService } from '../serwisy/http.service';


@Component({
    selector: 'ns-rejestracja',
    templateUrl: './rejestracja.component.html',
    styleUrls: ['./rejestracja.component.css'],
    moduleId: module.id,
})
export class RejestracjaComponent implements OnInit {

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
    imieNazwiskoPValid: boolean = true;
    emailPValid: boolean = true;
    hasloPValid: boolean = true;
    powtorzPValid: boolean = true;
    rodzajValid: boolean = true;

    udanaRejP: boolean = false;

    _diecezja: string = "Wybierz diecezję";
    _diecezja_id: number = 1;
    _miasto: string = "Wybierz miasto";
    _rodzaj: string = "Wybierz rodzaj parafii";
    _rodzaj_id: number = 1;
    _wezwanie: string;
    _imieNazwiskoP: string;
    _emailP: string;
    _hasloP: string;

    ////////////////////////////

    dialog: { title: string; message: string; cancelButtonText: string; actions: string[]; };
    private miasta = ["Rzeszów", "Warszawa"];
    private feedback: Feedback;

    constructor(private router: RouterExtensions, private page: Page, private modal: ModalDialogService, private vcRef: ViewContainerRef, private httpService: HttpService) {
        this.feedback = new Feedback();

    }


    ngOnInit() {
        this.page.actionBarHidden = true;

        this.formP = new FormGroup({
            wezwanie: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń ]{2  ,30})')] }),
            miasto:  new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń ]{2,30})')] }),
            emailP: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.email] }),
            hasloP: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń0-9+*@#$&^~?_]{6,15})')] }),
            powtorzP: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
        })

        this.formP.get('wezwanie').statusChanges.subscribe(status => {
            this.wezwanieValid = status === 'VALID';
        });
        this.formP.get('miasto').statusChanges.subscribe(status => {
            this.miastoValid = status === 'VALID';
        });
        this.formP.get('emailP').statusChanges.subscribe(status => {
            this.emailPValid = status === 'VALID';
        });
        this.formP.get('hasloP').statusChanges.subscribe(status => {
            this.hasloPValid = status === 'VALID';
        });
        this.formP.get('powtorzP').statusChanges.subscribe(status => {
            this.powtorzPValid = status === 'VALID';
        });
    }

    displayActionDialog(akcja: 'stopien' | 'diecezja' | 'miasto' | 'rodzaj') {

        let wybory: Array<any>;

        if (akcja === 'diecezja') {
            wybory = ['białostocka', 'bielsko-żywiecka', 'bydgoska', 'częstochowska', 'drohiczyńska', 'elbląska', 'ełcka', 'gdańska', 'gliwicka', 'gnieźnieńska', 'kaliska', 'katowicka', 'kielecka', 'koszalińsko-kołobrzeska', 'krakowska', 'legnicka', 'lubelska', 'łomżyńska', 'łowicka', 'łódzka', 'opolska', 'Ordynariat Polowy WP', 'pelplińska', 'płocka', 'Polska Misja Katolicka', 'poznańska', 'Prałatura Opus Dei', 'przemyska', 'radomska', 'rzeszowska', 'sandomierska', 'siedlecka', 'sosnowiecka', 'szczecińsko-kamieńska', 'świdnicka', 'tarnowska', 'toruńska', 'warmińska', 'warszawsko-praska', 'włocławska', 'wrocławska', 'zamojsko-lubaczowska', 'zielonogórsko-gorzowska']

        }
        else if (akcja === 'miasto') {
            wybory = this.miasta
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
        });
    }

    displayAlertDialog(messege: string) {
        this.feedback.show({
            title: "Uwaga!",
            message: messege,
            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
            duration: 3000,
            backgroundColor: new Color(255, 255, 207, 51),
            type: FeedbackType.Warning,
        });
    }

    regulamin() {
        utils.openUrl("https://lsoapp.pl/polityka-prywatnosci/")
    }
    zarejestrujP() {

        if (this._diecezja === "Diecezja") {
            this.diecezjaValid = false;
        }

        if (!this.formP.valid) {
            this.feedback.show({
                title: "Uwaga!",
                message: "Wypełnij poprawnie wszystkie pola",
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 3000,
                backgroundColor: new Color(255, 255, 207, 51),
                type: FeedbackType.Warning,

            });
            return;
        }

        if (this.formP.get('hasloP').value !== this.formP.get('powtorzP').value) {
            this.powtorzPValid = false;
            setTimeout(() => {
                let scroll = this.scrollView.nativeElement;
                scroll.scrollToVerticalOffset(scroll.scrollableHeight, true);
            }, 100)
            return;
        }
        if (!this.regulaminPRef.nativeElement.checked) {
            this.feedback.show({
                title: "Uwaga!",
                message: "Zaakceptuj regulamin i politykę prywatności",
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 3000,
                backgroundColor: new Color(255, 255, 207, 51),
                type: FeedbackType.Warning,

            });
            setTimeout(() => {
                let scroll = this.scrollView.nativeElement;
                scroll.scrollToVerticalOffset(scroll.scrollableHeight, true);
            }, 100)
            return;
        }


        this._wezwanie = this.formP.get('wezwanie').value;
        this._miasto = this.formP.get('miasto').value;
        this._emailP = this.formP.get('emailP').value;
        this._hasloP = this.formP.get('hasloP').value;

        this.httpService.rejestracja(this._wezwanie, this._diecezja_id + 1, this._miasto, this._rodzaj_id + 1, this._emailP, this._hasloP).then((res) => {
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
                    this.udanaRejP = true;
                    break;

                case 2:
                    this.displayAlertDialog('Ten adres e-mail jest już przypisany do innego konta!')
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
        });

    }

    focus() {
        this.wezwanieRef.nativeElement.focus();
    }

    powrot() {
        this.router.back();
    }
}
