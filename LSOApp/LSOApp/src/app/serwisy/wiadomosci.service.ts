import { Injectable } from '@angular/core';
import { Wiadomosc } from './wiadomosci.model';
import { BehaviorSubject } from 'rxjs';
import { SecureStorage } from "nativescript-secure-storage";

@Injectable({
  providedIn: 'root'
})
export class WiadomosciService {

    indexWiad: number = 2;

    private _wiadomosci: Array<Wiadomosc> = [
        // { id: 1, autor_id: 1, odbiorca_id:1, data: new Date(2019,8,7,14), do_opiekuna: true, tresc: "m ipsum dolor sit amet, consectetur adipiscing elit. Nam quis ligula non leo pellentesque condimentum sit amet nec lacus. Nunc facilisis non urna sit amet ultricies. Fusce bibendum mollis justo ut semper. Pellentesque eleifend ex id neque vulputate, nec auctor quam aliquam. In feugiat quis tellus eget interdum."},
        // { id: 2, autor_id: 0, odbiorca_id:1, data: new Date(2019,8,6,23,30), do_opiekuna: false, tresc: "Lorem." , linkobrazu: "https://i1.jbzdy.eu/contents/2019/09/1ea5fa8d32868a885d07fac639c16163.jpg"},
    ];

    secureStorage: SecureStorage;

    constructor(){
        this.secureStorage = new SecureStorage();
        this.secureStorage.get({ key: "wiadomosci" }).then((wiadomosci) => {
            if(wiadomosci !== null)
            {
                let jsonObj: Array<Wiadomosc> = JSON.parse(wiadomosci);
                this._wiadomosci = jsonObj;
                this.wiadomosci.next(this._wiadomosci);
            }
        })
    }

    private wiadomosci = new BehaviorSubject<Array<Wiadomosc>>(null);

    get Wiadomosci() //Wykorzystanie: wiadomosci-m, wiadomosci-o
    {
        return this.wiadomosci.asObservable();
    }

    pobierzWiadomosci()//Wykorzystanie: wiadomosci-m, wiadomosci-o
    {
        return new Promise<void>((resolve) => {
            this.secureStorage.set({key: "wiadomosci", value: JSON.stringify(this._wiadomosci)}).then(() => {
                this.wiadomosci.next(this._wiadomosci);
                resolve()
            })
        })
    }

    async nowaWiadomosc(tresc: string,)//Wykorzystanie: wiadomosci-o
    {
        let data = new Date()
        data.setHours(data.getHours() + 2);
        this.indexWiad ++;
        this._wiadomosci.push({id: this.indexWiad, autor_id: 1, odbiorca_id: 1, do_opiekuna: false, data: data.toJSON(), tresc: tresc})
        await this.pobierzWiadomosci();
    }

    async usunWiadomosc(wiadomosc: Wiadomosc)
    {
        let wiad = this._wiadomosci.filter(wiad => wiad.id === wiadomosc.id)[0];
        let index = this._wiadomosci.indexOf(wiad);
        this._wiadomosci.splice(index,1);
        await this.pobierzWiadomosci();
    }
}
