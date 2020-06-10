import { Injectable } from '@angular/core';
import { User } from './user.model';
import { BehaviorSubject } from 'rxjs';
import { Dyzur } from './dyzur.model';
import { Wydarzenie } from './wydarzenie.model';
import { Obecnosc } from './obecnosc.model';
import { Stopien } from './stopien.model';
import { HttpService } from './http.service';
import { Parafia } from './parafia.model';

@Injectable({
    providedIn: 'root'
})
export class ParafiaService {

    parafia: Parafia;

    // punktyZaObecnosc: number = 1;
    // punktyZaNieobecnosc: number = 0;

    wyslanyEmail;
    aktualnyMinistrantId: number; //Wykorzystanie: ministranci
    aktualneWydarzenieId: number; //Wykorzystanie: obecnosci
    // indexDyzuru: number = 0;
    // indexObecnosci: number = 0;
    // indexMinistrantow: number = 0;

    zapisz: boolean = true;

    constructor(private http: HttpService){}

    private ministranciLista: Array<User> = [];

    private _dyzury: Array<Dyzur> = [];

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
        this.ministranci.next([])
        this.dyzuryWydarzenia.next([])
        this.dyzuryMinistranta.next([])
        this.obecnosciWydarzenia.next([])
        this.podgladanyMinistrant.next(null)
    }

    get nazwaParafii() {
        return this.parafia.nazwa_parafii
    }

    get Parafia()
    {
        return this.parafia
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
                else if(res === 'jwt')
                {
                    resolve(404)
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
                if(res !== null)
                {
                    this.ministranciLista = res;
                    await this.odswiezListeMinistrantow();
                    resolve(res)
                }
                else
                {
                    resolve(res)
                }
            })
        })
    }

    wyszukajDyzury(id_user: number) { //Wykorzystanie: ministrant-dyzury, ministranci-szczegoly
        return new Promise<number>(resolve => {
            this.http.pobierzDyzuryDlaMinistranta(id_user).then(res => {
                if(res === null)
                {
                    resolve(404)
                    return
                }
                this.dyzuryMinistranta.next(res);
                resolve(1);
            })
        })
    }

    dyzurDoWydarzenia(id_wydarzenia: number, typ?: number) { //Wykorzystanie: obecnosc
        return new Promise<number>((resolve) => {
            if(typ !== undefined && typ !== null && typ === 0)
            {
                this.http.pobierzDyzuryDoWydarzenia(id_wydarzenia).then(res => {
                    if(res === null)
                    {
                        resolve(404)
                        return
                    }
                    this.dyzuryWydarzenia.next(res);
                    resolve(1)
                })
            }
            else
            {
                this.dyzuryWydarzenia.next(this.ministranciLista);
            }
        })
    }

    async wyzerujPunkty()
    {
        return new Promise<number>(resolve => {
            this.http.wyzerujPunkty().then(async res => {
                if(res === 1)
                {
                    this.pobierzMinistrantow().then(res => {
                        resolve(1)
                    })
                }
                else if(res === 404)
                {
                    resolve(res)
                }
                else
                {
                    resolve(0)
                }
            })
        })
    }

    async zapiszDyzury(nowe: Array<Wydarzenie>, stare: Array<Wydarzenie>) //Wykorzystanie: ministranci-dyzury
    {
        return new Promise<number>(async (resolve) => {
            for (let index = 0; index < 7; index++) {
                if (nowe[index] !== stare[index]) {
                    if (nowe[index] === null) {
                        await this.usunDyzur(stare[index].id, this.aktualnyMinistrantId)
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
                this.wyszukajDyzury(this.aktualnyMinistrantId).then(res => {
                    if(res === 404)
                    {
                        resolve(res)
                        return
                    }
                    if(this.aktualneWydarzenieId !== null)
                    {
                        this.dyzurDoWydarzenia(this.aktualneWydarzenieId).then(res => {
                            resolve(res)
                        })
                    }
                })
            }, 500)
        })
    }

    private usunDyzur(id_wydarzenia: number, id_user: number) { //Wykorzystanie: parafiaService(zapiszDyzury)

        return new Promise<number>((resolve) => {
            this.http.usunDyzur(id_user, id_wydarzenia).then(res => {
                resolve(res)
            })
        })
    }

    private dodajDyzur(id_wydarzenia: number, id_user: number) {//Wykorzystanie: parafiaService(zapiszDyzury)
        return new Promise<number>((resolve) => {
            this.http.dodajDyzur(id_user, id_wydarzenia).then(res => {
                resolve(res)
            })
        })
    }

    async usunWszystkieDyzuryDlaWydarzenia(id_wydarzenia: number) //Wykorzystanie: wydarzeniaService(zapiszWydarzenia)
    {
       let lista = this._dyzury.filter(dyzur => dyzur.id_wydarzenia === id_wydarzenia);
       if(lista !== undefined)
       {
            lista.forEach(element => {
            let index = this._dyzury.indexOf(element);
            this._dyzury.splice(index, 1);
           })
       }
    }

    async usunWszystkieDyzury()
    {
        return new Promise<number>(resolve => {
            this.http.usunWszystkieDyzury().then(res => {
                if(res === 404)
                {
                    resolve(res)
                    return
                }
                if(this.aktualneWydarzenieId !== null)
                {
                    this.dyzurDoWydarzenia(this.aktualneWydarzenieId).then(ress => {
                        resolve(1)
                    })
                }
            })
        })
    }

    async nowyMinistrant(stopien: Stopien, imie: string, nazwisko: string, email: string) //Wykorzystanie: ministrant-nowy
    {
        return new Promise<number>(resolve => {
            this.http.nowyMinistrant(stopien,imie,nazwisko,email).then(res =>
            {
                resolve(res)
            })
        })
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
        })
    }

    async updateMinistranta(ministrant: User)
    {
        return new Promise<number>((resolve) => {
            this.http.aktualizacjaMinistranta(ministrant).then(res => {
                if(res === 404)
                {
                    resolve(res)
                    return
                }
                this.pobierzMinistrantow().then(() => {
                    resolve(res)
                })
            })
        })
    }

    async usunMinistranta(id_user: number) //Wykorzystanie: ministranci
    {
        return new Promise<number>(resolve => {
            this.http.usunMinistranta(id_user).then(res => {
                if(res === 404)
                {
                    resolve(res)
                    return
                }
                this.pobierzMinistrantow().then(() => {
                    resolve(res)
                })
            })
        })
    }

    async usunKontoMinistanta(id_user:number)
    {
        return new Promise<number>((resolve) => {
            this.http.usunKontoMinistranta(id_user).then(res => {
                if(res === 404)
                {
                    resolve(404)
                    return
                }
                this.WybranyMinistrant(id_user).then(() => {
                    resolve(res)
                })
            })
        })
    }

    obecnosciDoWydarzenia(id_wydarzenia:number, data: Date) //Wykorzystanie: obecnosc
    {
        return new Promise<number>((resolve) => {
            this.http.pobierzObecnosciDoWydarzenia(id_wydarzenia, data).then(res => {
                this.obecnosciWydarzenia.next(JSON.parse(JSON.stringify(res)));
                resolve(1)
            })
        })


    }

    async aktualizujParafie(nazwa_parafii: string, id_diecezji: number, miasto: string, id_typu: number)
    {
        return new Promise<number>(resolve => {
            this.http.aktualizacjaDanychParafii(nazwa_parafii,id_diecezji,miasto,id_typu).then(res => {
                if(res === 404)
                {
                    resolve(res)
                    return
                }
                this.pobierzParafie().then(res => {
                    resolve(res)
                })
            })
        })
    }

    nowaObecnosc(id_wydarzenia: number, id_user: number, data: Date, start: number, typ: number) //Wykorzystanie: obecnosc
    {
        let ob: Obecnosc = {id: 0, id_wydarzenia: id_wydarzenia, id_user: id_user, data: new Date(data.getFullYear(),data.getMonth(),data.getDate(), data.getHours() + 2).toJSON(), status: start === 0 ? null : 1, typ: typ}
        return ob;
    }

    async zapiszObecnosci(nowaLista: Array<Obecnosc>, czySprawdzanie: boolean) //Wykorzystanie: obecnosc
    {
        return new Promise<number>((resolve) => {

                nowaLista.forEach(element => {
                    if(element.id === 0)
                    {
                        this.http.nowaObecnosc(element,this.parafia.punkty_dod_sluzba,this.parafia.punkty_uj_sluzba, this.parafia.punkty_dodatkowe)
                    }
                    else
                    {
                        this.http.updateObecnosci(element,this.parafia.punkty_dod_sluzba,this.parafia.punkty_uj_sluzba, this.parafia.punkty_dodatkowe)
                    }
                })

            setTimeout(() => {
                this.pobierzMinistrantow().then(res => {
                    if(res === null)
                    {
                        resolve(404)
                        return
                    }
                    resolve(1)
                })
            }, 500)
        })
    }
}
