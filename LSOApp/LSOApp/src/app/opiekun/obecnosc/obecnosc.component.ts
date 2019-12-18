import { Component, OnInit, ViewChild, ViewContainerRef, OnDestroy } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { Wydarzenie } from '~/app/serwisy/wydarzenie.model';
import { DzienTyg } from '~/app/serwisy/dzien_tygodnia.model';
import { User } from '~/app/serwisy/user.model';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { Subscription } from 'rxjs';
import { RadCalendarComponent } from "nativescript-ui-calendar/angular";
import { Obecnosc } from '~/app/serwisy/obecnosc.model';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { UiService } from '~/app/serwisy/ui.service';

@Component({
    selector: 'ns-obecnosc',
    templateUrl: './obecnosc.component.html',
    styleUrls: ['./obecnosc.component.css'],
    moduleId: module.id,
})
export class ObecnoscComponent implements OnInit, OnDestroy {

    kalendarz: boolean = false;
    DyzurySub: Subscription;
    ObecSub: Subscription;
    PROSub: Subscription;
    WydarzeniaSub: Subscription;
    PROLista: Array<string>;
    dzisiejszeWydarzenia: Array<Wydarzenie>
    noweObecnosci: Array<Obecnosc>;
    aktywneWydarzenie: Wydarzenie = { id: 0, id_parafii: 0,nazwa: "Msza Święta",typ: 0, cykl: 1,dzien_tygodnia: 0, godzina: "2018-11-15T21:27:00.000Z",data_dokladna: null};
    aktywnyDzien: Date;
    najblizszeWydarzenie: Wydarzenie;
    ministranciDoWydarzenia: Array<User>
    naglowek: string;
    data: string;
    index: number = 0;
    dzis: Date;
    cofam: boolean;
    sprawdzane: boolean;

    private odliczenie;

    interval;


    zmiana: boolean;

    @ViewChild("myCalendar", { static: false }) _calendar: RadCalendarComponent;

    constructor(private page: Page, private wydarzeniaService: WydarzeniaService, private parafiaService: ParafiaService,
        private tabIndexService: TabindexService, private modal: ModalDialogService, private vcRef: ViewContainerRef, public ui: UiService) { }

    ngOnInit() {

        this.ui.zmienStan(0,true)

        this.PROSub = this.tabIndexService.PRO.subscribe(listaOutletow => {
            this.PROLista = listaOutletow;
        })

        this.cofam = false;

        this.dzis = new Date(); // Data pobierana z bazy
        this.interval = setInterval(() => {
            this.dzis = new Date();
        },60000)

        this.page.actionBarHidden = true;
        this.aktywnyDzien = new Date();

        this.wydarzeniaService.dzisiejszeWydarzenia(this.aktywnyDzien.getDay())

        this.WydarzeniaSub = this.wydarzeniaService.WydarzeniaObecnoscSub.subscribe(lista => {
            this.dzisiejszeWydarzenia = [];
            this.parafiaService.aktualneWydarzenieId = 0
            if(lista !== null)
            {
                this.dzisiejszeWydarzenia = lista.sort((wyd1, wyd2) => {
                    if (wyd1.godzina > wyd2.godzina) { return 1; }
                    if (wyd1.godzina < wyd2.godzina) { return -1; }
                    return 0;
                });
            }

            if (this.dzisiejszeWydarzenia.length === 0) {
                this.ui.zmienStan(0,false)
                this.zmiana = false;
                this.header(this.aktywnyDzien);
                this.ministranciDoWydarzenia = [];
                this.sprawdzane = false;
                return;
            }

            let zakres = new Date(null,null,null,this.aktywnyDzien.getHours(), this.aktywnyDzien.getMinutes() + 15);

            this.najblizszeWydarzenie = this.dzisiejszeWydarzenia.filter((item) => new Date(item.godzina) >= zakres)[0];

            if (this.najblizszeWydarzenie === undefined || this.cofam) {
                this.index = this.dzisiejszeWydarzenia.length - 1;
                this.aktywneWydarzenie = this.dzisiejszeWydarzenia[this.index];
            }
            else {
                this.index = this.dzisiejszeWydarzenia.indexOf(this.najblizszeWydarzenie);

                if(this.index > 0)
                {
                    this.index -= 1;
                }

                this.aktywneWydarzenie = this.dzisiejszeWydarzenia[this.index];
            }

            this.parafiaService.aktualneWydarzenieId = this.aktywneWydarzenie.id;

            this.header(this.aktywnyDzien, this.aktywneWydarzenie); //Tworzenie nagłówka
            this.odliczenie = setTimeout(async () => {
                this.parafiaService.dyzurDoWydarzenia(this.aktywneWydarzenie.id); //Pobieranie danych o dyżurach
            }, this.sprawdzane && this.zmiana?0:500)
        })

        this.DyzurySub = this.parafiaService.Dyzury.subscribe(lista => {
            if(lista !== [] && lista !== null)
            {
                this.ministranciDoWydarzenia = lista;
                this.parafiaService.obecnosciDoWydarzenia(this.aktywneWydarzenie.id, this.aktywnyDzien);
            }
            else
            {
                this.ministranciDoWydarzenia = [];
                this.ui.zmienStan(0,false)
            }
            this.zmiana = false;
        });

        this.ObecSub = this.parafiaService.Obecnosci.subscribe(lista => {
            this.noweObecnosci = [];

            if (lista === null) {
                this.zmiana = false;
                this.ui.zmienStan(0,false)
                return;
            }


            if (lista.length > 0) { //W przypadku gdy w pamieci sa juz obecnosci dla tego dnia i wydarzenia
                this.sprawdzane = true;
                this.noweObecnosci = lista
                this.zmiana = false;
            }
            else {// W przypadku gdy sprawdzamy obecnosc w tym dniu pierwszy raz
                this.sprawdzane = false;
                this.ministranciDoWydarzenia.forEach(ministrant => {
                    this.noweObecnosci.push(this.parafiaService.nowaObecnosc(this.aktywneWydarzenie.id, ministrant.id_user, this.aktywnyDzien));
                })
                if(this.ministranciDoWydarzenia.length === 0)
                {
                    this.zmiana = false;
                }
                else
                {
                    this.zmiana = true;
                }
            }
            this.ui.zmienStan(0,false)
        });
    }

