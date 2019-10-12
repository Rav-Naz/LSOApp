import { Injectable } from '@angular/core';
import { Wydarzenie } from './wydarzenie.model';
import { BehaviorSubject } from 'rxjs';
import { ParafiaService } from './parafia.service';
import { SecureStorage } from "nativescript-secure-storage";

@Injectable({
  providedIn: 'root'
})
export class WydarzeniaService {

    secureStorage: SecureStorage;

    constructor(private parafiaService: ParafiaService) {
        this.secureStorage = new SecureStorage();
        this.secureStorage.get({ key: "wydarzenia" }).then((wydarzenia) => {
            if(wydarzenia !== null)
            {
                let jsonObj: Array<Wydarzenie> = JSON.parse(wydarzenia);
                this._wydarzenia = jsonObj;
                this.wydarzeniaDyzury.next(this._wydarzenia);
            }
        }).then(() => {
            this.secureStorage.get({ key: "indexWydarzenia" }).then((indexWydarzenia) => {
                if(indexWydarzenia !== null)
                {
                    let jsonObj: number = JSON.parse(indexWydarzenia);
                    this.indexWydarzenia = jsonObj;
                }
            })
        })

    }

   private indexWydarzenia: number = 0;

   aktywnyDzien: number;

    _wydarzenia: Array<Wydarzenie> = [
        // { id: 1, id_parafii: 2, nazwa: "Msza codzienna", typ: 0, cykl: 0, dzien_tygodnia: 3, godzina: new Date(null, null, null, 7, 30) },
        // { id: 2, id_parafii: 2, nazwa: "Msza codzienna", typ: 0, cykl: 0, dzien_tygodnia: 1, godzina: new Date(null, null, null, 23) },
        // { id: 3, id_parafii: 2, nazwa: "Msza codzienna", typ: 0, cykl: 0, dzien_tygodnia: 2, godzina: new Date(null, null, null, 21, 30) },
        // { id: 4, id_parafii: 2, nazwa: "Msza codzienna", typ: 0, cykl: 0, dzien_tygodnia: 2, godzina: new Date(null, null, null, 9) },
        // { id: 5, id_parafii: 2, nazwa: "Msza codzienna", typ: 0, cykl: 0, dzien_tygodnia: 3, godzina: new Date(null, null, null, 10, 30) },
        // { id: 6, id_parafii: 2, nazwa: "Msza codzienna", typ: 0, cykl: 0, dzien_tygodnia: 4, godzina: new Date(null, null, null, 12) },
        // { id: 7, id_parafii: 2, nazwa: "Msza codzienna", typ: 0, cykl: 0, dzien_tygodnia: 5, godzina: new Date(null, null, null, 18,20) },
        // { id: 8, id_parafii: 2, nazwa: "Msza codzienna", typ: 0, cykl: 0, dzien_tygodnia: 5, godzina: new Date(null, null, null, 10, 40) },
        // { id: 9, id_parafii: 2, nazwa: "Msza codzienna", typ: 0, cykl: 0, dzien_tygodnia: 5, godzina: new Date(null, null, null, 9) },
        // { id: 10, id_parafii: 2, nazwa: "Msza codzienna", typ: 0, cykl: 0, dzien_tygodnia: 0, godzina: new Date(null, null, null, 20, 30) },
        // { id: 11, id_parafii: 2, nazwa: "Msza codzienna", typ: 0, cykl: 0, dzien_tygodnia: 0, godzina: new Date(null, null, null, 9) },
        // { id: 12, id_parafii: 2, nazwa: "Msza codzienna", typ: 0, cykl: 0, dzien_tygodnia: 0, godzina: new Date(null, null, null, 10, 30) },
        // { id: 13, id_parafii: 2, nazwa: "Msza codzienna", typ: 0, cykl: 0, dzien_tygodnia: 0, godzina: new Date(null, null, null, 12) },
    ];

    wydarzeniaDyzury = new BehaviorSubject<Array<Wydarzenie>>(null);
    wydarzeniaObecnosc = new BehaviorSubject<Array<Wydarzenie>>(null);
    wydarzeniaEdycja = new BehaviorSubject<Array<Wydarzenie>>(null);

