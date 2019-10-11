import { Injectable } from '@angular/core';
import { User } from './user.model';
import { BehaviorSubject } from 'rxjs';
import { Dyzur } from './dyzur.model';
import { Wydarzenie } from './wydarzenie.model';
import { Obecnosc } from './obecnosc.model';
import { Stopien } from './stopien.model';
import { SecureStorage } from "nativescript-secure-storage";

@Injectable({
    providedIn: 'root'
})
export class ParafiaService {

    punktyZaObecnosc: number = 1;
    punktyZaNieobecnosc: number = 0;

    aktualnyMinistrantId: number; //Wykorzystanie: ministranci
    aktualneWydarzenieId: number; //Wykorzystanie: obecnosci
    indexDyzuru: number = 0;
    indexObecnosci: number = 0;
    indexMinistrantow: number = 0;

    zapisz: boolean = true;

    secureStorage: SecureStorage;

    constructor(){
        this.secureStorage = new SecureStorage();
        this.secureStorage.get({ key: "ministranci" }).then((ministranci) => {
            if(ministranci !== null)
            {
                let jsonObj: Array<User> = JSON.parse(ministranci);
                this.ministranciLista = jsonObj;
                this.ministranci.next(this.ministranciLista);
            }
        }).then(() => {
            this.secureStorage.get({ key: "dyzury" }).then((dyzury) => {
                if(dyzury !== null)
                {
                    let jsonObj: Array<Dyzur> = JSON.parse(dyzury);
                    this._dyzury = jsonObj;
                }
        })}).then(() => {
            this.secureStorage.get({ key: "obecnosci" }).then((obecnosci) => {
                if(obecnosci !== null)
                {
                    let jsonObj: Array<Obecnosc> = JSON.parse(obecnosci);
                    this._obecnosci = jsonObj;
                }
        })}).then(() => {
            this.secureStorage.get({ key: "punktacja" }).then((punktacja) => {
                if(punktacja !== null)
                {
                    let jsonObj: Array<number> = JSON.parse(punktacja);
                    this.punktyZaObecnosc = jsonObj[0];
                    this.punktyZaNieobecnosc = jsonObj[1];
                }
        })}).then(() => {
            this.secureStorage.get({ key: "indexyParafia" }).then((indexyParafia) => {
                if(indexyParafia !== null)
                {
                    let jsonObj: Array<number> = JSON.parse(indexyParafia);
                    this.indexDyzuru = jsonObj[0];
                    this.indexObecnosci = jsonObj[1];
                    this.indexMinistrantow = jsonObj[2];
                }
        })});

    }

    private ministranciLista: Array<User> = [
        // { id_user: 1, id_diecezji: 1, id_parafii: 1, punkty: 243, stopien: 1, imie: "Rafał", nazwisko: "Nazarko", ulica: null, kod_pocztowy: null, miasto: null, email: null, telefon: null, aktywny: true },
        // { id_user: 2, id_diecezji: 1, id_parafii: 1, punkty: 45, stopien: 1, imie: "Patryk", nazwisko: "Majewski", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: "rafal.nazarko@gmail.com", telefon: "506987123", aktywny: true },
        // { id_user: 3, id_diecezji: 1, id_parafii: 1, punkty: 26, stopien: 1, imie: "Krzysztof", nazwisko: "Kowalczyk", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: null, telefon: "506987123", aktywny: true },
        // { id_user: 4, id_diecezji: 1, id_parafii: 1, punkty: 34, stopien: 1, imie: "Mariusz", nazwisko: "Romanowski", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: "rafal.nazarko@gmail.com", telefon: "506987123", aktywny: true },
        // { id_user: 5, id_diecezji: 1, id_parafii: 1, punkty: 56, stopien: 1, imie: "Patryk", nazwisko: "Ratajczak", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: "rafal.nazarko@gmail.com", telefon: "506987123", aktywny: true },
        // { id_user: 6, id_diecezji: 1, id_parafii: 1, punkty: 76, stopien: 1, imie: "Dawid", nazwisko: "Mikołajczyk", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: "rafal.nazarko@gmail.com", telefon: "506987123", aktywny: true },
        // { id_user: 7, id_diecezji: 1, id_parafii: 1, punkty: 454, stopien: 1, imie: "Hubert", nazwisko: "Krawczyk", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: "rafal.nazarko@gmail.com", telefon: "506987123", aktywny: true },
        // { id_user: 8, id_diecezji: 1, id_parafii: 1, punkty: 43, stopien: 1, imie: "Bartek", nazwisko: "Mazurkiewicz", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: null, telefon: "506987123", aktywny: true },
        // { id_user: 9, id_diecezji: 1, id_parafii: 1, punkty: 34, stopien: 1, imie: "Bartek", nazwisko: "Szczepaniak", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: "rafal.nazarko@gmail.com", telefon: "506987123", aktywny: true },
        // { id_user: 10, id_diecezji: 1, id_parafii: 1, punkty: 2645, stopien: 1, imie: "Robert", nazwisko: "Adamczyk", ulica: "jshdfiajdsbfiajbsdkfbaksdfbkajsdhbkfjahbdskhf bjhdb fkjhasbdf kjahbsd fhabskdj bfajsdhbf kjahsbdf JSLJD Hljabs", kod_pocztowy: "37-620", miasto: "Rzeszów", email: "rafal.nazarko@gmail.com", telefon: "506987123", aktywny: true },
        // { id_user: 11, id_diecezji: 1, id_parafii: 1, punkty: 54, stopien: 1, imie: "Karol", nazwisko: "Michalik", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: "rafal.nazarko@gmail.com", telefon: "506987123", aktywny: true },
        // { id_user: 12, id_diecezji: 1, id_parafii: 1, punkty: 267, stopien: 1, imie: "Jakub", nazwisko: "Głowacki", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: "rafal.nazarko@gmail.com", telefon: "506987123", aktywny: true },
        // { id_user: 13, id_diecezji: 1, id_parafii: 1, punkty: 7, stopien: 1, imie: "Kacper", nazwisko: "Stasiak", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: "rafal.nazarko@gmail.com", telefon: "506987123", aktywny: true },
        // { id_user: 14, id_diecezji: 1, id_parafii: 1, punkty: 9, stopien: 1, imie: "Bartek", nazwisko: "Milewski", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: "rafal.nazarko@gmail.com", telefon: "506987123", aktywny: true },
        // { id_user: 15, id_diecezji: 1, id_parafii: 1, punkty: 1, stopien: 1, imie: "Rafał", nazwisko: "Nazarko", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: "rafal.nazarko@gmail.com", telefon: "506987123", aktywny: true }
    ]