    ngOnDestroy(): void {
        this.interval = null;
    }

    header(aktywnyDz: Date, wydarzenie?: Wydarzenie) {

        let dzien: number = aktywnyDz.getDate();
        let miesiac: number = aktywnyDz.getMonth() + 1;

        let dzienStr: string;
        let miesciacStr: string;

        if (wydarzenie) {
            let godzina = new Date(wydarzenie.godzina)
            godzina.setHours(godzina.getHours() + 1)
            this.naglowek = godzina.toJSON().toString().slice(11, 16) + ', ' + DzienTyg[wydarzenie.dzien_tygodnia] + ' ';
        }
        else {
            this.naglowek = DzienTyg[aktywnyDz.getDay()] + ' ';
        }

        if (dzien < 10) {
            dzienStr = '0' + dzien.toString();
        }
        else
        {
            dzienStr = dzien.toString()
        }

        if (miesiac < 10) {
            miesciacStr = '0' + miesiac.toString();
        }
        else
        {
            miesciacStr = miesiac.toString()
        }

        this.data = dzienStr + '/' + miesciacStr;
    }

    async indexZmiana(liczba: number) {

        clearTimeout(this.odliczenie)

            this.czyKontynuowac().then((kontynuowac) => {
                if(!kontynuowac)
                {
                    this.ui.zmienStan(0,true)
                    if((this.index + liczba)<0 || (this.index + liczba)>(this.dzisiejszeWydarzenia.length-1))
                    {
                        if((this.index + liczba)<0)
                        {
                            this.cofam = true;
                        }
                        else
                        {
                            this.cofam = false;
                        }
                        let dzien = new Date(this.aktywnyDzien.getFullYear(),this.aktywnyDzien.getMonth(), this.aktywnyDzien.getDate());
                        dzien.setDate(dzien.getDate() + liczba);

                        this.ladujDzien(dzien);
                    }
                    else
                    {
                        this.index += liczba;
                        this.aktywneWydarzenie = this.dzisiejszeWydarzenia[this.index];
                        this.parafiaService.aktualneWydarzenieId = this.aktywneWydarzenie.id;

                        this.odliczenie = setTimeout(async () => {
                            this.parafiaService.dyzurDoWydarzenia(this.aktywneWydarzenie.id).then(res => {
                                if(res === 404)
                                {
                                    this.ui.sesjaWygasla()
                                }
                            });
                        }, this.sprawdzane && this.zmiana?50:250)

                        if (this.aktywneWydarzenie) {
                            this.header(this.aktywnyDzien, this.aktywneWydarzenie);
                        }
                    }
                }
            });

    }

