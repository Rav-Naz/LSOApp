import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ViewContainerRef } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { Parafia } from '~/app/serwisy/parafia.model';
import { ModalDialogService } from 'nativescript-angular/common';
import { WyborModalComponent } from '~/app/shared/modale/wybor-modal/wybor-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { UiService } from '~/app/serwisy/ui.service';

@Component({
  selector: 'ns-zmien-haslo-o',
  templateUrl: './zmien-haslo-o.component.html',
  styleUrls: ['./zmien-haslo-o.component.css'],
  moduleId: module.id,
})
export class ZmienHasloOComponent implements OnInit, AfterViewInit {

    constructor(private page: Page, private router: RouterExtensions, private tabIndexService: TabindexService,
         private parafiaService: ParafiaService, private modal: ModalDialogService, private vcRef: ViewContainerRef,
         private ui: UiService) {}

    form: FormGroup;

    diecezjaValid: boolean = true;
    miastoValid: boolean = true;
    wezwanieValid: boolean = true;
    rodzajValid: boolean = true;
    zmiana: boolean = false;

    diecezje: Array<string> = ['białostocka', 'bielsko-żywiecka', 'bydgoska', 'częstochowska', 'drohiczyńska', 'elbląska', 'ełcka', 'gdańska', 'gliwicka', 'gnieźnieńska', 'kaliska', 'katowicka', 'kielecka', 'koszalińsko-kołobrzeska', 'krakowska', 'legnicka', 'lubelska', 'łomżyńska', 'łowicka', 'łódzka', 'opolska', 'Ordynariat Polowy WP', 'pelplińska', 'płocka', 'Polska Misja Katolicka', 'poznańska', 'Prałatura Opus Dei', 'przemyska', 'radomska', 'rzeszowska', 'sandomierska', 'siedlecka', 'sosnowiecka', 'szczecińsko-kamieńska', 'świdnicka', 'tarnowska', 'toruńska', 'warmińska', 'warszawsko-praska', 'włocławska', 'wrocławska', 'zamojsko-lubaczowska', 'zielonogórsko-gorzowska'];
    rodzaje: Array<string> = ['Diecezjalni', 'Albertyni', 'Augustianie', 'Barnabici', 'Bazylianie', 'Benedyktyni', 'Bernardyni', 'Bonifratrzy', 'Bracia Gabrieliści', 'Bracia Pocieszyciele', 'Bracia Serca Jezusowego', 'Bracia Szkolni', 'Chrystusowcy', 'Cystersi', 'Doloryści', 'Dominikanie', 'Duchacze', 'Filipini', 'Franciszkanie OFM', 'Franciszkanie Konwentualni OFMConv', 'Guanellianie', 'Jezuici', 'Józefici', 'Kameduli', 'Kamilianie', 'Kanonicy Regularni', 'Kapucyni OFMCap', 'Kapucyni Tercjarze', 'Karmelici', 'Karmelici Bosi', 'Klaretyni', 'Kombonianie', 'Mali Bracia Jezusa', 'Marianie', 'Marianiści', 'Michalici', 'Misjonarze', 'Misjonarze Krwi Chrystusa', 'Misjonarze Matki Bożej Pocieszenia', 'Misjonarze Montfortanie', 'Misjonarze Oblaci Maryi Niepokalanej', 'Misjonarze Świętej Rodziny', 'Misjonarze z Mariannhill', 'Ojcowie Biali', 'Orioniści', 'Pallotyni', 'Pasjoniści', 'Paulini', 'Pauliści', 'Pijarzy', 'Redemptoryści', 'Rogacjoniści', 'Saletyni', 'Salezjanie', 'Salwatorianie', 'Sercanie', 'Sercanie Biali', 'Stowarzyszenie Misji Afrykańskich', 'Synowie Maryi', 'Trynitarze', 'Werbiści', 'Zmartwychwstańcy'];

    _diecezja: string = "Wybierz diecezję";
    _diecezja_id: number = 1;
    _miasto: string;
    _rodzaj: string = "Wybierz rodzaj parafii";
    _rodzaj_id: number = 1;
    _stopien: string = "Wybierz stopień"
    _stopien_id: number = 1
    _wezwanie: string = '';

    parafia: Parafia;

    @ViewChild('wezwanie', { static: false }) wezwanieRef: ElementRef<TextField>;
    @ViewChild('miasto', { static: false }) miastoRef: ElementRef<TextField>;


    ngOnInit() {
        this.page.actionBarHidden = true;


        this.form = new FormGroup({
            wezwanie: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń .]{2,30})')] }),
            miasto:  new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń -]{2,30})')] })
        })

        this.parafia = this.parafiaService.Parafia;


        this.form.get('wezwanie').statusChanges.subscribe(status => {
            this.wezwanieValid = status === 'VALID';
            this._wezwanie = this.form.get('wezwanie').value
        });
        this.form.get('miasto').statusChanges.subscribe(status => {
            this.miastoValid = status === 'VALID';
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.wezwanieRef.nativeElement.text = this.parafia.nazwa_parafii;
            this.miastoRef.nativeElement.text = this.parafia.miasto;
            this._diecezja = this.diecezje[this.parafia.id_diecezji]
            this._diecezja_id = this.parafia.id_diecezji
            this._rodzaj = this.rodzaje[this.parafia.id_typu]
            this._rodzaj_id = this.parafia.id_typu
        }, 200)
    }

    zapisz() {

        if(!this.form.valid)
        {
            this.ui.showFeedback('error',"Formularz nie jest poprawny",3)
            return;
        }

        this.ui.zmienStan(4,true)

        this._wezwanie = this.form.get('wezwanie').value;
        this._miasto = this.form.get('miasto').value;

        this.parafiaService.aktualizujParafie(this._wezwanie,this._diecezja_id,this._miasto,this._rodzaj_id).then(res => {
            if(res === 1)
            {
                this.anuluj();
                setTimeout(() => {
                    this.ui.showFeedback('succes',"Dane zostały zaktualizowane",3)
                }, 400)
            }
            else
            {
                this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
            }
            this.ui.zmienStan(4,false)
        })
    }

    displayActionDialog(akcja: 'diecezja' | 'rodzaj') {

        let wybory: Array<any>;

        if (akcja === 'diecezja') {
            wybory = this.diecezje

        }

        else if (akcja === 'rodzaj') {
            wybory = this.rodzaje
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
                    this.zmiana = true;
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
                    this.zmiana = true;
                }
                else {
                    if (this._rodzaj === 'Wybierz rodzaj parafii') {
                        this.rodzajValid = false;
                    }
                }
            }
        });
    }

    anuluj() {
        this.tabIndexService.nowyOutlet(6,"ustawieniaO")
        this.router.back()
    }

    focus() {
        this.wezwanieRef.nativeElement.focus();
    }

    dismiss()
    {
        this.wezwanieRef.nativeElement.dismissSoftInput()
        if(this.form.get('wezwanie').value !== this.parafia.nazwa_parafii || this.form.get('miasto').value !== this.parafia.miasto)
        {
            this.zmiana = true;
        }
    }
}
