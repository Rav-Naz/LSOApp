import { Injectable } from '@angular/core';
import { Wydarzenie } from './wydarzenie.model';
import { BehaviorSubject } from 'rxjs';
import { ParafiaService } from './parafia.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class WydarzeniaService {

    // secureStorage: SecureStorage;

    constructor(private parafiaService: ParafiaService, private http: HttpService) {
        // this.secureStorage = new SecureStorage();
        // this.secureStorage.get({ key: "wydarzenia" }).then((wydarzenia) => {
        //     if(wydarzenia !== null)
        //     {
        //         let jsonObj: Array<Wydarzenie> = JSON.parse(wydarzenia);
        //         this._wydarzenia = jsonObj;
        //         this.wydarzeniaDyzury.next(this._wydarzenia);
        //     }
        // }).then(() => {
        //     this.secureStorage.get({ key: "indexWydarzenia" }).then((indexWydarzenia) => {
        //         if(indexWydarzenia !== null)
        //         {
        //             let jsonObj: number = JSON.parse(indexWydarzenia);
        //             this.indexWydarzenia = jsonObj;
        //         }
        //     })
        // })

    }

   private indexWydarzenia: number = 0;

   aktywnyDzien: number;

    _wydarzenia: Array<Wydarzenie> = [];

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
            this.http.pobierzWydarzeniaNaDanyDzien(dzien, 2).then(res => {
                console.log(res)
                this.wydarzeniaObecnosc.next(res);
                resolve();
            })
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
        // this.secureStorage.setSync({key: "indexWydarzenia", value: JSON.stringify(this.indexWydarzenia)})
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

            // this.secureStorage.set({key: "wydarzenia", value: JSON.stringify(this._wydarzenia)}).then(async() => {
            //     this.wydarzeniaDyzury.next(this._wydarzenia)
            //     await this.wydarzeniaWEdycji(dzien_tygodnia);
            // })

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
