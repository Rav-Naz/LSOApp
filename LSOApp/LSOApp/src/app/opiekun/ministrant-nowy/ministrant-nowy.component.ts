import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { Stopien } from '~/app/serwisy/stopien.model';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { Feedback, FeedbackType } from "nativescript-feedback";
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { WyborModalComponent } from '~/app/shared/modale/wybor-modal/wybor-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';

@Component({
    selector: 'ns-ministrant-nowy',
    templateUrl: './ministrant-nowy.component.html',
    styleUrls: ['./ministrant-nowy.component.css'],
    moduleId: module.id,
})
export class MinistrantNowyComponent implements OnInit {

    private feedback: Feedback;

    constructor(private page: Page, private router: RouterExtensions, private parafiaService: ParafiaService, private tabIndexService: TabindexService, private modal: ModalDialogService, private vcRef: ViewContainerRef) {
        this.feedback = new Feedback();
    }

    form: FormGroup;

    imieValid: boolean = true;
    nazwiskoValid: boolean = true;
    stopienValid: boolean = true;
    emailValid: boolean = true;

    _imie: string;
    _nazwisko: string;
    _email: string;
    _stopien: Stopien;

    stopienNazwa: string = "Wybierz stopień";

    @ViewChild('imie', { static: false }) imieRef: ElementRef<TextField>;
    @ViewChild('nazwisko', { static: false }) nazwiskoRef: ElementRef<TextField>;
    @ViewChild('email', { static: false }) emailRef: ElementRef<TextField>;

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.form = new FormGroup({
            imie: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.minLength(2), Validators.maxLength(15), Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃ][a-zęóąśłżźćń]{1,15})')] }),
            nazwisko: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃ][a-zęóąśłżźćń]{1,20})')] }),
            email: new FormControl(null, { updateOn: 'change', validators: [Validators.email] })
        })

        this.form.get('imie').statusChanges.subscribe(status => {
            this.imieValid = status === 'VALID';
        });
        this.form.get('nazwisko').statusChanges.subscribe(status => {
            this.nazwiskoValid = status === 'VALID';
        });
        this.form.get('email').statusChanges.subscribe(status => {
            this.emailValid = status === 'VALID';
        });
    }

    zapisz() {

        if (!this.form.valid) {
            return;
        }

        this._imie = this.form.get('imie').value;
        this._nazwisko = this.form.get('nazwisko').value;
        this._email = this.form.get('email').value !== '' ? this.form.get('email').value : null;

        this.parafiaService.nowyMinistrant(this._stopien, this._imie, this._nazwisko, this._email).then(res => {
            console.log(res)
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
                    this.parafiaService.pobierzMinistrantow().then(() => {
                        setTimeout(() => {
                            this.feedback.show({
                                title: "Sukces!",
                                message: "Dodano ministranta " + this._nazwisko + " " + this._imie,
                                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                                duration: 2000,
                                backgroundColor: new Color(255, 49, 155, 49),
                                type: FeedbackType.Success,
                            });
                        }, 400)
                        this.anuluj()
                    })
                    break;
                case 2:
                        this.feedback.show({
                            title: "Uwaga!",
                            message: "Ten e-mail jest już przypisany do innego konta",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color(255,255, 207, 51),
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

    anuluj() {
        this.tabIndexService.nowyOutlet(4, 'ministranci')
        this.router.back();
    }

    wybierzStopien() {

        let lista = ["Kandydat", "Ministrant Ołtarza", "Choralista", "Ministrant Światła", "Ministrant Krzyża", "Ministrant Księgi", "Ministrant Kadzidła", "Ministrant Wody", "Lektor", "Ceremoniarz", "Szafarz", "Ksiądz", "Opiekun"]

        this.modal.showModal(WyborModalComponent, {
            context: lista,
            viewContainerRef: this.vcRef,
            fullscreen: false,
            stretched: false,
            animated: true,
            closeCallback: null,
            dimAmount: 0.8 // Sets the alpha of the background dim,

        } as ExtendedShowModalOptions).then((wybor) => {

            if (wybor !== undefined) {
                this.stopienNazwa = lista[wybor];
                this._stopien = wybor;
                this.stopienValid = true;
            }
            else {
                if (this.stopienNazwa === "Wybierz stopień") {
                    this.stopienValid = false;
                }
            }
        })

    }
}
