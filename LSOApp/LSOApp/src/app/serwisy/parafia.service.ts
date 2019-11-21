import { Injectable } from '@angular/core';
import { User } from './user.model';
import { BehaviorSubject } from 'rxjs';
import { Dyzur } from './dyzur.model';
import { Wydarzenie } from './wydarzenie.model';
import { Obecnosc } from './obecnosc.model';
import { Stopien } from './stopien.model';
import { HttpService } from './http.service';
import { Parafia } from './parafia.model';
import { UiService } from './ui.service';

@Injectable({
    providedIn: 'root'
})
export class ParafiaService {

    parafia: Parafia;

    // punktyZaObecnosc: number = 1;
    // punktyZaNieobecnosc: number = 0;

    wyslanyEmail: boolean;
    aktualnyMinistrantId: number; //Wykorzystanie: ministranci
    aktualneWydarzenieId: number; //Wykorzystanie: obecnosci
    // indexDyzuru: number = 0;
    // indexObecnosci: number = 0;
    // indexMinistrantow: number = 0;

    zapisz: boolean = true;

    constructor(private http: HttpService){}

    private ministranciLista: Array<User> = [];

    private _dyzury: Array<Dyzur> = [];

    private _obecnosci: Array<Obecnosc> = [];

    private ministranci = new BehaviorSubject<Array<User>>(null);
    private dyzuryWydarzenia = new BehaviorSubject<Array<User>>(null);
    private dyzuryMinistranta = new BehaviorSubject<Array<Wydarzenie>>(null);
    private obecnosciWydarzenia =  new BehaviorSubject<Array<Obecnosc>>(null);
    private podgladanyMinistrant =  new BehaviorSubject<User>(null);

    wyczysc()
    {
        this.parafia = null;
        this.aktualnyMinistrantId = 0;
        this.aktualneWydarzenieId = 0;
        this.ministranciLista = [];
        this._dyzury = [];
        this._obecnosci = [];
        this.ministranci.next(null)
        this.dyzuryWydarzenia.next(null)
        this.dyzuryMinistranta.next(null)
        this.obecnosciWydarzenia.next(null)
        this.podgladanyMinistrant.next(null)
    }

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

    get PodgladMinistranta() //Wykorzystanie: ministranci-szczegoly
    {
        return this.podgladanyMinistrant.asObservable()
    }

    async pobierzParafie()
    {
        return new Promise<number>(resolve => {
            this.http.pobierzParafie().then(async res => {
                if(res === 'blad')
                {
                    resolve(0)
                }
                else
                {
                    this.parafia = JSON.parse(JSON.stringify(res))
                    resolve(1)
                }
            })
        })
    }

    async pobierzMinistrantow()
    {
        return new Promise<Array<User>>(resolve => {
            this.http.pobierzMinistrantow().then(async res => {
                this.ministranciLista = res;
                await this.odswiezListeMinistrantow();
                resolve(res)
            })
        })
    }

    wyszukajDyzury(id_user: number) { //Wykorzystanie: ministrant-dyzury, ministranci-szczegoly
        return new Promise<number>(resolve => {
            this.http.pobierzDyzuryDlaMinistranta(id_user).then(res => {
                this.dyzuryMinistranta.next(res);
                resolve(1);
            })
        })
    }

    dyzurDoWydarzenia(id_wydarzenia: number) { //Wykorzystanie: obecnosc
        return new Promise<number>((resolve) => {
            this.http.pobierzDyzuryDoWydarzenia(id_wydarzenia).then(res => {
                this.dyzuryWydarzenia.next(res);
                resolve(1)
            })
        })
    }

    // dyzuryMinistrant(id_user: number) //Wykorzystanie: userService(constructor)
    // {
    //     let lista =this._dyzury.filter(item => item.id_user === id_user);
    //     return lista;
    // }

    async zapiszDyzury(nowe: Array<Wydarzenie>, stare: Array<Wydarzenie>) //Wykorzystanie: ministranci-dyzury
    {
        return new Promise<number>(async (resolve) => {
            for (let index = 0; index < 7; index++) {
                if (nowe[index] !== stare[index]) {
                    if (nowe[index] === null) {
                        await this.usunDyzur(stare[index].id, this.aktualnyMinistrantId);
                    }
                    else if (stare[index] === null) {
                        await this.dodajDyzur(nowe[index].id, this.aktualnyMinistrantId);
                    }
                    else {
                        await this.usunDyzur(stare[index].id, this.aktualnyMinistrantId);
                        await this.dodajDyzur(nowe[index].id, this.aktualnyMinistrantId);
                    }
                }
            }

            setTimeout(() => {
                this.wyszukajDyzury(this.aktualnyMinistrantId).then(() => {
                    this.dyzurDoWydarzenia(this.aktualneWydarzenieId).then(res => {
                        resolve(res)
                    })
                })
            }, 500)
        })

        // this.secureStorage.set({key: "dyzury", value: JSON.stringify(this._dyzury)}).then(async() => {
        //     this.secureStorage.set({key: "indexyParafia", value: JSON.stringify([this.indexDyzuru,this.indexObecnosci,this.indexMinistrantow])}).then(async() => {
        //         await this.wyszukajDyzury(this.aktualnyMinistrantId);
        //         this.dyzurDoWydarzenia(this.aktualneWydarzenieId)
        //     })
        // })
    }

