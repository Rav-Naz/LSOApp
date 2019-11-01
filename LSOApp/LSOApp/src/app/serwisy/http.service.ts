import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as sha512 from 'js-sha512';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  private serverUrl = "https://lsoapp.smarthost.pl/baza"


  //DO UTWORZENIA NOWEJ PARAFII
  async rejestracja(nazwa_parafii:string, id_diecezji:number, miasto:string, id_typu:number, email:string, haslo:string){

    return new Promise<number>(resolve => {
    let options = new HttpHeaders({
        "Content-Type": "application/json",
        "data": encodeURI(JSON.stringify({ nazwa_parafii: nazwa_parafii, id_diecezji: id_diecezji, miasto: miasto, id_typu: id_typu, email: email, haslo: sha512.sha512.hmac('mSf', haslo)}))
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
              else {
                resolve(0);
              }
          });
      });
  }
}
