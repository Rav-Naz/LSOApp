import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as sha512 from 'js-sha512';
import { User } from './user.model';
import { Wydarzenie } from './wydarzenie.model';
import { Obecnosc } from './obecnosc.model';
import { Wiadomosc } from './wiadomosci.model';

declare var process: any;

@Injectable({
    providedIn: 'root'
})

export class HttpService {

    private getEnvironmentVars(key: string): string {
        if (process.env) {
            return process.env[key];
        } else {
            return "";
        }
    }

    private JWT: string = null;

    private serverUrl: string = null;
    private smart: string = null;

    constructor(private http: HttpClient) {
        this.serverUrl = this.getEnvironmentVars('serverURL');
        this.smart = this.getEnvironmentVars('smart');
    }

    private id_parafii: number = null;
    private id_user: number = null;

    private urzadzenie_id: string = null;
    private os: string = null;


    private headers = new HttpHeaders({
        "Content-Type": "application/json",
    });


    nadajId_Parafii(id_parafii: number)
    {
        this.id_parafii = id_parafii;
    }
    nadajId_User(id_user: number)
    {
        this.id_user = id_user;
    }
    nadaj_wlasciwosci_urzadzenia(os: string, device_id: string)
    {
        this.os = os
        this.urzadzenie_id = device_id
    }

    wyczysc()
    {
        this.id_parafii = null;
        this.id_user = null;
        this.JWT = null;
    }

////////////////// ZAPYTANIA BEZ JWT //////////////////

    //LOGOWANIE
    async logowanie(email: string, haslo: string) {
        return new Promise<string>(resolve => {
            this.http.post(this.serverUrl + '/login',{ email: email, haslo: sha512.sha512.hmac('mSf', haslo), smart: this.smart, urzadzenie_id: this.urzadzenie_id, os: this.os } , { headers: this.headers }).subscribe(res => {
                if(res === 'nieaktywne')
                {
                    resolve('nieaktywne')
                }
                else if(res === 'brak')
                {
                    resolve('brak')
                }
                else if(res === 'niepoprawne')
                {
                    resolve('niepoprawne')
                }
                else if(res[0].hasOwnProperty('id_parafii'))
                {
                    this.JWT = res[1]
                    this.nadajId_User(res[0].id_user)
                    this.nadajId_Parafii(res[0].id_parafii)
                    resolve(JSON.parse(JSON.stringify(res[0])))
                }
                else
                {
                    resolve('blad')
                }
            }, err => {
                resolve('blad')
            });
        });
    }

    //AKTYWACJA USERA
    async aktywacjaUsera(email: string, kod_aktywacyjny: string, haslo: string) {
        return new Promise<string>(resolve => {

            this.http.post(this.serverUrl + '/activate', { email: email, kod_aktywacyjny: kod_aktywacyjny, haslo: sha512.sha512.hmac('mSf', haslo), smart: this.smart } , { headers: this.headers }).subscribe(res => {
                if(res === 'nieistnieje')
                {
                    resolve('nieistnieje')
                }
                else if(res === 'niepoprawny')
                {
                    resolve('niepoprawny')
                }
                else if(res === 'niemakodu')
                {
                    resolve('niemakodu')
                }
                else if(res === 'wygaslo')
                {
                    resolve('wygaslo')
                }
                else if(res.hasOwnProperty('changedRows'))
                {
                    resolve(JSON.parse(JSON.stringify(res)))
                }
                else
                {
                    resolve('blad')
                }
            }, err => {
                resolve('blad')
            }   );
        });
    }

    //UTWORZENIE NOWEJ PARAFII
    async rejestracja(nazwa_parafii: string, id_diecezji: number, miasto: string, id_typu: number, stopien: number, imie: string, nazwisko: string, email: string) {

        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/register', { nazwa_parafii: nazwa_parafii, id_diecezji: id_diecezji, miasto: miasto, id_typu: id_typu, stopien: stopien, imie: imie, nazwisko: nazwisko, email: email, smart: this.smart}, { headers: this.headers }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else if (res.hasOwnProperty('code')) {
                    let code = JSON.parse(JSON.stringify(res));
                    if (code.code === 'ER_DUP_ENTRY') {
                        resolve(2);
                    }
                    else
                    {
                        resolve(0)
                    }
                }
                else if (res === 'istnieje') {
                    resolve(2);
                }
                else if (res === 'ponowne') {
                    resolve(3);
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //PRZYPOMNIENIE HASŁA
    async przypomnij(email: string) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/remind', { email: email, smart: this.smart }, { headers: this.headers }).subscribe(res => {
                let response = JSON.parse(JSON.stringify(res))
                resolve(response.changedRows)
            }, err => {
                resolve(0)
            });
        });
    }

