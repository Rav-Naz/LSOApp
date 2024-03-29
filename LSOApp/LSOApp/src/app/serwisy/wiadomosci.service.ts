import { Injectable } from '@angular/core';
import { Wiadomosc } from './wiadomosci.model';
import { BehaviorSubject } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class WiadomosciService {

    private _wiadomosci: Array<Wiadomosc> = [];

    constructor(private http: HttpService) {}

    private wiadomosci = new BehaviorSubject<Array<Wiadomosc>>(null);

    wyczysc()
    {
        this._wiadomosci = [];
        this.wiadomosci.next([])
    }

    get Wiadomosci() //Wykorzystanie: wiadomosci-m, wiadomosci-o
    {
        return this.wiadomosci.asObservable();
    }

    async pobierzWiadomosci(do_opiekuna: number, limit: number)//Wykorzystanie: wiadomosci-m, wiadomosci-o
    {
        return new Promise<void>(resolve => {
            this.http.pobierzWidaomosci(do_opiekuna, limit).then(res => {
                this.wiadomosci.next(res);
                resolve()
            })
        })
    }

    async nowaWiadomosc(tresc: string)//Wykorzystanie: wiadomosci-o
    {
        return new Promise<number>(resolve => {
            this.http.wyslijWidaomosc(tresc).then( res => {
                resolve(res)
        })

        })
    }

    async usunWiadomosc(wiadomosc: Wiadomosc, limit: number) {
        return new Promise<number>(resolve => {
            this.http.usunWiadomosc(wiadomosc.id).then( async res => {

                if(res === 1)
                {
                    await this.pobierzWiadomosci(1, limit).then(() => {
                        resolve(1)
                    });
                }
                else if(res === 404)
                {
                    resolve(404)
                }
                else
                {
                    resolve(0)
                }
            })
        })
    }
}
