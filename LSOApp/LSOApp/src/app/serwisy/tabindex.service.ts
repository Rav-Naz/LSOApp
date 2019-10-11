import { Injectable } from '@angular/core';
import {BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabindexService {

    public opiekun: boolean = true;

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

    nowyIndex(index: number) //Wykorzystanie: info, dane-profilowe, dyzury, ustawienia-m, usun-konto, wiadomosci-m, zmien-haslo
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