    private _dyzury: Array<Dyzur> = [
        // { id: 1, id_user: 1, id_wydarzenia: 1 },
        // { id: 2, id_user: 4, id_wydarzenia: 1 },
        // { id: 3, id_user: 6, id_wydarzenia: 1 },
        // { id: 4, id_user: 7, id_wydarzenia: 2 },
        // { id: 5, id_user: 1, id_wydarzenia: 2 },
        // { id: 6, id_user: 4, id_wydarzenia: 3 },
        // { id: 7, id_user: 8, id_wydarzenia: 3 },
        // { id: 8, id_user: 9, id_wydarzenia: 4 },
        // { id: 9, id_user: 15, id_wydarzenia: 4 },
        // { id: 10, id_user: 14, id_wydarzenia: 7 },
        // { id: 11, id_user: 13, id_wydarzenia: 7 },
        // { id: 12, id_user: 2, id_wydarzenia: 8 },
        // { id: 13, id_user: 7, id_wydarzenia: 9 },
        // { id: 14, id_user: 9, id_wydarzenia: 10 },
        // { id: 15, id_user: 4, id_wydarzenia: 11 },
        // { id: 16, id_user: 5, id_wydarzenia: 11 },
        // { id: 17, id_user: 6, id_wydarzenia: 12 },
        // { id: 18, id_user: 12, id_wydarzenia: 13 },
        // { id: 19, id_user: 3, id_wydarzenia: 1 },
    ];

    private _obecnosci: Array<Obecnosc> = [];

    private ministranci = new BehaviorSubject<Array<User>>(null);
    private dyzuryWydarzenia = new BehaviorSubject<Array<Dyzur>>(null);
    private dyzuryMinistranta = new BehaviorSubject<Array<Dyzur>>(null);
    private obecnosciWydarzenia =  new BehaviorSubject<Array<Obecnosc>>(null);

    get Obecnosci() //Wykorzystanie: obecnosc
    {
        return this.obecnosciWydarzenia.asObservable();
    }

    get Dyzury() { //Wykorzystanie: obecnosc
        return this.dyzuryWydarzenia.asObservable();
    }

    get DyzuryMinistranta() { //Wykorzystanie: ministranci-szczegoly
        return this.dyzuryMinistranta.asObservable();
    }

    get Ministranci() { //Wykorzystanie: ministranci
        return this.ministranci.asObservable();
    }

    wyszukajDyzury(id_user: number) { //Wykorzystanie: ministrant-dyzury, ministranci-szczegoly
        let lista = this._dyzury.filter((dyzur) => dyzur.id_user === id_user);
        this.dyzuryMinistranta.next(lista);
        return Promise.resolve();
    }

    dyzurDoWydarzenia(id_wyd: number) { //Wykorzystanie: obecnosc
        let lista = this._dyzury.filter((item) => item.id_wydarzenia === id_wyd);
        this.dyzuryWydarzenia.next(lista);
    }

