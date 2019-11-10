import { Injectable } from '@angular/core';
import {BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabindexService {

    public opiekun: boolean = false;

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

    }

    nowyIndex(index: number) //Wykorzystanie: dane-profilowe, dyzury, ustawienia-m, usun-konto, wiadomosci-m, zmien-haslo
    {
        this._tabSelectedIndex.next(index);
    }

    get tabSelectedIndex() //Wykorzystanie: menu
    {
        return this._tabSelectedIndex.asObservable();
    }

    nowyOutlet(index: number, wartosc: string)
    {
        this.outlety[index] = wartosc;
        this._pageRouterOutlet.next(this.outlety);
    }

    get PRO()
    {
        return this._pageRouterOutlet.asObservable();
    }
}