    private czyKontynuowac()
    {
        return new Promise<boolean>((resolve) => {
            if(this.sprawdzane && this.zmiana)
            {
                this.modal.showModal(PotwierdzenieModalComponent,{
                    context: "Dane o obecności dla tego wydarzenia nie zostaną zapisane.\nCzy chcesz kontynuować?",
                    viewContainerRef: this.vcRef,
                    fullscreen: false,
                    stretched: false,
                    animated:  true,
                    closeCallback: null,
                    dimAmount: 0.8 // Sets the alpha of the background dim,

                  } as ExtendedShowModalOptions).then((wybor) => {
                      if(wybor === true)
                      {
                        resolve(false);
                      }
                      else
                      {
                        resolve(true);
                      }
                  })
            }
            else
            {
                resolve(false)
            }
        })
    }

    zmienStatusObecnosci(event, id_user: number) {
        let status = this.noweObecnosci.filter(obecnosc => obecnosc.id_user === id_user)[0];
        if (status !== undefined) {
            status.status = event;
        }
        this.zmiana = true
    }

    zapiszZmiany() {
        this.ui.zmienStan(0,true)
        this.ui.zmienStan(1,true)
        this.parafiaService.zapiszObecnosci(this.noweObecnosci, this.sprawdzane).then(res => {
            if(res === 404)
            {
                this.ui.zmienStan(0,false)
                this.ui.zmienStan(1,false)
                this.ui.sesjaWygasla()
                return
            }
            setTimeout(() => {
                this.parafiaService.obecnosciDoWydarzenia(this.aktywneWydarzenie.id, this.aktywnyDzien).then(res => {
                    if(res === 1)
                    {
                        this.ui.showFeedback('succes',"Zapisano obecności",2)
                    }
                    else
                    {
                        this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    }
                })
            }, 500)
        })
    }

    naKalendarz(bool: boolean) {
        this.kalendarz = bool;
    }

    wybranyDzien() {
        this.ladujDzien(this._calendar.nativeElement.selectedDate).then(() => {
            this.cofam = false;
        })
    }

    private async ladujDzien(dzien: Date)
    {

        if (dzien > new Date()) {
            this.ui.showFeedback('warning',"Nie wybiegaj w przyszłość :)",2)
            return;
        }

        this.naKalendarz(false);

        this.aktywnyDzien = dzien;

        this.ui.zmienStan(0,true)

        await this.wydarzeniaService.dzisiejszeWydarzenia(this.aktywnyDzien.getDay()).then(res => {
            if(res === 404)
            {
                this.header(this.aktywnyDzien)
                this.ui.sesjaWygasla()
            }
        })

    }

    moznaSprawdzac() {
        let teraz = new Date();

        let zakres = new Date(2018,10,15,teraz.getHours(), teraz.getMinutes() + 15);
        let wydarzenieGodz = new Date(this.aktywneWydarzenie.godzina)

        if (this.aktywnyDzien.getDate() < teraz.getDate()) {
            return true;
        }
        else if (this.aktywnyDzien.getDate() === teraz.getDate() && this.aktywnyDzien.getMonth() === teraz.getMonth() && this.aktywnyDzien.getFullYear() === teraz.getFullYear() &&
        wydarzenieGodz > zakres)
         {
            this.zmiana = false;
            return false;
        }
        return true;
    }

    czyJestNaLiscie(ministrant: User) {
        let status = this.noweObecnosci.filter(obecnosc => obecnosc.id_user === ministrant.id_user)[0];
        if (status !== undefined) {
            return true;
        }
        else {
            return false;
        }
    }

    aktualnyStatus(ministrant: User) {
        let status = this.noweObecnosci.filter(obecnosc => obecnosc.id_user === ministrant.id_user)[0];
        if (status !== undefined) {
            return status.status;
        }
    }

    czyMoznaDoPrzodu()
    {
        if(this.aktywnyDzien.getDate() === this.dzis.getDate() && this.aktywnyDzien.getMonth() === this.dzis.getMonth() && this.aktywnyDzien.getFullYear() === this.dzis.getFullYear() && this.dzisiejszeWydarzenia[this.index + 1] === undefined)
        {
            return false;
        }
        return true;
    }

    nic() {

    }
}