    async zapiszDyzury(nowe: Array<Wydarzenie>, stare: Array<Wydarzenie>) //Wykorzystanie: ministranci-dyzury
    {
        for (let index = 0; index < 7; index++) {
            if (nowe[index] !== stare[index]) {
                if (nowe[index] === null) {
                    this.usunDyzur(stare[index].id);
                }
                else if (stare[index] === null) {
                    this.dodajDyzur(nowe[index].id);
                }
                else {
                    this.usunDyzur(stare[index].id);
                    this.dodajDyzur(nowe[index].id);
                }
            }
        }

        this.secureStorage.set({key: "dyzury", value: JSON.stringify(this._dyzury)}).then(async() => {
            this.secureStorage.set({key: "indexyParafia", value: JSON.stringify([this.indexDyzuru,this.indexObecnosci,this.indexMinistrantow])}).then(async() => {
                await this.wyszukajDyzury(this.aktualnyMinistrantId);
                this.dyzurDoWydarzenia(this.aktualneWydarzenieId)
            })
        })
    }

    private usunDyzur(id_wydarzenia: number) { //Wykorzystanie: parafiaService(zapiszDyzury)
        let doUsuniecia = this._dyzury.filter(dyzur => dyzur.id_user === this.aktualnyMinistrantId && dyzur.id_wydarzenia === id_wydarzenia)[0];//Wykorzystanie: ministranci-dyzury
        if (doUsuniecia !== undefined && doUsuniecia !== null) {
            let index = this._dyzury.indexOf(doUsuniecia);
            this._dyzury.splice(index, 1);
        }
    }

    private dodajDyzur(id_wydarzenia: number) {//Wykorzystanie: parafiaService(zapiszDyzury)
        this.indexDyzuru++;
        this._dyzury.push({ id: this.indexDyzuru, id_user: this.aktualnyMinistrantId, id_wydarzenia: id_wydarzenia })//Wykorzystanie: ministranci-dyzury
    }

    usunWszystkieDyzuryDlaWydarzenia(id_wydarzenia: number) //Wykorzystanie: wydarzeniaService(zapiszWydarzenia)
    {
       let lista = this._dyzury.filter(dyzur => dyzur.id_wydarzenia === id_wydarzenia);
       if(lista !== undefined)
       {
            lista.forEach(element => {
            let index = this._dyzury.indexOf(element);
            this._dyzury.splice(index, 1);
           })
       }

       this.secureStorage.set({key: "dyzury", value: JSON.stringify(this._dyzury)})
    }

    async nowyMinistrant(stopien: Stopien, imie: string, nazwisko: string, email: string) //Wykorzystanie: ministrant-nowy
    {
        this.indexMinistrantow++;
        this.ministranciLista.push({id_user: this.indexMinistrantow, id_diecezji: 1, id_parafii: 1, punkty: 0, stopien: stopien, imie: imie, nazwisko: nazwisko, ulica: null, kod_pocztowy: null, miasto: null, email: email, telefon: null, aktywny: false});
        this.secureStorage.set({key: "ministranci", value: JSON.stringify(this.ministranciLista)}).then(async() => {
            this.secureStorage.set({key: "indexyParafia", value: JSON.stringify([this.indexDyzuru,this.indexObecnosci,this.indexMinistrantow])}).then(async() => {
                await this.odswiezListeMinistrantow();
            })
        })
    }


    WybranyMinistrant(id: number) { //Wykorzystanie: ministranci-dyzury, ministranci-szczegoly,
        return this.ministranciLista.filter((item) => item.id_user === id)[0];
    }

    odswiezListeMinistrantow() { //Wykorzystanie: ministranci-szczegoly, parafiaService(nowyMinistrant)
        return new Promise<void>((resolve) =>
        {
            let lista = new Array<User>();
            lista = this.ministranciLista;
            this.ministranci.next(lista);
            resolve();
            // setTimeout(() => {
            //     resolve();
            // },2500)
        })
    }

    async updateMinistranta(ministrant: User)
    {
        let min = this.ministranciLista.filter(mini => mini.id_user === ministrant.id_user)[0];
        this.ministranciLista[this.ministranciLista.indexOf(min)] = ministrant;
        this.secureStorage.set({key: "ministranci", value: JSON.stringify(this.ministranciLista)}).then(async() => {
            await this.odswiezListeMinistrantow();
        })
        // console.log(this.ministranciLista)
    }