    private usunDyzur(id_wydarzenia: number, id_user: number) { //Wykorzystanie: parafiaService(zapiszDyzury)

        return new Promise<number>((resolve) => {
            this.http.usunDyzur(id_user, id_wydarzenia).then(res => {
                resolve(res)
            })
        })
        // let doUsuniecia = this._dyzury.filter(dyzur => dyzur.id_user === this.aktualnyMinistrantId && dyzur.id_wydarzenia === id_wydarzenia)[0];//Wykorzystanie: ministranci-dyzury
        // if (doUsuniecia !== undefined && doUsuniecia !== null) {
        //     let index = this._dyzury.indexOf(doUsuniecia);
        //     this._dyzury.splice(index, 1);
        // }
    }

    private dodajDyzur(id_wydarzenia: number, id_user: number) {//Wykorzystanie: parafiaService(zapiszDyzury)
        return new Promise<number>((resolve) => {
            this.http.dodajDyzur(id_user, id_wydarzenia).then(res => {
                resolve(res)
            })
        })
        // this.indexDyzuru++;
        // this._dyzury.push({ id: this.indexDyzuru, id_user: this.aktualnyMinistrantId, id_wydarzenia: id_wydarzenia })//Wykorzystanie: ministranci-dyzury
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
        return new Promise<number>(resolve => {
            this.http.nowyMinistrant(stopien,imie,nazwisko,email).then(res =>
            {
                resolve(res)
            })
        })
        // this.indexMinistrantow++;
        // this.ministranciLista.push({id_user: this.indexMinistrantow, id_diecezji: 1, id_parafii: 1, punkty: 0, stopien: stopien, imie: imie, nazwisko: nazwisko, ulica: null, kod_pocztowy: null, miasto: null, email: email, telefon: null, aktywny: false});
        // this.secureStorage.set({key: "ministranci", value: JSON.stringify(this.ministranciLista)}).then(async() => {
        //     this.secureStorage.set({key: "indexyParafia", value: JSON.stringify([this.indexDyzuru,this.indexObecnosci,this.indexMinistrantow])}).then(async() => {
        //         await this.odswiezListeMinistrantow();
        //     })
        // })
    }


    WybranyMinistrant(id: number) { //Wykorzystanie: ministranci-dyzury, ministranci-szczegoly,
        return new Promise<number>((resolve) => {
            this.http.pobierzMinistranta(id).then(res => {
                if(JSON.stringify(res) === '[]')
                {
                    resolve(0)
                }
                else
                {
                    this.podgladanyMinistrant.next(res)
                    resolve(1)
                }
            })
        })
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
        return new Promise<number>((resolve) => {
            this.http.aktualizacjaMinistranta(ministrant).then(res => {
                this.pobierzMinistrantow().then(() => {
                    resolve(res)
                })
            })
        })
        // let min = this.ministranciLista.filter(mini => mini.id_user === ministrant.id_user)[0];
        // this.ministranciLista[this.ministranciLista.indexOf(min)] = ministrant;
        // this.secureStorage.set({key: "ministranci", value: JSON.stringify(this.ministranciLista)}).then(async() => {
        //     await this.odswiezListeMinistrantow();
        // })
    }

    async usunMinistranta(id_user: number) //Wykorzystanie: ministranci
    {
    //    let min = this.ministranciLista.filter(ministrant => ministrant.id_user === id_user)[0];
    //    let indexListaMinistrantow = this.ministranciLista.indexOf(min);
    //    this.ministranciLista.splice(indexListaMinistrantow,1);

        return new Promise<number>(resolve => {
            this.http.usunMinistranta(id_user).then(res => {
                this.pobierzMinistrantow().then(() => {
                    resolve(res)
                })
            })
        })

    //    let listaDyzurow = this._dyzury.filter(dyzur => dyzur.id_user === id_user);
    //    if(listaDyzurow !== undefined)
    //    {
    //     listaDyzurow.forEach(dyzur => {
    //         let indexDyzuru = this._dyzury.indexOf(dyzur);
    //         this._dyzury.splice(indexDyzuru,1);
    //     })
    //    }
    //    this.secureStorage.set({key: "ministranci", value: JSON.stringify(this.ministranciLista)}).then(async() => {
    //     this.secureStorage.set({key: "dyzury", value: JSON.stringify(this._dyzury)}).then(async() => {
    //         await this.odswiezListeMinistrantow();
    //     })
    // })
    }