    get WydarzeniaObecnoscSub()
    {
        return this.wydarzeniaObecnosc.asObservable();
    }

    get WydarzeniaDyzurySub() //Wykorzystanie: ministranci-dyzury
    {
        return this.wydarzeniaDyzury.asObservable();
    }

    get WydarzeniaEdycjaSub() //Wykorzystanie: edytuj-msze
    {
        return this.wydarzeniaEdycja.asObservable();
    }

    dzisiejszeWydarzenia(dzien: number) {//Wykorzystanie: wydarzeniaService (wydarzeniaWEdycji)
        return new Promise<void>((resolve) => {
            this.aktywnyDzien = dzien;
            let lista = this._wydarzenia.filter((item) => item.dzien_tygodnia === dzien);
            this.wydarzeniaObecnosc.next(lista);
            resolve();
        })
    }

    najblizszeWydarzenie(data: Date): Wydarzenie { //Wykorzystanie: obecnosc
        return this._wydarzenia.filter((item) => new Date(item.godzina).getTime() >= data.getTime() && item.dzien_tygodnia === data.getDay())[0];
    }

    wybraneWydarzenie(id_wyd: number) //Wykorzystanie: ministranci-dyzury, ministranci-szczegoly, obecnosc
    {
        return this._wydarzenia.filter((item) => item.id === id_wyd)[0];
    }

    noweWydarzenie(dzien_tygodnia: number, godzina: Date) //Wykorzystanie: edytuj-msze
    {
        this.indexWydarzenia++;
        this.secureStorage.setSync({key: "indexWydarzenia", value: JSON.stringify(this.indexWydarzenia)})
        return {id: this.indexWydarzenia, id_parafii: 2, nazwa: "Msza codzienna",typ: 0, cykl: 0, dzien_tygodnia: dzien_tygodnia, godzina:  new Date(null, null, null, godzina.getHours(), godzina.getMinutes()).toJSON()}
    }

    async zapiszWydarzenia(staraLista: Array<Wydarzenie>, nowaLista: Array<Wydarzenie>, dzien_tygodnia: number) //Wykorzystanie: edutyj-msze
    {
            staraLista.forEach(stary => {
                if(nowaLista.filter(nowy => stary.id === nowy.id)[0] === undefined)
                {
                    this.parafiaService.usunWszystkieDyzuryDlaWydarzenia(stary.id)
                    this.usunWydarzenie(stary);
                }
            })

            nowaLista.forEach(nowy => {
                if(staraLista.filter(stary => nowy.id === stary.id)[0] === undefined)
                {
                    this.dodajWydarzenie(nowy);
                }
            })

            this.secureStorage.set({key: "wydarzenia", value: JSON.stringify(this._wydarzenia)}).then(async() => {
                this.wydarzeniaDyzury.next(this._wydarzenia)
                await this.wydarzeniaWEdycji(dzien_tygodnia);
            })

    }

    private dodajWydarzenie(wydarzenie: Wydarzenie) //Wykorzystanie: wydarzeniaService(zapiszWydarzenia)
    {
        this._wydarzenia.push(wydarzenie);
    }

    private usunWydarzenie(wydarzenie: Wydarzenie) //Wykorzystanie: wydarzeniaService(zapiszWydarzenia)
    {
        let wyszukany = this._wydarzenia.filter(wydarzenia => wydarzenia.id === wydarzenie.id)[0];
        let index = this._wydarzenia.indexOf(wyszukany);
        this._wydarzenia.splice(index,1);
    }

    private dzienneWydarzenia(dzien: number): Array<Wydarzenie> {//Wykorzystanie:  wydarzeniaService (wydarzeniaWEdycji)
        return this._wydarzenia.filter((item) => item.dzien_tygodnia === dzien);
    }

    wydarzeniaWEdycji(dzien_tygodnia: number) //Wykorzystanie: edytuj-msze, wydarzeniaService(zapiszWydarzenia)
    {
        this.wydarzeniaEdycja.next(this.dzienneWydarzenia(dzien_tygodnia));
        return Promise.resolve()
    }
}