    async usunMinistranta(id_user: number) //Wykorzystanie: ministranci
    {
       let min = this.ministranciLista.filter(ministrant => ministrant.id_user === id_user)[0];
       let indexListaMinistrantow = this.ministranciLista.indexOf(min);
       this.ministranciLista.splice(indexListaMinistrantow,1);

       let listaDyzurow = this._dyzury.filter(dyzur => dyzur.id_user === id_user);
       if(listaDyzurow !== undefined)
       {
        listaDyzurow.forEach(dyzur => {
            let indexDyzuru = this._dyzury.indexOf(dyzur);
            this._dyzury.splice(indexDyzuru,1);
        })
       }
       this.secureStorage.set({key: "ministranci", value: JSON.stringify(this.ministranciLista)}).then(async() => {
        this.secureStorage.set({key: "dyzury", value: JSON.stringify(this._dyzury)}).then(async() => {
            await this.odswiezListeMinistrantow();
        })
    })
    }

    obecnosciDoWydarzenia(id_wydarzenia:number, data: Date) //Wykorzystanie: obecnosc
    {
        let ob = this._obecnosci.filter(obecnosc => obecnosc.id_wydarzenia === id_wydarzenia && new Date(obecnosc.data).getDate() === data.getDate() &&  new Date(obecnosc.data).getMonth() === data.getMonth() && new Date(obecnosc.data).getFullYear() === data.getFullYear());
        if(ob === undefined)
        {
            ob = [];
        }
        this.obecnosciWydarzenia.next(ob);
    }

    nowaObecnosc(id_wydarzenia: number, id_user: number, data: Date) //Wykorzystanie: obecnosc
    {
        this.indexObecnosci++;
        let ob: Obecnosc = {id: this.indexObecnosci, id_wydarzenia: id_wydarzenia, id_user: id_user, data: new Date(data.getFullYear(),data.getMonth(),data.getDate()).toJSON(), status: null }
        this.secureStorage.setSync({key: "indexyParafia", value: JSON.stringify([this.indexDyzuru,this.indexObecnosci,this.indexMinistrantow])})
        return ob;
    }

    async zapiszObecnosci(nowaLista: Array<Obecnosc>) //Wykorzystanie: obecnosc
    {
        let id_wydarzenia = nowaLista[0].id_wydarzenia;
        let data = new Date(nowaLista[0].data);
        nowaLista.forEach(obecnosc => {
          let ob = this._obecnosci.filter(istniejaca => istniejaca.id_user === obecnosc.id_user && istniejaca.id_wydarzenia === obecnosc.id_wydarzenia &&  new Date(istniejaca.data).getDate() === new Date(obecnosc.data).getDate() &&  new Date(istniejaca.data).getMonth() === new Date(obecnosc.data).getMonth() && new Date(istniejaca.data).getFullYear() === new Date(obecnosc.data).getFullYear())[0];
          if(ob === undefined)
          {
              this.ministranciLista.filter(ministrant => ministrant.id_user === obecnosc.id_user)[0].punkty += (obecnosc.status === 1? this.punktyZaObecnosc : obecnosc.status === 0? this.punktyZaNieobecnosc : 0)
              this._obecnosci.push(obecnosc)
          }
          else
          {
              let index = this._obecnosci.indexOf(ob);
              let aktualnyStatus = this._obecnosci[index].status
              let punkty: number = 0;

              if(aktualnyStatus !== obecnosc.status)
              {
                  if(aktualnyStatus === 0 && obecnosc.status === 1)
                  {
                    punkty += this.punktyZaObecnosc-this.punktyZaNieobecnosc;
                  }
                  else if(aktualnyStatus === 0 && obecnosc.status === null)
                  {
                    punkty += -this.punktyZaNieobecnosc;
                  }
                  else if(aktualnyStatus === 1 && obecnosc.status === 0)
                  {
                    punkty += this.punktyZaNieobecnosc-this.punktyZaObecnosc;
                  }
                  else if(aktualnyStatus === 1 && obecnosc.status === null)
                  {
                    punkty += -this.punktyZaObecnosc;
                  }
                  else if(aktualnyStatus === null && obecnosc.status === 0)
                  {
                    punkty += this.punktyZaNieobecnosc;
                  }
                  else if(aktualnyStatus === null && obecnosc.status === 1)
                  {
                    punkty += this.punktyZaObecnosc;
                  }
                  this.ministranciLista.filter(ministrant => ministrant.id_user === obecnosc.id_user)[0].punkty += punkty;
              }
             this._obecnosci[index].status = obecnosc.status;
          }
        });

        this.secureStorage.set({key: "obecnosci", value: JSON.stringify(this._obecnosci)}).then(async() => {
            this.secureStorage.set({key: "ministranci", value: JSON.stringify(this.ministranciLista)}).then(async() => {
            this.obecnosciDoWydarzenia(id_wydarzenia,data);
            await this.odswiezListeMinistrantow();
            });
        })
        // this.dyzurDoWydarzenia(id_wydarzenia);
    }
}
