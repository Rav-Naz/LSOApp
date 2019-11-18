import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as sha512 from 'js-sha512';
import { User } from './user.model';
import { Wydarzenie } from './wydarzenie.model';
import { Obecnosc } from './obecnosc.model';
import { Stopien } from './stopien.model';
import { Wiadomosc } from './wiadomosci.model';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    constructor(private http: HttpClient) { }

    private id_parafii: number = null;
    private id_user: number = null;

    private serverUrl = "https://lsoapp.smarthost.pl/baza"


    nadajId_Parafii(id_parafii: number)
    {
        this.id_parafii = id_parafii;
    }
    nadajId_User(id_user: number)
    {
        this.id_user = id_user;
    }

    wyczysc()
    {
        this.id_parafii = null;
        this.id_user = null;
    }


    //LOGOWANIE
    async logowanie(email: string, haslo: string) {
        return new Promise<string>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ email: email, haslo: sha512.sha512.hmac('mSf', haslo) }))
            });

            this.http.get(this.serverUrl + '/login', { headers: options }).subscribe(res => {
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
                else if(res.hasOwnProperty('id_parafii'))
                {
                    resolve(JSON.parse(JSON.stringify(res)))
                }
                else
                {
                    resolve('blad')
                }
            });
        });
    }

    //AKTYWACJA USERA
    async aktywacjaUsera(email: string, kod_aktywacyjny: string, haslo: string) {
        return new Promise<string>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ email: email, kod_aktywacyjny: kod_aktywacyjny, haslo: sha512.sha512.hmac('mSf', haslo) }))
            });

            this.http.post(this.serverUrl + '/activate', null , { headers: options }).subscribe(res => {
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
            });
        });
    }

    //UTWORZENIE NOWEJ PARAFII
    async rejestracja(nazwa_parafii: string, id_diecezji: number, miasto: string, id_typu: number, stopien: number, imie: string, nazwisko: string, email: string) {

        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ nazwa_parafii: nazwa_parafii, id_diecezji: id_diecezji, miasto: miasto, id_typu: id_typu, stopien: stopien, imie: imie, nazwisko: nazwisko, email: email /*,haslo: sha512.sha512.hmac('mSf', haslo) */}))
            });

            this.http.post(this.serverUrl + '/register', null, { headers: options }).subscribe(res => {
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
                else {
                    resolve(0);
                }
            });
        });
    }

    //USUWANIE PARAFII
    async usuwanieParafii(haslo: string) {


        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({id_user: this.id_user, id_parafii: this.id_parafii, haslo: sha512.sha512.hmac('mSf', haslo) }))
            });

            this.http.post(this.serverUrl + '/delete_parish', null, { headers: options }).subscribe(res => {

                if (res === "zakonczono") {
                    resolve(1);
                }
                else if(res === "niepoprawne") {
                    resolve(2)
                }
                else if(res === "nieistnieje") {
                    resolve(3)
                }
                else {
                    resolve(0);
                }
            });
        });
    }

    //POBIERANIE DANCYH PARAFII
    async pobierzParafie() {
        return new Promise<string>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_parafii: this.id_parafii }))
            });

            this.http.get(this.serverUrl + '/parish', { headers: options }).subscribe(res => {
                if(res.hasOwnProperty('id_parafii'))
                {
                    resolve(JSON.parse(JSON.stringify(res)))
                }
                else
                {
                    resolve('blad')
                }
            });
        });
    }


    //PRZYPOMNIENIE HASŁA
    async przypomnij(email: string) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ email: email }))
            });

            this.http.post(this.serverUrl + '/remind', null, { headers: options }).subscribe(res => {
                let response = JSON.parse(JSON.stringify(res))
                resolve(response.changedRows)
            });
        });
    }

    //POBIERANIE MINISTRANTÓW
    async pobierzMinistrantow() {
        return new Promise<Array<User>>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_parafii: this.id_parafii }))
            });

            this.http.get(this.serverUrl + '/ministranci', { headers: options }).subscribe(res => {
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //DODAWANIE NOWEGO MINISTRANTA
    async nowyMinistrant(stopien: Stopien, imie: string, nazwisko: string, email: string) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({id_parafii: this.id_parafii, stopien: stopien, imie: imie, nazwisko: nazwisko, email: email }))
            });

            this.http.post(this.serverUrl + '/new_user', null, { headers: options }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
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
            });
        });
    }

    //AKTYWACJA MINISTRANTA
    async aktywacjaMinistranta(email: string, id_user: number) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({email: email, id_user: id_user}))
            });

            this.http.post(this.serverUrl + '/activate_user', null, { headers: options }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
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
            });
        });
    }

    //AKTUALIZACJA MINISTRANTA
    async aktualizacjaMinistranta(ministrant: User) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({stopien: ministrant.stopien, punkty: ministrant.punkty, id_user: ministrant.id_user}))
            });

            this.http.post(this.serverUrl + '/user_update', null, { headers: options }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else {
                    resolve(0);
                }
            });
        });
    }

    //POBIERANIE DANYCH O MINISTRANCIE
    async pobierzMinistranta(id_user: number) {
        return new Promise<User>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_user: id_user }))
            });

            this.http.get(this.serverUrl + '/ministrant', { headers: options }).subscribe(res => {
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //MIEJSCE W RANKINGU

    async miejsceWRankingu()
    {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_user: this.id_user, id_parafii: this.id_parafii}))
            });

            this.http.get(this.serverUrl + '/user_ranking', { headers: options }).subscribe(res => {
                let mijesce = JSON.parse(JSON.stringify(res))
                if(mijesce === null)
                {
                    resolve(0)
                }
                else
                {
                    resolve(mijesce)
                }
            });
        });
    }


    //USUWANIE MINISTRANTA
    async usunMinistranta(id_user: number) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_user: id_user }))
            });

            this.http.post(this.serverUrl + '/delete_user', null, { headers: options }).subscribe(res => {
                if (res === 'zakonczono') {
                    resolve(1);
                }
                else {
                    resolve(0);
                }
            });
        });
    }

    //POBIERANIE WYDARZEŃ NA DANY DZIEŃ
    async pobierzWydarzeniaNaDanyDzien(dzien: number) {
        return new Promise<Array<Wydarzenie>>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_parafii: this.id_parafii, dzien: dzien }))
            });

            this.http.get(this.serverUrl + '/events', { headers: options }).subscribe(res => {
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //POBIERANIE WSZYSTKICH WYDARZEŃ
    async pobierzWszystkieWydarzenia() {
        return new Promise<Array<Wydarzenie>>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_parafii: this.id_parafii}))
            });

            this.http.get(this.serverUrl + '/all_events', { headers: options }).subscribe(res => {
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //DODAWANIE WYDARZENIA
    async dodajNoweWydarzenie(dzien_tygodnia: number, godzina: string) {

        let czas = new Date(godzina)

        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_parafii: this.id_parafii, dzien_tygodnia: dzien_tygodnia, godzina: new Date(2018, 10, 15, czas.getHours()+1, czas.getMinutes()) }))
            });

            this.http.post(this.serverUrl + '/new_event', null, { headers: options }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
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
            });
        });
    }

    //USUWANIE WYDARZENIA
    async usunWydarzenie(id_wydarzenia: number) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_wydarzenia: id_wydarzenia }))
            });

            this.http.post(this.serverUrl + '/delete_event', null, { headers: options }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else {
                    resolve(0);
                }
            });
        });
    }

    //POBIERANIE DYŻURÓW DLA DANEGO MINISTRANTA
    async pobierzDyzuryDlaMinistranta(id_user: number) {
        return new Promise<Array<Wydarzenie>>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_user: id_user }))
            });

            this.http.get(this.serverUrl + '/user_duty', { headers: options }).subscribe(res => {
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //POBIERANIE DYŻURÓW DO DANEGO WYDARZENIA
    async pobierzDyzuryDoWydarzenia(id_wydarzenia: number) {
        return new Promise<Array<User>>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_wydarzenia: id_wydarzenia }))
            });

            this.http.get(this.serverUrl + '/event_duty', { headers: options }).subscribe(res => {
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //USUWANIE DYŻURU
    async usunDyzur(id_user: number, id_wydarzenia: number) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_user: id_user, id_wydarzenia: id_wydarzenia }))
            });

            this.http.post(this.serverUrl + '/delete_duty', null, { headers: options }).subscribe(res => {
                if (res === 'zakonczono') {
                    resolve(1);
                }
                else {
                    resolve(0);
                }
            });
        });
    }

    //DODAWANIE DYŻURU
    async dodajDyzur(id_user: number, id_wydarzenia: number) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_user: id_user, id_wydarzenia: id_wydarzenia }))
            });

            this.http.post(this.serverUrl + '/add_duty', null, { headers: options }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else {
                    resolve(0);
                }
            });
        });
    }

    //POBIERANIE OBECNOSCI DO DANEGO WYDARZENIA
    async pobierzObecnosciDoWydarzenia(id_wydarzenia: number, data: Date) {
        return new Promise<Array<User>>(resolve => {
            let date = data
            date.setHours(2)
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_wydarzenia: id_wydarzenia, data: date.toJSON() }))
            });

            this.http.get(this.serverUrl + '/presence', { headers: options }).subscribe(res => {

                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //AKTUALIZOWANIE ISTNIEJĄCEJ OBECNOŚCI
    async updateObecnosci(obecnosc: Obecnosc, punkty_dod_sluzba: number, punkty_uj_sluzba: number) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_obecnosci: obecnosc.id, status: obecnosc.status, punkty_dod_sluzba: punkty_dod_sluzba, punkty_uj_sluzba: punkty_uj_sluzba, id_user: obecnosc.id_user }))
            });

            this.http.post(this.serverUrl + '/update_presence', null, { headers: options }).subscribe(res => {
                // console.log(res)
                if(res === 'brak')
                {
                    resolve(0)
                }
                else
                {
                    resolve(1)
                }
            });
        });
    }

    //DODAWANIE NOWEJ OBECNOŚCI
    async nowaObecnosc(obecnosc: Obecnosc, punkty_dod_sluzba: number, punkty_uj_sluzba: number) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_wydarzenia: obecnosc.id_wydarzenia, id_user: obecnosc.id_user,
                data: obecnosc.data, status: obecnosc.status, punkty_dod_sluzba: punkty_dod_sluzba, punkty_uj_sluzba: punkty_uj_sluzba }))
            });


            this.http.post(this.serverUrl + '/add_presence', null, { headers: options }).subscribe(res => {
                resolve(1)
            });
        });
    }

    //POBIERANIE WIADOMOŚCI
    async pobierzWidaomosci(do_opiekuna: number) {
        return new Promise<Array<Wiadomosc>>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_parafii: this.id_parafii, do_opiekuna: do_opiekuna }))
            });

            this.http.get(this.serverUrl + '/messages', { headers: options }).subscribe(res => {
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //WYSYŁANIE WIADOMOŚCI
    async wyslijWidaomosc(tresc: string) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ autor_id: this.id_parafii, odbiorca_id: this.id_parafii, tresc: tresc, linkobrazu: null }))
            });

            this.http.post(this.serverUrl + '/new_message', null, { headers: options }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else {
                    resolve(0);
                }
            });
        });
    }

    //USUWANIE WIADOMOŚCI
    async usunWiadomosc(id_wiadomosci: number) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_wiadomosci: id_wiadomosci }))
            });

            this.http.post(this.serverUrl + '/delete_message', null, { headers: options }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else {
                    resolve(0);
                }
            });
        });
    }

    //AKTUALIZACJA PUNKTÓW
    async aktualizacjaPunktow(punkty_dod_sluzba: number, punkty_uj_sluzba: number) {
        return new Promise<any>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ punkty_dod_sluzba: punkty_dod_sluzba, punkty_uj_sluzba: punkty_uj_sluzba, id_parafii: this.id_parafii }))
            });

            this.http.post(this.serverUrl + '/update_points', null, { headers: options }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    this.pobierzParafie().then(res => {
                        resolve(res)
                    })
                }
                else {
                    resolve(0);
                }
            });
        });
    }
}
