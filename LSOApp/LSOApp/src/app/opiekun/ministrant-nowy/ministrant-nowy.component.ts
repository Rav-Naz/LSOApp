import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { Stopien } from '~/app/serwisy/stopien.model';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { UiService } from '~/app/serwisy/ui.service';
import { lista } from '~/app/serwisy/stopien.model';

@Component({
    selector: 'ns-ministrant-nowy',
    templateUrl: './ministrant-nowy.component.html',
    styleUrls: ['./ministrant-nowy.component.css'],
    moduleId: module.id,
})
export class MinistrantNowyComponent implements OnInit {

    constructor(private page: Page, private router: RouterExtensions, private parafiaService: ParafiaService,
         private tabIndexService: TabindexService, private modal: ModalDialogService, private vcRef: ViewContainerRef, private ui: UiService) {
            this.ranks.push('Opiekun');
            this.ranks[11] = 'Ksiądz';
         }

    form: FormGroup;

    imieValid: boolean = true;
    nazwiskoValid: boolean = true;
    stopienValid: boolean = true;
    emailValid: boolean = true;
    zapisywanie: boolean = false;

    ranks = lista;

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
            imie: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃ][A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń ]{1,20})')] }),
            nazwisko: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃ][A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń-]{1,20})')] }),
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

        this.zapisywanie = true

        this._imie = this.form.get('imie').value;
        this._nazwisko = this.form.get('nazwisko').value;
        this._email = this.form.get('email').value !== '' ? this.form.get('email').value : null;

        this.ui.zmienStan(1,true)

        this.parafiaService.nowyMinistrant(this._stopien, this._imie, this._nazwisko, this._email).then(res => {
            switch (res) {
                case 0:
                    this.zapisywanie = false
                        this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    break;
                case 1:
                    this.parafiaService.pobierzMinistrantow().then(() => {
                        setTimeout(() => {
                            this.ui.showFeedback('succes',"Dodano ministranta " + this._nazwisko + " " + this._imie,2)
                        }, 400)
                        this.anuluj()
                    })
                    break;
                case 2:
                    this.zapisywanie = false
                        this.ui.showFeedback('warning',"Ten e-mail jest już przypisany do innego konta",3)
                    break;
                case 404:
                    this.zapisywanie = false
                    this.ui.sesjaWygasla()
                    break;
                default:
                    this.zapisywanie = false
                        this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    break;
            }
            this.ui.zmienStan(1,false)
        })
    }

    anuluj() {
        this.tabIndexService.nowyOutlet(4, 'ministranci')
        this.router.back();
    }

    wybierzStopien() {

       this.ui.pokazModalListy(this.ranks).then((wybor) => {

            if (wybor !== undefined) {
                this.stopienNazwa = this.ranks[wybor];
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

    dismiss()
    {
        this.emailRef.nativeElement.dismissSoftInput()
    }
}
