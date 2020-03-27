import { Injectable } from '@angular/core';
import {BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabindexService {

    public opiekun: boolean = undefined;

    outlety: Array<string> =
    [
        "dyzury",
        "wiadomosciM",
        "ustawieniaM",
        "obecnosc",
        "ministranci",
        "wiadomosciO",
        "ustawieniaO"
    ];

    private _pageRouterOutlet = new BehaviorSubject<Array<string>>(this.outlety)
    private _tabSelectedIndex = new BehaviorSubject<number>(0);
    private _czyOpiekun = new BehaviorSubject<boolean>(false);

    wyczysc()
    {
        this.outlety = [
            "dyzury",
            "wiadomosciM",
            "ustawieniaM",
            "obecnosc",
            "ministranci",
            "wiadomosciO",
            "ustawieniaO"
        ];
        this.opiekun = false;
        this._tabSelectedIndex.next(0)
        this._czyOpiekun.next(false)

    }

    nowyIndex(index: number) //Wykorzystanie: dane-profilowe, dyzury, ustawienia-m, usun-konto, wiadomosci-m, zmien-haslo
    {
        this._tabSelectedIndex.next(index);
    }

    get tabSelectedIndex() //Wykorzystanie: menu
    {
        return this._tabSelectedIndex.asObservable();
    }

    get czyOpiekun() //Wykorzystanie: menu
    {
        return this._czyOpiekun.asObservable();
    }

    nowyOutlet(index: number, wartosc: string)
    {
        this.outlety[index] = wartosc;
        this._pageRouterOutlet.next(this.outlety);
    }

    async zmianaOpiekuna(bool: boolean)
    {
        return new Promise<number>((resolve) => {
            this.opiekun = bool;
            this._czyOpiekun.next(bool)
            this.nowyIndex(0)
            setTimeout(() => {
                resolve(1)
            },300)
        })
    }

    get PRO()
    {
        return this._pageRouterOutlet.asObservable();
    }
}