    obecnosciDoWydarzenia(id_wydarzenia:number, data: Date) //Wykorzystanie: obecnosc
    {
        // let ob = this._obecnosci.filter(obecnosc => obecnosc.id_wydarzenia === id_wydarzenia && new Date(obecnosc.data).getDate() === data.getDate() &&  new Date(obecnosc.data).getMonth() === data.getMonth() && new Date(obecnosc.data).getFullYear() === data.getFullYear());
        // if(ob === undefined)
        // {
        //     ob = [];
        // }
        return new Promise<number>((resolve) => {
            this.http.pobierzObecnosciDoWydarzenia(id_wydarzenia, data).then(res => {
                this.obecnosciWydarzenia.next(JSON.parse(JSON.stringify(res)));
                resolve(1)
            })
        })


    }

    nowaObecnosc(id_wydarzenia: number, id_user: number, data: Date) //Wykorzystanie: obecnosc
    {
        let ob: Obecnosc = {id: 0, id_wydarzenia: id_wydarzenia, id_user: id_user, data: new Date(data.getFullYear(),data.getMonth(),data.getDate(), data.getHours() + 2).toJSON(), status: null }
        // this.secureStorage.setSync({key: "indexyParafia", value: JSON.stringify([this.indexDyzuru,this.indexObecnosci,this.indexMinistrantow])})
        return ob;
    }

    async zapiszObecnosci(nowaLista: Array<Obecnosc>, czySprawdzanie: boolean) //Wykorzystanie: obecnosc
    {
        return new Promise<number>((resolve) => {
            if(czySprawdzanie)
            {
                nowaLista.forEach(element => {
                    this.http.updateObecnosci(element,this.parafia.punkty_dod_sluzba,this.parafia.punkty_uj_sluzba)
                })
            }
            else
            {
                nowaLista.forEach(element => {
                    this.http.nowaObecnosc(element,this.parafia.punkty_dod_sluzba,this.parafia.punkty_uj_sluzba)
                })
            }

            setTimeout(() => {
                this.pobierzMinistrantow().then(() => {
                    resolve(1)
                })
            }, 500)
        })
        // let id_wydarzenia = nowaLista[0].id_wydarzenia;
        // let data = new Date(nowaLista[0].data);
        // nowaLista.forEach(obecnosc => {
        //   if(czySprawdzanie)
        //   {

        //   }
        //   else
        //   {
        //       let index = this._obecnosci.indexOf(ob);
        //       let aktualnyStatus = this._obecnosci[index].status
        //       let punkty: number = 0;

        //       if(aktualnyStatus !== obecnosc.status)
        //       {
        //           if(aktualnyStatus === 0 && obecnosc.status === 1)
        //           {
        //             punkty += this.punktyZaObecnosc-this.punktyZaNieobecnosc;
        //           }
        //           else if(aktualnyStatus === 0 && obecnosc.status === null)
        //           {
        //             punkty += -this.punktyZaNieobecnosc;
        //           }
        //           else if(aktualnyStatus === 1 && obecnosc.status === 0)
        //           {
        //             punkty += this.punktyZaNieobecnosc-this.punktyZaObecnosc;
        //           }
        //           else if(aktualnyStatus === 1 && obecnosc.status === null)
        //           {
        //             punkty += -this.punktyZaObecnosc;
        //           }
        //           else if(aktualnyStatus === null && obecnosc.status === 0)
        //           {
        //             punkty += this.punktyZaNieobecnosc;
        //           }
        //           else if(aktualnyStatus === null && obecnosc.status === 1)
        //           {
        //             punkty += this.punktyZaObecnosc;
        //           }
        //           this.ministranciLista.filter(ministrant => ministrant.id_user === obecnosc.id_user)[0].punkty += punkty;
        //       }
        //      this._obecnosci[index].status = obecnosc.status;
        //   }
        // });


        // this.secureStorage.set({key: "obecnosci", value: JSON.stringify(this._obecnosci)}).then(async() => {
        //     this.secureStorage.set({key: "ministranci", value: JSON.stringify(this.ministranciLista)}).then(async() => {
        //     this.obecnosciDoWydarzenia(id_wydarzenia,data);
        //     await this.odswiezListeMinistrantow();
        //     });
        // })
        // this.dyzurDoWydarzenia(id_wydarzenia);
    }
}
