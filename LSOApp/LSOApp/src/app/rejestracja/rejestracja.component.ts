import { Component, OnInit, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';
import * as utils from "tns-core-modules/utils/utils";
import { TextField } from 'tns-core-modules/ui/text-field';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterExtensions } from 'nativescript-angular/router';
import { Switch } from 'tns-core-modules/ui/switch/switch';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { ScrollView } from 'tns-core-modules/ui/scroll-view'
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { Feedback, FeedbackType} from "nativescript-feedback";
import { UiService } from '../serwisy/ui.service';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { WyborModalComponent } from '../shared/modale/wybor-modal/wybor-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';


@Component({
    selector: 'ns-rejestracja',
    templateUrl: './rejestracja.component.html',
    styleUrls: ['./rejestracja.component.css'],
    moduleId: module.id,
})
export class RejestracjaComponent implements OnInit {

    // formM: FormGroup;

    // @ViewChild('imieM', { static: false }) imieMRef: ElementRef<TextField>;
    // @ViewChild('nazwiskoM', { static: false }) nazwiskoMRef: ElementRef<TextField>;
    // @ViewChild('emailM', { static: false }) emailMRef: ElementRef<TextField>;
    // @ViewChild('hasloM', { static: false }) hasloMRef: ElementRef<TextField>;
    // @ViewChild('powtorzM', { static: false }) powtorzMRef: ElementRef<TextField>;
    // @ViewChild('regulaminM', { static: false }) regulaminMRef: ElementRef<Switch>;

    // imieMValid: boolean = true;
    // nazwiskoMValid: boolean = true;
    // stopienMValid: boolean = true;
    // emailMValid: boolean = true;
    // hasloMValid: boolean = true;
    // powtorzMValid: boolean = true;

    // udanaRejM: boolean = false;

    //  _stopien: string = "Stopień";
    //  _imieM: string;
    //  _nazwiskoM: string;
    //  _emailM: string;
    //  _hasloM: string;

    /////////////////////////////

    formP: FormGroup;

    @ViewChild('scroll', { static: false }) scrollView: ElementRef<ScrollView>;
    @ViewChild('wezwanie', { static: false }) wezwanieRef: ElementRef<TextField>;
    // @ViewChild('imieNazwiskoP', { static: false }) imieNazwiskoPRef: ElementRef<TextField>;
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
     _miasto: string = "Wybierz miasto";
     _rodzaj: string = "Wybierz rodzaj parafii";
     _wezwanie: string;
     _imieNazwiskoP: string;
     _emailP: string;
     _hasloP: string;

    ////////////////////////////

    dialog: { title: string; message: string; cancelButtonText: string; actions: string[]; };
    private miasta = ["Rzeszów","Warszawa"];
    private feedback: Feedback;

    constructor(private router: RouterExtensions, private page: Page, private uiService: UiService, private modal: ModalDialogService, private vcRef: ViewContainerRef) {
        this.feedback = new Feedback();

    }


