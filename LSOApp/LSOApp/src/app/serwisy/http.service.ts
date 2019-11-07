import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as sha512 from 'js-sha512';
import { User } from './user.model';
import { Wydarzenie } from './wydarzenie.model';
import { Obecnosc } from './obecnosc.model';
import { Stopien } from './stopien.model';
import { Wiadomosc } from './wiadomosci.model';
import { Parafia } from './parafia.model';
import { ParafiaService } from './parafia.service';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    constructor(private http: HttpClient) { }

    private serverUrl = "https://lsoapp.smarthost.pl/baza"


    //UTWORZENIE NOWEJ PARAFII
    async rejestracja(nazwa_parafii: string, id_diecezji: number, miasto: string, id_typu: number, stopien: number, imie: string, nazwisko: string, email: string, haslo: string) {

        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ nazwa_parafii: nazwa_parafii, id_diecezji: id_diecezji, miasto: miasto, id_typu: id_typu, stopien: stopien, imie: imie, nazwisko: nazwisko, email: email, haslo: sha512.sha512.hmac('mSf', haslo) }))
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
                }
                else if (res === 'istnieje'){
                    resolve(2);
                }
                else {
                    resolve(0);
                }
            });
        });
    }

    //POBIERANIE DANCYH PARAFII
    async pobierzParafie(id_parafii: number) {
        return new Promise<string>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_parafii: id_parafii }))
            });

            this.http.get(this.serverUrl + '/parish', { headers: options }).subscribe(res => {
                resolve(JSON.parse(JSON.stringify(res)))
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

    //POBIERANIE MINISTRANTÓW
    async pobierzMinistrantow(id_parafii: number) {
        return new Promise<Array<User>>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_parafii: id_parafii }))
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
                "data": encodeURI(JSON.stringify({id_diecezji: 2, id_parafii: 2, stopien: stopien, imie: imie, nazwisko: nazwisko, email: email}))
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

      //USUWANIE MINISTRANTA
      async usunMinistranta(id_user: number) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({id_user: id_user}))
            });

            this.http.post(this.serverUrl + '/delete_user', null, { headers: options }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    resolve(1);
                }
                else {
                    resolve(0);
                }
            });
        });
    }

    //POBIERANIE WYDARZEŃ NA DANY DZIEŃ
    async pobierzWydarzeniaNaDanyDzien(dzien: number, id_parafii: number) {
        return new Promise<Array<Wydarzenie>>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_parafii: id_parafii, dzien: dzien }))
            });

            this.http.get(this.serverUrl + '/events', { headers: options }).subscribe(res => {
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //DODAWANIE WYDARZENIA
    async dodajNoweWydarzenie(id_parafii: number, dzien_tygodnia: number, godzina: Date) {

        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_parafii: id_parafii, dzien_tygodnia: dzien_tygodnia, godzina: new Date(2018, 10, 15, godzina.getHours(), godzina.getMinutes()) }))
            });

            this.http.post(this.serverUrl + '/new_event', null, { headers: options }).subscribe(res => {
                console.log(res)
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

    //POBIERANIE OBECNOSCI DO DANEGO WYDARZENIA
    async pobierzObecnosciDoWydarzenia(id_wydarzenia:number, data: Date) {
        return new Promise<Array<User>>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_wydarzenia: id_wydarzenia, data: data }))
            });

            this.http.get(this.serverUrl + '/presence', { headers: options }).subscribe(res => {
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //AKTUALIZOWANIE ISTNIEJĄCEJ OBECNOŚCI
    async updateObecnosci(obecnosc: Obecnosc) {
        return new Promise<void>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_obecnosci: obecnosc.id, status: obecnosc.status}))
            });

            console.log('aktualizacja')

            this.http.post(this.serverUrl + '/update_presence', null, { headers: options }).subscribe(res => {
                console.log(res)
                resolve()
            });
        });
    }

    //DODAWANIE NOWEJ OBECNOŚCI
    async nowaObecnosc(obecnosc: Obecnosc) {
        return new Promise<void>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({id_wydarzenia: obecnosc.id_wydarzenia, id_user: obecnosc.id_user, data: obecnosc.data, status: obecnosc.status}))
            });

            console.log('dodawanie')

            this.http.post(this.serverUrl + '/add_presence', null, { headers: options }).subscribe(res => {
                console.log(res)
                resolve()
            });
        });
    }

    //POBIERANIE WIADOMOŚCI
    async pobierzWidaomosci(id_parafii: number, do_opiekuna: number) {
        return new Promise<Array<Wiadomosc>>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ id_parafii: id_parafii, do_opiekuna: do_opiekuna }))
            });

            this.http.get(this.serverUrl + '/messages', { headers: options }).subscribe(res => {
                resolve(JSON.parse(JSON.stringify(res)))
            });
        });
    }

    //WYSYŁANIE WIADOMOŚCI
    async wyslijWidaomosc(id_parafii: number, tresc: string) {
        return new Promise<number>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ autor_id: id_parafii, odbiorca_id: id_parafii, tresc: tresc, linkobrazu: null}))
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
                "data": encodeURI(JSON.stringify({ id_wiadomosci: id_wiadomosci}))
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
    async aktualizacjaPunktow(id_parafii: number, punkty_dod_sluzba: number, punkty_uj_sluzba: number) {
        return new Promise<any>(resolve => {
            let options = new HttpHeaders({
                "Content-Type": "application/json",
                "data": encodeURI(JSON.stringify({ punkty_dod_sluzba: punkty_dod_sluzba, punkty_uj_sluzba: punkty_uj_sluzba, id_parafii: id_parafii}))
            });

            this.http.post(this.serverUrl + '/update_points', null, { headers: options }).subscribe(res => {
                if (res.hasOwnProperty('insertId')) {
                    this.pobierzParafie(id_parafii).then(res => {
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
