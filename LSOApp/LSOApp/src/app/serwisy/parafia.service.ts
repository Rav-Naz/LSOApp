import { Injectable } from '@angular/core';
import { User } from './user.model';
import { BehaviorSubject } from 'rxjs';
import { Dyzur } from './dyzur.model';
import { Wydarzenie } from './wydarzenie.model';
import { Obecnosc } from './obecnosc.model';
import { Stopien } from './stopien.model';
import { HttpService } from './http.service';

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

    constructor(private http: HttpService){}

    private ministranciLista: Array<User> = [];

    private _dyzury: Array<Dyzur> = [];

    private _obecnosci: Array<Obecnosc> = [];

    private ministranci = new BehaviorSubject<Array<User>>(null);
    private dyzuryWydarzenia = new BehaviorSubject<Array<User>>(null);
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

    async pobierzMinistrantow()
    {
        return new Promise<Array<User>>(res => {
            this.http.pobierzMinistrantow(2).then(async res => {
                this.ministranciLista = res;
                await this.odswiezListeMinistrantow();
            })
        })
    }

    wyszukajDyzury(id_user: number) { //Wykorzystanie: ministrant-dyzury, ministranci-szczegoly
        return new Promise<void>(resolve => {
            let lista = this._dyzury.filter((dyzur) => dyzur.id_user === id_user);
            this.dyzuryMinistranta.next(lista);
            resolve();
        })
    }

    dyzurDoWydarzenia(id_wyd: number) { //Wykorzystanie: obecnosc
        this.http.pobierzDyzuryDoWydarzenia(38).then(res => {
            console.log(res)
            this.dyzuryWydarzenia.next(res);
        })
    }

    dyzuryMinistrant(id_user: number) //Wykorzystanie: userService(constructor)
    {
        let lista =this._dyzury.filter(item => item.id_user === id_user);
        return lista;
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

        // this.secureStorage.set({key: "dyzury", value: JSON.stringify(this._dyzury)}).then(async() => {
        //     this.secureStorage.set({key: "indexyParafia", value: JSON.stringify([this.indexDyzuru,this.indexObecnosci,this.indexMinistrantow])}).then(async() => {
        //         await this.wyszukajDyzury(this.aktualnyMinistrantId);
        //         this.dyzurDoWydarzenia(this.aktualneWydarzenieId)
        //     })
        // })
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

    //    this.secureStorage.set({key: "dyzury", value: JSON.stringify(this._dyzury)})
    }

    async nowyMinistrant(stopien: Stopien, imie: string, nazwisko: string, email: string) //Wykorzystanie: ministrant-nowy
    {
        this.indexMinistrantow++;
        this.ministranciLista.push({id_user: this.indexMinistrantow, id_diecezji: 1, id_parafii: 1, punkty: 0, stopien: stopien, imie: imie, nazwisko: nazwisko, ulica: null, kod_pocztowy: null, miasto: null, email: email, telefon: null, aktywny: false});
        // this.secureStorage.set({key: "ministranci", value: JSON.stringify(this.ministranciLista)}).then(async() => {
        //     this.secureStorage.set({key: "indexyParafia", value: JSON.stringify([this.indexDyzuru,this.indexObecnosci,this.indexMinistrantow])}).then(async() => {
        //         await this.odswiezListeMinistrantow();
        //     })
        // })
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
        // this.secureStorage.set({key: "ministranci", value: JSON.stringify(this.ministranciLista)}).then(async() => {
        //     await this.odswiezListeMinistrantow();
        // })
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
    //    this.secureStorage.set({key: "ministranci", value: JSON.stringify(this.ministranciLista)}).then(async() => {
    //     this.secureStorage.set({key: "dyzury", value: JSON.stringify(this._dyzury)}).then(async() => {
    //         await this.odswiezListeMinistrantow();
    //     })
    // })
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
        // this.secureStorage.setSync({key: "indexyParafia", value: JSON.stringify([this.indexDyzuru,this.indexObecnosci,this.indexMinistrantow])})
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
        await this.odswiezListeMinistrantow();

        // this.secureStorage.set({key: "obecnosci", value: JSON.stringify(this._obecnosci)}).then(async() => {
        //     this.secureStorage.set({key: "ministranci", value: JSON.stringify(this.ministranciLista)}).then(async() => {
        //     this.obecnosciDoWydarzenia(id_wydarzenia,data);
        //     await this.odswiezListeMinistrantow();
        //     });
        // })
        // this.dyzurDoWydarzenia(id_wydarzenia);
    }
}
