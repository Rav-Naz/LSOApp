import { Injectable } from '@angular/core';
import { Wydarzenie } from './wydarzenie.model';
import { BehaviorSubject } from 'rxjs';
import { ParafiaService } from './parafia.service';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class WydarzeniaService {

    constructor(private parafiaService: ParafiaService, private http: HttpService) {}

    aktywnyDzien: number;

    _wydarzenia: Array<Wydarzenie> = [];

    wydarzeniaDyzury = new BehaviorSubject<Array<Wydarzenie>>(null);
    wydarzeniaObecnosc = new BehaviorSubject<Array<Wydarzenie>>(null);
    wydarzeniaEdycja = new BehaviorSubject<Array<Wydarzenie>>(null);

    wyczysc()
    {
        this.aktywnyDzien = 0;
        this._wydarzenia = [];
    }

    get WydarzeniaObecnoscSub() {
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
        return new Promise<number>((resolve) => {
            this.aktywnyDzien = dzien;
            this.http.pobierzWydarzeniaNaDanyDzien(dzien).then(res => {
                if(res === null)
                {
                    resolve(404)
                    return
                }
                this.wydarzeniaObecnosc.next(res);
                resolve(1);
            })
        })
    }

    wszystkieWydarzeniaWDyzurach()
    {
        return new Promise<number>((resolve) => {
            this.http.pobierzWszystkieWydarzenia().then(res => {
                if(res === null)
                {
                    resolve(404)
                }
                this.wydarzeniaDyzury.next(res)
                resolve(1)
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

    async zapiszWydarzenia(staraLista: Array<Wydarzenie>, nowaLista: Array<Wydarzenie>, edytowanaLista: Array<Wydarzenie>, dzien_tygodnia: number) //Wykorzystanie: edutyj-msze
    {
        return new Promise<number>((resolve) => {
            return new Promise<number>((resolve1) => {
                let i = 0;
                staraLista.forEach(stary => {
                    i++
                    if (nowaLista.filter(nowy => stary.id === nowy.id)[0] === undefined) {
                        this.usunWydarzenie(stary).then(res => {
                            if (res === 0 || res === 404) {
                                resolve(404)
                            }
                        });
                    }
                })
                if (i === staraLista.length) {
                    resolve1(1)
                }
            }).then(() => {
                return new Promise<number>((resolve1) => {
                    let i = 0;
                    nowaLista.forEach(async nowy => {
                        i++
                        if (staraLista.filter(stary => nowy.id === stary.id)[0] === undefined) {
                            this.dodajWydarzenie(nowy).then(res => {
                                if (res === 0 || res === 404) {
                                    resolve(404)
                                }
                            });
                        }
                    })
                    if (i === nowaLista.length) {
                        resolve1(1)
                    }
                })
            }).then(() => {
                return new Promise<number>((resolve1) => {
                    let i = 0;
                    edytowanaLista.forEach(async edit => {
                        i++
                        this.http.aktualizacjaWydarzenie(new Date(edit.godzina), edit.id).then(res => {
                            if (res === 0 || res === 404) {
                                resolve(404)
                            }
                        })
                    })
                    if (i === edytowanaLista.length) {
                        resolve1(1)
                    }
                })
            }).then(() => {
                setTimeout(() => {
                    resolve(1)
                }, 500)
            })
        })
    }

    private async dodajWydarzenie(wydarzenie: Wydarzenie) //Wykorzystanie: wydarzeniaService(zapiszWydarzenia)
    {
        return new Promise<number>((resolve) => {
            this.http.dodajNoweWydarzenie(wydarzenie.dzien_tygodnia, wydarzenie.godzina).then(res => {
                resolve(res)
            })

        })
    }

    private async usunWydarzenie(wydarzenie: Wydarzenie) //Wykorzystanie: wydarzeniaService(zapiszWydarzenia)
    {
        return new Promise<number>((resolve) => {
            this.http.usunWydarzenie(wydarzenie.id).then(res => {
                resolve(res)
            })
        })
    }

    wydarzeniaWEdycji(dzien_tygodnia: number) //Wykorzystanie: edytuj-msze, wydarzeniaService(zapiszWydarzenia)
    {
        return new Promise<number>((resolve) => {
            this.http.pobierzWydarzeniaNaDanyDzien(dzien_tygodnia).then(res => {
                if(res === null)
                {
                    resolve(404)
                    return
                }
                this.wydarzeniaEdycja.next(res);
                resolve(1);
            })
        })
    }
}
