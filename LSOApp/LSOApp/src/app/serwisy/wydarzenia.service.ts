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
        return new Promise<void>((resolve) => {
            this.aktywnyDzien = dzien;
            this.http.pobierzWydarzeniaNaDanyDzien(dzien).then(res => {
                this.wydarzeniaObecnosc.next(res);
                resolve();
            })
        })
    }

    wszystkieWydarzeniaWDyzurach()
    {
        return new Promise<number>((resolve) => {
            this.http.pobierzWszystkieWydarzenia().then(res => {
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

    // noweWydarzenie(dzien_tygodnia: number, godzina: Date) //Wykorzystanie: edytuj-msze
    // {
    //     this.indexWydarzenia++;
    //     // this.secureStorage.setSync({key: "indexWydarzenia", value: JSON.stringify(this.indexWydarzenia)})
    //     return {id: this.indexWydarzenia, id_parafii: 2, nazwa: "Msza codzienna",typ: 0, cykl: 0, dzien_tygodnia: dzien_tygodnia, godzina:  new Date(null, null, null, godzina.getHours(), godzina.getMinutes()).toJSON()}
    // }

    async zapiszWydarzenia(staraLista: Array<Wydarzenie>, nowaLista: Array<Wydarzenie>, edytowanaLista: Array<Wydarzenie>, dzien_tygodnia: number) //Wykorzystanie: edutyj-msze
    {
        // console.log("stara ", staraLista.length)
        // console.log("nowa ", nowaLista.length)
        // return new Promise<number>((resolve1) => {
        //     do_dodania.forEach(item => {
        //         return new Promise<void>((resolve) => {
        //             this.http.dodajNoweWydarzenie(2,dzien_tygodnia,item.godzina).then(res => {
        //                 if(res === 1)
        //                 {
        //                     resolve()
        //                 }
        //                 else
        //                 {
        //                     resolve1(0)
        //                 }
        //             })
        //         })
        //     })

        //     do_usuniecia.forEach(item => {
        //         return new Promise<void>((resolve) => {
        //             this.http.usunWydarzenie(item.id).then(res => {
        //                 if(res === 1)
        //                 {
        //                     resolve()
        //                 }
        //                 else
        //                 {
        //                     resolve1(0)
        //                 }
        //             })
        //         })
        //     })

        //     resolve1(1)
        // })
        return new Promise<number>((resolve) => {
            return new Promise<number>((resolve1) => {
                let i = 0;
                staraLista.forEach(stary => {
                    i++
                    if (nowaLista.filter(nowy => stary.id === nowy.id)[0] === undefined) {
                        // this.parafiaService.usunWszystkieDyzuryDlaWydarzenia(stary.id)
                        this.usunWydarzenie(stary).then(res => {
                            if (res === 0) {
                                resolve(0)
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
                                if (res === 0) {
                                    resolve(0)
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
                        this.http.aktualizacjaWydarzenie(new Date(edit.godzina), edit.id)
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



        // this.secureStorage.set({key: "wydarzenia", value: JSON.stringify(this._wydarzenia)}).then(async() => {
        //     this.wydarzeniaDyzury.next(this._wydarzenia)
        //     await this.wydarzeniaWEdycji(dzien_tygodnia);
        // })

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
            // let wyszukany = this._wydarzenia.filter(wydarzenia => wydarzenia.id === wydarzenie.id)[0];
            // let index = this._wydarzenia.indexOf(wyszukany);
            // this._wydarzenia.splice(index,1);
            this.http.usunWydarzenie(wydarzenie.id).then(res => {
                resolve(res)
            })
        })
    }

    wydarzeniaWEdycji(dzien_tygodnia: number) //Wykorzystanie: edytuj-msze, wydarzeniaService(zapiszWydarzenia)
    {
        return new Promise<void>((resolve) => {
            this.http.pobierzWydarzeniaNaDanyDzien(dzien_tygodnia).then(res => {
                this.wydarzeniaEdycja.next(res);
                resolve();
            })
        })
    }
}