////////////////// ZAPYTANIA Z JWT //////////////////

    //WYLOGOWANIE
    async wyloguj() {
        return new Promise<number>(resolve => {
            this.http.post(this.serverUrl + '/logout', {smart: this.smart, id_user: this.id_user, jwt: this.JWT} , { headers: this.headers }).subscribe(res => {
                if(res === 'wylogowano')
                {
                    resolve(1)
                }
                else
                {
                    resolve(0)
                }
            }, err => {
                console.log(err)
                resolve(0)
            });
        });
    }

    //ZMIEN POWIADOMIENIA
    async zmienPowiadomienia(wartosc: boolean) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/change_notifications', {smart: this.smart, id_user: this.id_user, powiadomienia: wartosc ? 1 : 0, jwt: this.JWT} , { headers: this.headers }).subscribe(res => {
               resolve(1)
            }, err => {
                resolve(0)
            });
        });
    }

    //USUWANIE PARAFII
    async usuwanieParafii(haslo: string) {

        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/delete_parish', {id_user: this.id_user, id_parafii: this.id_parafii, haslo: sha512.sha512.hmac('mSf', haslo), smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {

                if (res === "zakonczono") {
                    resolve(1);
                }
                else if(res === "niepoprawne") {
                    resolve(2)
                }
                else if(res === "nieistnieje") {
                    resolve(3)
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //POBIERANIE DANCYH PARAFII
    async pobierzParafie() {
        return new Promise<string>(resolve => {

            this.http.post(this.serverUrl + '/parish',{ id_parafii: this.id_parafii,smart: this.smart, jwt: this.JWT } ,{ headers: this.headers }).subscribe(res => {
                if(res.hasOwnProperty('id_parafii'))
                {
                    resolve(JSON.parse(JSON.stringify(res)))
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve('jwt')
                }
                else
                {
                    resolve('blad')
                }
            }, err => {
                resolve('blad')
            });
        });
    }

        //AKTUALIZACJA DANYCH PARAFII
        async aktualizacjaDanychParafii(nazwa_parafii: string, id_diecezji: number, miasto: string, id_typu: number) {
            return new Promise<number>(resolve => {

                this.http.post(this.serverUrl + '/update_parish', {nazwa_parafii: nazwa_parafii, id_diecezji: id_diecezji, miasto: miasto, id_typu: id_typu, id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                    if (res.hasOwnProperty('insertId')) {
                        resolve(1);
                    }
                    else if(res === "You have not permission to get the data")
                    {
                        resolve(404)
                    }
                    else {
                        resolve(0);
                    }
                }, err => {
                    resolve(0)
                });
            });
        }

    //POBIERANIE MINISTRANTÓW
    async pobierzMinistrantow() {
        return new Promise<Array<User>>(resolve => {

            this.http.post(this.serverUrl + '/ministranci', { id_parafii: this.id_parafii ,smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if(res === "You have not permission to get the data")
                {
                    resolve(null)
                }
                else
                {
                    resolve(JSON.parse(JSON.stringify(res)))
                }
            }), err => {
                resolve([])
            };
        });
    }

    //DODAWANIE NOWEGO MINISTRANTA
    async nowyMinistrant(stopien: number, imie: string, nazwisko: string, email: string) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/new_user', {id_parafii: this.id_parafii, stopien: stopien, imie: imie, nazwisko: nazwisko, email: email, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else if (res.hasOwnProperty('code')) {
                    let code = JSON.parse(JSON.stringify(res));
                    if (code.code === 'ER_DUP_ENTRY') {
                        resolve(2);
                    }
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //AKTYWACJA MINISTRANTA
    async aktywacjaMinistranta(email: string, id_user: number) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/activate_user', {email: email, id_user: id_user,id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else if (res.hasOwnProperty('code')) {
                    let code = JSON.parse(JSON.stringify(res));
                    if (code.code === 'ER_DUP_ENTRY') {
                        resolve(2);
                    }
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //AKTUALIZACJA MINISTRANTA
    async aktualizacjaMinistranta(ministrant: User) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/user_update', {stopien: ministrant.stopien, punkty: ministrant.punkty, id_user: ministrant.id_user, admin: ministrant.admin, imie: ministrant.imie, nazwisko: ministrant.nazwisko,id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }


    //AKTUALIZACJA DANYCH MINISTRANTA
    async aktualizacjaDanychMinistranta(ulica: string, kod_pocztowy: string, miasto: string, telefon: string) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/update_user_data', {ulica: ulica, kod_pocztowy: kod_pocztowy, miasto: miasto, telefon: telefon, id_user: this.id_user, id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(this.id_user);
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //POBIERANIE DANYCH O MINISTRANCIE
    async pobierzMinistranta(id_user: number) {
        return new Promise<User>(resolve => {

            this.http.post(this.serverUrl + '/ministrant',{ id_user: id_user, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if(res === "You have not permission to get the data")
                {
                    resolve(JSON.parse(JSON.stringify([])))
                }
                else
                {
                    resolve(JSON.parse(JSON.stringify(res)))
                }
            });
        });
    }

    //MIEJSCE W RANKINGU
    async miejsceWRankingu()
    {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/user_ranking',{ id_user: this.id_user, id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if(res === "You have not permission to get the data")
                {
                    resolve(404)
                    return
                }
                let mijesce = JSON.parse(JSON.stringify(res))
                if(mijesce === null)
                {
                    resolve(0)
                }
                else
                {
                    resolve(mijesce)
                }
            }, err => {
                resolve(0)
            });
        });
    }


    //USUWANIE MINISTRANTA
    async usunMinistranta(id_user: number) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/delete_user', { id_user: id_user, id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res === 'zakonczono') {
                    resolve(1);
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //USUWANIE KONTA MINISTRANTA
    async usunKontoMinistranta(id_user: number) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/delete_user_account_admin', { id_user: id_user,id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res === 'zakonczono') {
                    resolve(1);
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //ZMIANA HASŁA
    async zmienHaslo(aktualne_haslo: string, nowe_haslo: string) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/change_password', { aktualne_haslo: sha512.sha512.hmac('mSf', aktualne_haslo), nowe_haslo: sha512.sha512.hmac('mSf', nowe_haslo), id_user: this.id_user, id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res === 'zakonczono') {
                    resolve(1);
                }
                else if(res === 'niepoprawne')
                {
                    resolve(2);
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //USUWANIE KONTA USERA
    async usunKontoUsera(admin: number, haslo: string) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/delete_user_account', { id_user: this.id_user, id_parafii: this.id_parafii, admin: admin,
                 haslo: sha512.sha512.hmac('mSf', haslo), smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res === 'zakonczono') {
                    resolve(1);
                }
                else if(res === 'jeden')
                {
                    resolve(2)
                }
                else if(res === 'niepoprawne')
                {
                    resolve(3)
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //POBIERANIE WYDARZEŃ NA DANY DZIEŃ
    async pobierzWydarzeniaNaDanyDzien(dzien: number) {
        return new Promise<Array<Wydarzenie>>(resolve => {

            this.http.post(this.serverUrl + '/events',{ id_parafii: this.id_parafii, dzien: dzien,smart: this.smart , jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if(res === "You have not permission to get the data")
                {
                    resolve(null)
                    return
                }
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //POBIERANIE WSZYSTKICH WYDARZEŃ
    async pobierzWszystkieWydarzenia() {
        return new Promise<Array<Wydarzenie>>(resolve => {

            this.http.post(this.serverUrl + '/all_events',{ id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if(res === "You have not permission to get the data")
                {
                    resolve(JSON.parse(JSON.stringify(null)))
                    return
                }
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //DODAWANIE WYDARZENIA
    async dodajNoweWydarzenie(dzien_tygodnia: number, godzina: string) {

        let czas = new Date(godzina)

        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/new_event', { id_parafii: this.id_parafii, dzien_tygodnia: dzien_tygodnia,
                 godzina: new Date(2018, 10, 15, czas.getHours()+1, czas.getMinutes()), smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                console.log('Dodaj',res)
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else if (res.hasOwnProperty('code')) {
                    let code = JSON.parse(JSON.stringify(res));
                    if (code.code === 'ER_DUP_ENTRY') {
                        resolve(2);
                    }
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //USUWANIE WYDARZENIA
    async usunWydarzenie(id_wydarzenia: number) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/delete_event', { id_wydarzenia: id_wydarzenia, id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                console.log('Usuń',res)
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //AKTUALIZACJA WYDARZENIA
    async aktualizacjaWydarzenie(godzina: Date, id_wydarzenia: number) {
        return new Promise<number>(resolve => {
            let czas = new Date(godzina)

            this.http.post(this.serverUrl + '/edit_event', {godzina: new Date(2018, 10, 15, czas.getHours()+1, czas.getMinutes()),
                 id_wydarzenia: id_wydarzenia, id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                console.log('Aktualizuj',res)
                if (res === "zakonczono") {
                    resolve(1);
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //POBIERANIE DYŻURÓW DLA DANEGO MINISTRANTA
    async pobierzDyzuryDlaMinistranta(id_user: number) {
        return new Promise<Array<Wydarzenie>>(resolve => {

            this.http.post(this.serverUrl + '/user_duty',{ id_user: id_user, id_parafii: this.id_parafii , smart: this.smart, jwt: this.JWT }, { headers: this.headers }).subscribe(res => {
                if(res === "You have not permission to get the data")
                {
                    resolve(JSON.parse(JSON.stringify(null)))
                }
                else
                {
                    resolve(JSON.parse(JSON.stringify(res)))
                }
            });
        });
    }

    //POBIERANIE DYŻURÓW DO DANEGO WYDARZENIA
    async pobierzDyzuryDoWydarzenia(id_wydarzenia: number) {
        return new Promise<Array<User>>(resolve => {

            this.http.post(this.serverUrl + '/event_duty',{ id_wydarzenia: id_wydarzenia, id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if(res === "You have not permission to get the data")
                {
                    resolve(JSON.parse(JSON.stringify(null)))
                    return
                }
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //USUWANIE DYŻURU
    async usunDyzur(id_user: number, id_wydarzenia: number) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/delete_duty', { id_user: id_user, id_wydarzenia: id_wydarzenia, id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res === 'zakonczono') {
                    resolve(1);
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //DODAWANIE DYŻURU
    async dodajDyzur(id_user: number, id_wydarzenia: number) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/add_duty', { id_user: id_user, id_wydarzenia: id_wydarzenia, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //USUWANIE WSZYSTKICH DYŻURÓW
    async usunWszystkieDyzury() {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/reset_duty', { id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //POBIERANIE OBECNOSCI DO DANEGO WYDARZENIA
    async pobierzObecnosciDoWydarzenia(id_wydarzenia: number, data: Date) {
        return new Promise<Array<User>>(resolve => {
            let date = data
            date.setHours(2)

            this.http.post(this.serverUrl + '/presence',{ id_wydarzenia: id_wydarzenia, data: date.toJSON(),id_parafii: this.id_parafii, smart: this.smart , jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //AKTUALIZOWANIE ISTNIEJĄCEJ OBECNOŚCI
    async updateObecnosci(obecnosc: Obecnosc, punkty_dod_sluzba: number, punkty_uj_sluzba: number) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/update_presence', { id_obecnosci: obecnosc.id, status: obecnosc.status, punkty_dod_sluzba: punkty_dod_sluzba,
                 punkty_uj_sluzba: punkty_uj_sluzba, id_user: obecnosc.id_user, id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if(res === 'brak')
                {
                    resolve(0)
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else
                {
                    resolve(1)
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //DODAWANIE NOWEJ OBECNOŚCI
    async nowaObecnosc(obecnosc: Obecnosc, punkty_dod_sluzba: number, punkty_uj_sluzba: number) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/add_presence', { id_wydarzenia: obecnosc.id_wydarzenia, id_user: obecnosc.id_user,
                data: obecnosc.data, status: obecnosc.status, punkty_dod_sluzba: punkty_dod_sluzba, punkty_uj_sluzba: punkty_uj_sluzba, id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT }, { headers: this.headers }).subscribe(res => {
                resolve(1)
            }, err => {
                resolve(0)
            });
        });
    }

    //POBIERANIE WIADOMOŚCI
    async pobierzWidaomosci(do_opiekuna: number) {
        return new Promise<Array<Wiadomosc>>(resolve => {

            this.http.post(this.serverUrl + '/messages',{ id_parafii: this.id_parafii, do_opiekuna: do_opiekuna, smart: this.smart , jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if(res === "You have not permission to get the data")
                {
                    resolve(JSON.parse(JSON.stringify(null)))
                }
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //WYSYŁANIE WIADOMOŚCI
    async wyslijWidaomosc(tresc: string) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/new_message', { autor_id: this.id_parafii, odbiorca_id: this.id_parafii, tresc: tresc, linkobrazu: null, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //USUWANIE WIADOMOŚCI
    async usunWiadomosc(id_wiadomosci: number) {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/delete_message', { id_wiadomosci: id_wiadomosci, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //WYZEREUJ PUNKTY
    async wyzerujPunkty() {
        return new Promise<number>(resolve => {

            this.http.post(this.serverUrl + '/reset_points', {id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1)
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }

    //AKTUALIZACJA PUNKTÓW
    async aktualizacjaPunktow(punkty_dod_sluzba: number, punkty_uj_sluzba: number) {
        return new Promise<any>(resolve => {

            this.http.post(this.serverUrl + '/update_points', { punkty_dod_sluzba: punkty_dod_sluzba, punkty_uj_sluzba: punkty_uj_sluzba, id_parafii: this.id_parafii, smart: this.smart, jwt: this.JWT}, { headers: this.headers }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    this.pobierzParafie().then(res => {
                        resolve(res)
                    })
                }
                else if(res === "You have not permission to get the data")
                {
                    resolve(404)
                }
                else {
                    resolve(0);
                }
            }, err => {
                resolve(0)
            });
        });
    }
}
