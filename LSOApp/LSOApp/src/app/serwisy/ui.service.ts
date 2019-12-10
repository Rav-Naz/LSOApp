import { Injectable, ViewContainerRef } from '@angular/core';
import { Feedback, FeedbackType } from "nativescript-feedback";
import { isIOS, Color } from 'tns-core-modules/ui/page/page';

@Injectable({
  providedIn: 'root'
})
export class UiService {

    constructor(){
        this.feedback = new Feedback();
    }

    private feedback: Feedback;

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

    showFeedback(typ: 'succes' | 'warning' | 'error', tresc: string, czas: number)
    {
        this.feedback.show({
            title: typ === 'succes'? 'Sukces!' : typ === 'warning'? 'Uwaga!' : 'Błąd!',
            message: tresc,
            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
            duration: czas*1000,
            backgroundColor: typ === 'succes'?  new Color(255,49, 155, 49) : typ === 'warning'?  new Color(255, 255, 207, 51) :  new Color("#e71e25"),
            type: typ === 'succes'? FeedbackType.Success : typ === 'warning'? FeedbackType.Warning : FeedbackType.Error,

        });
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
