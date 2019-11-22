import { Injectable } from '@angular/core';
import { Wiadomosc } from './wiadomosci.model';
import { BehaviorSubject } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class WiadomosciService {

    private _wiadomosci: Array<Wiadomosc> = [];

    // secureStorage: SecureStorage;

    constructor(private http: HttpService) {
        // this.secureStorage = new SecureStorage();
        // this.secureStorage.get({ key: "wiadomosci" }).then((wiadomosci) => {
        //     if(wiadomosci !== null)
        //     {
        //         let jsonObj: Array<Wiadomosc> = JSON.parse(wiadomosci);
        //         this._wiadomosci = jsonObj;
        //         this.wiadomosci.next(this._wiadomosci);
        //     }
        // })
    }

    private wiadomosci = new BehaviorSubject<Array<Wiadomosc>>(null);

    wyczysc()
    {
        this._wiadomosci = [];
    }

    get Wiadomosci() //Wykorzystanie: wiadomosci-m, wiadomosci-o
    {
        return this.wiadomosci.asObservable();
    }

    async pobierzWiadomosci()//Wykorzystanie: wiadomosci-m, wiadomosci-o
    {
        return new Promise<Array<Wiadomosc>>(resolve => {
            this.http.pobierzWidaomosci(1).then(res => {
                this.wiadomosci.next(res);
                resolve()
            })
            // this.secureStorage.set({key: "wiadomosci", value: JSON.stringify(this._wiadomosci)}).then(() => {
            //     resolve()
            // })
        })
    }

    async nowaWiadomosc(tresc: string, )//Wykorzystanie: wiadomosci-o
    {
        return new Promise<number>(resolve => {
            this.http.wyslijWidaomosc(tresc).then( res => {
                resolve(res)
        })

        })
    }

    async usunWiadomosc(wiadomosc: Wiadomosc) {
        return new Promise<number>(resolve => {
            this.http.usunWiadomosc(wiadomosc.id).then( async res => {

                if(res === 1)
                {
                    await this.pobierzWiadomosci().then(() => {
                        resolve(1)
                    });
                }
                else
                {
                    resolve(0)
                }
            })
        })
    }
}
