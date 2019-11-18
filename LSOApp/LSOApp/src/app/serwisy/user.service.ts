import { Injectable } from '@angular/core';
import { User } from './user.model';
import { Dyzur } from './dyzur.model';
import { BehaviorSubject } from 'rxjs';
import { SecureStorage } from "nativescript-secure-storage";
import { HttpService } from './http.service';
import { Wydarzenie } from './wydarzenie.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private secureStorage;
    public wersja: string = "1.0"; //Wykorzystanie: ustawienia-m, ustawienia-o
    private user: User

    constructor(private http: HttpService){
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

    private userDyzurySub = new BehaviorSubject<Array<Wydarzenie>>(null);
    private userSub = new BehaviorSubject<User>(null);
    private powiadomieniaODyzurach = new BehaviorSubject<boolean>(null);

    wyczysc()
    {
        this.user = null;
        this.userDyzury = [];
        this.userDyzurySub.next(null);
        this.userSub.next(null)
        this.powiadomieniaODyzurach.next(null)
    }

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

    get UserID()
    {
        return this.user.id_user;
    }

    get UserPerm()
    {
        return this.user.admin;
    }

    zmienUsera(user: User)
    {
        this.user = user
        this.userSub.next(user)
    }

    // setUserDyzury(lista)
    // {
    //     this.userDyzury = lista;
    //     this.userDyzurySub.next(lista)
    // }

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

    async mojeDyzury(id_user: number) { //Wykorzystanie: ministrant-dyzury, ministranci-szczegoly
        return new Promise<number>(resolve => {
            this.http.pobierzDyzuryDlaMinistranta(id_user).then(res => {
                this.userDyzurySub.next(res);
                resolve(1);
            })
        })
    }

    async miejsceWRankignu()
    {   return new Promise<number>((resolve) => {
            this.http.miejsceWRankingu().then(res => {
                resolve(res)
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
