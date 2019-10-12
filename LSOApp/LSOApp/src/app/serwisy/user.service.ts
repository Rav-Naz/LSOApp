import { Injectable } from '@angular/core';
import { User } from './user.model';
import { Dyzur } from './dyzur.model';
import { BehaviorSubject } from 'rxjs';
import { SecureStorage } from "nativescript-secure-storage";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private secureStorage;
    public wersja: string = "1.4 beta"; //Wykorzystanie: ustawienia-m, ustawienia-o
    private user: User = { id_user: 1, id_diecezji: 1, id_parafii: 1, punkty: 243, stopien: 1, imie: "Rafał", nazwisko: "Nazarko", ulica: "Bajkowa 54/2", kod_pocztowy: "37-620", miasto: "Rzeszów", email: "rafal.nazarko@gmail.com", telefon: "506987123", aktywny: true };

    constructor(){
        this.secureStorage = new SecureStorage;
        this.secureStorage.get({key:"powiadomieniaDyzury"}).then((wartosc) => {
            if(wartosc === null)
            {
                wartosc = true;
            }
            else
            {
                wartosc = JSON.parse(wartosc);
            }
            this.zmienPowiadomienia(wartosc);
        })
    }

    userDyzury: Array<Dyzur> = [];

    private userDyzurySub = new BehaviorSubject<Array<Dyzur>>(null);
    private userSub = new BehaviorSubject<User>(this.user);
    private powiadomieniaODyzurach = new BehaviorSubject<boolean>(null);

    get UserSub() { //Wykorzystanie: dyzury, dane-profilowe
        return this.userSub.asObservable();
    }

    get UserDyzurySub() //Wykorzystanie: dyzury
    {
        return this.userDyzurySub.asObservable();
    }

    get UserDyuzryPowiadomienia()
    {
        return this.powiadomieniaODyzurach.asObservable();
    }

    setUserDyzury(lista)
    {
        this.userDyzury = lista;
        this.userDyzurySub.next(lista)
    }

    async zmienPowiadomienia(wartosc: boolean)
    {   return new Promise<void>((resolve) => {
        this.secureStorage.set({ key: "powiadomieniaDyzury", value: JSON.stringify(wartosc)}).then((udaloSie) => {
            if(udaloSie)
            {
                this.powiadomieniaODyzurach.next(wartosc);
                resolve();
            }
        })
    })
    }

    zmienDane(telefon:string,ulica: string, kod:string,miasto: string) { //Wykorzystanie: dane-profilowe
        this.user.telefon = telefon;
        this.user.ulica = ulica;
        this.user.kod_pocztowy = kod;
        this.user.miasto = miasto;
        this.userSub.next(this.user);
    }
}
