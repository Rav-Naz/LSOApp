import { Injectable } from '@angular/core';
import { User } from './user.model';
import { Dyzur } from './dyzur.model';
import { BehaviorSubject } from 'rxjs';
import { HttpService } from './http.service';
import { Wydarzenie } from './wydarzenie.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    public wersja: string = "2.2.0"; //Wykorzystanie: ustawienia-m, ustawienia-o
    private user: User

    constructor(private http: HttpService){}

    userDyzury: Array<Dyzur> = [];

    private userDyzurySub = new BehaviorSubject<Array<Wydarzenie>>(null);
    private userSub = new BehaviorSubject<User>(null);
    private powiadomieniaODyzurach = new BehaviorSubject<boolean>(null);

    wyczysc()
    {
        this.user = null;
        this.userDyzury = [];
        this.userSub.next(null)
        this.userDyzurySub.next([])
        this.powiadomieniaODyzurach.next(null)

    }

    get UserSub() { //Wykorzystanie: dyzury, dane-profilowe
        return this.userSub.asObservable();
    }

    get UserImieINazwisko() { //Wykorzystanie: dyzury, dane-profilowe
        return this.user.imie + ' ' + this.user.nazwisko;
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

    get UserStopien()
    {
        return this.user.stopien;
    }

    get UserPerm()
    {
        return this.user.admin;
    }

    get UserEmail()
    {
        return this.user.email;
    }

    zmienUsera(user: User)
    {
        this.user = user
        this.userSub.next(user)
        this.powiadomieniaODyzurach.next(user.powiadomienia === 1 ? true : false)
    }

    async zmienPowiadomienia(wartosc: boolean)
    {   return new Promise<void>((resolve) => {
        this.powiadomieniaODyzurach.next(wartosc)
        this.http.zmienPowiadomienia(wartosc).then((res) => {
            resolve()
        })
    })
    }

    async mojeDyzury(id_user: number) { //Wykorzystanie: ministrant-dyzury, ministranci-szczegoly
        return new Promise<number>(resolve => {
            this.http.pobierzDyzuryDlaMinistranta(id_user).then(res => {
                if(res === null)
                {
                    resolve(404)
                    return
                }
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

    async zmienDane(telefon:string,ulica: string, kod:string,miasto: string) { //Wykorzystanie: dane-profilowe
        return new Promise<number>((resolve) => {
            this.http.aktualizacjaDanychMinistranta(ulica,kod,miasto,telefon).then(res => {
                if(res === 0 || res === 404)
                {
                    resolve(res)
                }
                else
                {
                    this.http.pobierzMinistranta(res).then(user => {
                        this.userSub.next(user)
                        resolve(1)
                    })
                }
            })
        })
    }

    async zmienHaslo(aktualne_haslo:string,nowe_haslo: string) { //Wykorzystanie: dane-profilowe
        return new Promise<number>((resolve) => {
            this.http.zmienHaslo(aktualne_haslo,nowe_haslo).then(res => {
                resolve(res)
            })
        })
    }

    async usunKonto(haslo: string)
    {
        return new Promise<number>((resolve) => {
            this.http.usunKontoUsera(this.user.admin, haslo).then(res => {
                resolve(res)
            })
        })
    }
}