    ngOnInit() {
        this.page.actionBarHidden = true;

        // this.formM = new FormGroup({
        //     imieM: new FormControl(null, { updateOn: 'blur', validators: [Validators.required, Validators.minLength(3)] }),
        //     nazwiskoM: new FormControl(null, { updateOn: 'blur', validators: [Validators.required, Validators.minLength(3)] }),
        //     emailM: new FormControl(null, { updateOn: 'blur', validators: [Validators.required, Validators.email] }),
        //     hasloM: new FormControl(null, { updateOn: 'blur', validators: [Validators.required, Validators.minLength(3)] }),
        //     powtorzM: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.minLength(3)] })
        // });
        this.formP = new FormGroup({
            wezwanie: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.minLength(3), Validators.maxLength(30)] }),
            // imieNazwiskoP: new FormControl(null, { updateOn: 'blur', validators: [Validators.required, Validators.minLength(3)] }),
            emailP: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.email] }),
            hasloP: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń0-9+*@#$&^~?_]{6,15})')] }),
            powtorzP: new FormControl(null, { updateOn: 'change', validators: [Validators.required]}),
        })

        // this.formM.get('imieM').statusChanges.subscribe(status => {
        //     this.imieMValid = status === 'VALID';
        // });
        // this.formM.get('nazwiskoM').statusChanges.subscribe(status => {
        //     this.nazwiskoMValid = status === 'VALID';
        // });
        // this.formM.get('emailM').statusChanges.subscribe(status => {
        //     this.emailMValid = status === 'VALID';
        // });
        // this.formM.get('hasloM').statusChanges.subscribe(status => {
        //     this.hasloMValid = status === 'VALID';
        // });
        // this.formM.get('powtorzM').statusChanges.subscribe(status => {
        //     this.powtorzMValid = status === 'VALID';
        // });

        ///////////////////////////////////////////////////////////////

        this.formP.get('wezwanie').statusChanges.subscribe(status => {
            this.wezwanieValid = status === 'VALID';
        });
        // this.formP.get('imieNazwiskoP').statusChanges.subscribe(status => {
        //     this.imieNazwiskoPValid = status === 'VALID';
        // });
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
        // if (akcja === 'stopien') {
        //     this.dialog = {
        //         title: "Stopień ministrancki",
        //         message: "Wybierz swój stopień",
        //         cancelButtonText: "Anuluj",
        //         actions: ["Kandydat", "Ministrant Ołtarza", "Choralista", "Ministrant Światła", "Ministrant Krzyża", "Ministrant Księgi", "Ministrant Kadzidła", "Ministrant Wody", "Lektor", "Ceremoniarz", "Szafarz"]
        //     };
        // }
        if (akcja === 'diecezja') {
            wybory = ['białostocka','bielsko-żywiecka','bydgoska','częstochowska','drohiczyńska','elbląska','ełcka','gdańska','gliwicka','gnieźnieńska','kaliska','katowicka','kielecka','koszalińsko-kołobrzeska','krakowska','legnicka','lubelska','łomżyńska','łowicka','łódzka','opolska','Ordynariat Polowy WP','pelplińska','płocka','Polska Misja Katolicka','poznańska','Prałatura Opus Dei','przemyska','radomska','rzeszowska','sandomierska','siedlecka','sosnowiecka','szczecińsko-kamieńska','świdnicka','tarnowska','toruńska','warmińska','warszawsko-praska','włocławska','wrocławska','zamojsko-lubaczowska','zielonogórsko-gorzowska']

        }
        else if (akcja === 'miasto') {
                wybory = this.miasta
        }

        else if (akcja === 'rodzaj') {
                wybory = ['Diecezjalni','Albertyni','Augustianie','Barnabici','Bazylianie','Benedyktyni','Bernardyni','Bonifratrzy','Bracia Gabrieliści','Bracia Pocieszyciele','Bracia Serca Jezusowego','Bracia Szkolni','Chrystusowcy','Cystersi','Doloryści','Dominikanie','Duchacze','Filipini','Franciszkanie OFM','Franciszkanie Konwentualni OFMConv','Guanellianie','Jezuici','Józefici','Kameduli','Kamilianie','Kanonicy Regularni','Kapucyni OFMCap','Kapucyni Tercjarze','Karmelici','Karmelici Bosi','Klaretyni','Kombonianie','Mali Bracia Jezusa','Marianie','Marianiści','Michalici','Misjonarze','Misjonarze Krwi Chrystusa','Misjonarze Matki Bożej Pocieszenia','Misjonarze Montfortanie','Misjonarze Oblaci Maryi Niepokalanej','Misjonarze Świętej Rodziny','Misjonarze z Mariannhill','Ojcowie Biali','Orioniści','Pallotyni','Pasjoniści','Paulini','Pauliści','Pijarzy','Redemptoryści','Rogacjoniści','Saletyni','Salezjanie','Salwatorianie','Sercanie','Sercanie Biali','Stowarzyszenie Misji Afrykańskich','Synowie Maryi','Trynitarze','Werbiści','Zmartwychwstańcy']
        }

        this.modal.showModal(WyborModalComponent,{
            context: wybory,
            viewContainerRef: this.uiService.getRootVCRef() ? this.uiService.getRootVCRef() : this.vcRef,
            fullscreen: false,
            stretched: false,
            animated:  true,
            closeCallback: null,
            dimAmount: 0.8 // Sets the alpha of the background dim,

          } as ExtendedShowModalOptions).then((result) => {

            // if (akcja === 'stopien') {
            //     if (result !== 'Anuluj') {
            //         this._stopien = result;
            //         this.stopienMValid = true;
            //     }
            //     else {
            //         if (this._stopien === 'Stopień') {
            //             this.stopienMValid = false;
            //         }
            //     }
            // }
            if (akcja === 'diecezja') {
                if (result !== undefined) {
                    this._diecezja = wybory[result];
                    this.diecezjaValid = true;
                }
                else {
                    if (this._diecezja === 'Wybierz diecezję') {
                        this.diecezjaValid = false;
                    }
                }
            }
            else if (akcja === 'miasto') {
                if (result !== undefined) {
                    this._miasto = wybory[result];
                    this.miastoValid = true;
                }
                else {
                    if (this._miasto === 'Wybierz miasto') {
                        this.miastoValid = false;
                    }
                }
            }
            else if (akcja === 'rodzaj') {
                if (result !== undefined) {
                    this._rodzaj = wybory[result];
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
        backgroundColor: new Color(255,255, 207, 51),
        type: FeedbackType.Warning,
      });
}

regulamin() {
    utils.openUrl("https://lsoapp.pl/polityka-prywatnosci/")
}

// zarejestrujM() {
//     if (this._stopien === "Stopień") {
//         this.stopienMValid = false;
//     }
//     this.imieMRef.nativeElement.focus();
//     this.nazwiskoMRef.nativeElement.focus();
//     this.emailMRef.nativeElement.focus();
//     this.powtorzMRef.nativeElement.focus();
//     this.hasloMRef.nativeElement.focus();
//     this.powtorzMRef.nativeElement.focus();
//     this.powtorzMRef.nativeElement.dismissSoftInput();

//     if (!this.formM.valid) {
//         this.displayAlertDialog("Wypełnij poprawnie wszystkie pola");
//         return;
//     }

//     if (this.formM.get('hasloM').value !== this.formM.get('powtorzM').value) {
//         this.powtorzMValid = false;
//         this.displayAlertDialog("Hasła się różnią");
//         return;
//     }

//     if (!this.regulaminMRef.nativeElement.checked) {
//         this.displayAlertDialog("Zaakceptuj regulamin i politykę prywatności");
//         return;
//     }

    // this.formM.reset();
    // this.imieMValid = true;
    // this.nazwiskoMValid = true;
    // this._stopien = "Stopień";
    // this.emailMValid = true;
    // this.hasloMValid = true;
    // this.powtorzMValid = true;
    // this.router.backToPreviousPage();
    // this._imieM = this.formM.get('imieM').value;
    // this._nazwiskoM = this.formM.get('nazwiskoM').value;
    // this._emailM = this.formM.get('emailM').value;
    // this._hasloM = this.formM.get('hasloM').value;
    // this.udanaRejM = true;
// }

zarejestrujP()
{
    if (this._diecezja === "Diecezja") {
        this.diecezjaValid = false;
    }
    if (this._miasto === "Miasto") {
        this.miastoValid = false;
    }

    if (!this.formP.valid) {
        this.feedback.show({
            title: "Uwaga!",
            message: "Wypełnij poprawnie wszystkie pola",
            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
            duration: 3000,
            backgroundColor: new Color(255,255, 207, 51),
            type: FeedbackType.Warning,

          });
        return;
    }

    if (this.formP.get('hasloP').value !== this.formP.get('powtorzP').value) {
        this.powtorzPValid = false;
        setTimeout(() => {
            let scroll = this.scrollView.nativeElement;
            scroll.scrollToVerticalOffset(scroll.scrollableHeight,true);
        },100)
        return;
    }
    if (!this.regulaminPRef.nativeElement.checked) {
        this.feedback.show({
            title: "Uwaga!",
            message: "Zaakceptuj regulamin i politykę prywatności",
            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
            duration: 3000,
            backgroundColor: new Color(255,255, 207, 51),
            type: FeedbackType.Warning,

          });
        setTimeout(() => {
            let scroll = this.scrollView.nativeElement;
            scroll.scrollToVerticalOffset(scroll.scrollableHeight,true);
        },100)
        return;
    }


    this._wezwanie = this.formP.get('wezwanie').value;
    // this._imieNazwiskoP = this.formP.get('imieNazwiskoP').value;
    this._emailP = this.formP.get('emailP').value;
    this._hasloP = this.formP.get('hasloP').value;
    this.udanaRejP = true;

}

focus()
{
    this.wezwanieRef.nativeElement.focus();
}

powrot() {
    this.router.backToPreviousPage();
}

onSwipe(args: SwipeGestureEventData) {

    if (args.direction === 1) {
        this.powrot();
    }
}
}
