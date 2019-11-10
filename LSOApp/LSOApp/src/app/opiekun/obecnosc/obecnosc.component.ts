import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { Wydarzenie } from '~/app/serwisy/wydarzenie.model';
import { DzienTyg } from '~/app/serwisy/dzien_tygodnia.model';
import { User } from '~/app/serwisy/user.model';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { Subscription } from 'rxjs';
import { Feedback, FeedbackType} from "nativescript-feedback";
import { RadCalendarComponent } from "nativescript-ui-calendar/angular";
import { Obecnosc } from '~/app/serwisy/obecnosc.model';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { sortPolskich } from '~/app/shared/sortPolskich';

@Component({
    selector: 'ns-obecnosc',
    templateUrl: './obecnosc.component.html',
    styleUrls: ['./obecnosc.component.css'],
    moduleId: module.id,
})
export class ObecnoscComponent implements OnInit {

    kalendarz: boolean = false;
    DyzurySub: Subscription;
    ObecSub: Subscription;
    PROSub: Subscription;
    WydarzeniaSub: Subscription;
    PROLista: Array<string>;
    dzisiejszeWydarzenia: Array<Wydarzenie>
    noweObecnosci: Array<Obecnosc>;
    aktywneWydarzenie: Wydarzenie;
    aktywnyDzien: Date;
    najblizszeWydarzenie: Wydarzenie;
    ministranciDoWydarzenia: Array<User>
    naglowek: string;
    data: string;
    index: number = 0;
    dzis: Date;
    cofam: boolean;
    sprawdzane: boolean;

    private feedback: Feedback;


    zmiana: boolean;

    @ViewChild("myCalendar", { static: false }) _calendar: RadCalendarComponent;

    constructor(private page: Page, private wydarzeniaService: WydarzeniaService, private parafiaService: ParafiaService, private tabIndexService: TabindexService, private modal: ModalDialogService, private vcRef: ViewContainerRef) {
        this.feedback = new Feedback();
    }

    ngOnInit() {
        this.PROSub = this.tabIndexService.PRO.subscribe(listaOutletow => {
            this.PROLista = listaOutletow;
        })

        this.cofam = false;

        this.dzis = new Date(); // Data pobierana z bazy

        this.page.actionBarHidden = true;
        this.aktywnyDzien = new Date();

        this.wydarzeniaService.dzisiejszeWydarzenia(this.aktywnyDzien.getDay())

        this.WydarzeniaSub = this.wydarzeniaService.WydarzeniaObecnoscSub.subscribe(lista => {
            this.dzisiejszeWydarzenia = [];
            if(lista !== null)
            {
                this.dzisiejszeWydarzenia = lista.sort((wyd1, wyd2) => {
                    if (wyd1.godzina > wyd2.godzina) { return 1; }
                    if (wyd1.godzina < wyd2.godzina) { return -1; }
                    return 0;
                });
            }

            if (this.dzisiejszeWydarzenia.length === 0) {
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

            if (this.dzisiejszeWydarzenia.length !== 0) {
                this.header(this.aktywnyDzien, this.aktywneWydarzenie); //Tworzenie nagłówka
                this.parafiaService.dyzurDoWydarzenia(this.aktywneWydarzenie.id); //Pobieranie danych o dyżurach
            }
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
            }
            this.zmiana = false;
            // if (lista !== null && lista !== undefined) {
            //     lista.forEach((item) => {
            //         this.ministranciDoWydarzenia.push(this.parafiaService.WybranyMinistrant(item.id_user))
            //     });
            //     this.ministranciDoWydarzenia.sort((min1, min2) => {
            //         return sortPolskich(min1.nazwisko,min2.nazwisko)
            //     });
            // }
        });

        this.ObecSub = this.parafiaService.Obecnosci.subscribe(lista => {
            this.noweObecnosci = [];

            if (lista === null) {
                this.zmiana = false;
                return;
            }


            if (lista.length > 0) { //W przypadku gdy w pamieci sa juz obecnosci dla tego dnia i wydarzenia
                this.sprawdzane = true;
                this.noweObecnosci = lista
                // lista.forEach(element => {
                //     this.noweObecnosci.push({ id: element.id, id_wydarzenia: element.id_wydarzenia, id_user: element.id_user, data: element.data, status: element.status });
                // })
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
        });
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

            this.czyKontynuowac().then((kontynuowac) => {
                if(!kontynuowac)
                {
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
                        this.parafiaService.dyzurDoWydarzenia(this.aktywneWydarzenie.id);
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
        this.parafiaService.zapiszObecnosci(this.noweObecnosci, this.sprawdzane).then(() => {
            setTimeout(() => {
                this.parafiaService.obecnosciDoWydarzenia(this.aktywneWydarzenie.id, this.aktywnyDzien).then(res => {
                    if(res === 1)
                    {
                        this.feedback.show({
                            title: "Sukces!",
                            message: "Zapisano obecności",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 2000,
                            backgroundColor: new Color(255,49, 155, 49),
                            type: FeedbackType.Success,

                          });
                    }
                    else
                    {
                        this.feedback.show({
                            title: "Błąd!",
                            message: "Wystąpił nieoczekiwany błąd",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color("#e71e25"),
                            type: FeedbackType.Error,

                        });
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
            this.feedback.show({
                title: "Uwaga!",
                message: "Nie wybiegaj w przyszłość :)",
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 2000,
                backgroundColor: new Color(255,255, 207, 51),
                type: FeedbackType.Warning,

            });
            return;
        }

        this.naKalendarz(false);

        this.aktywnyDzien = dzien;

        await this.wydarzeniaService.dzisiejszeWydarzenia(this.aktywnyDzien.getDay())
    }

    moznaSprawdzac() {
        let teraz = new Date();

        let zakres = new Date(2018,10,15,teraz.getHours(), teraz.getMinutes() + 15);
        let wydarzenieGodz = new Date(this.aktywneWydarzenie.godzina)
        // console.log(wydarzenieGodz,zakres)

        if (this.aktywnyDzien.getDate() < teraz.getDate()) {
            return true;
        }
        else if (this.aktywnyDzien.getDate() === teraz.getDate() && this.aktywnyDzien.getMonth() === teraz.getMonth() && this.aktywnyDzien.getFullYear() === teraz.getFullYear() &&
        //  (wydarzenieGodz.getHours() > zakres.getHours() || (wydarzenieGodz.getHours() === zakres.getHours() && wydarzenieGodz.getMinutes() >= zakres.getMinutes())
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
