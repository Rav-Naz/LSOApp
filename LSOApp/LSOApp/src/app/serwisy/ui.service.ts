import { Injectable, ViewContainerRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {

    private _rootVCRef: ViewContainerRef;

    private listaLadowania = [
        true, // dyzury
        true, // ministranci
        true, // wiadomosci
        true, // edytuj-wydarzenia
        false, // menu
        true, //ministrant-szczegoly
        true, //edytuj-dyzury
    ]

    zmienStan(index:number, stan: boolean)
    {
        this.listaLadowania[index] = stan;
    }

    get ladowane()
    {
       return this.listaLadowania
    }

    setRootVCRef(vcRef: ViewContainerRef)
    {
        this._rootVCRef = vcRef;
    }

    getRootVCRef()
    {
        return this._rootVCRef;
    }
}
