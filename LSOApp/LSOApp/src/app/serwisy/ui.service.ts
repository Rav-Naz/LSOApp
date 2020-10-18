import { WyborModalComponent } from './../shared/modale/wybor-modal/wybor-modal.component';
import { Injectable, ViewContainerRef } from '@angular/core';
import { Feedback, FeedbackType } from "nativescript-feedback";
import { isIOS, Color } from 'tns-core-modules/ui/page/page';
import { ModalDialogService } from 'nativescript-angular/common';
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';

@Injectable({
  providedIn: 'root'
})
export class UiService {

    constructor( private modal: ModalDialogService){
        this.feedback = new Feedback();
    }

    private feedback: Feedback;

    private _rootVCRef: ViewContainerRef;

    private potwierdznieModal: PotwierdzenieModalComponent;
    private wyborModal: WyborModalComponent;

    private listaLadowania = [
        true, // dyzury
        true, // ministranci
        true, // wiadomosci-o
        true, // edytuj-wydarzenia
        false, // menu
        true, //ministrant-szczegoly
        true, //edytuj-dyzury
        true //wiadomosci-m
    ]

    zmienStan(index:number, stan: boolean)
    {
        this.listaLadowania[index] = stan;
    }

    showFeedback(typ: 'succes' | 'warning' | 'error' | 'loading', tresc: string, czas: number)
    {
        this.feedback.show({
            title: typ === 'succes'? 'Sukces!' : typ === 'warning'? 'Uwaga!' : typ === 'error' ? 'Błąd!' : 'Ładowanie...',
            message: tresc,
            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
            duration: czas*1000,
            backgroundColor: typ === 'succes'?  new Color(255,49, 155, 49) : typ === 'warning'?  new Color(255, 255, 207, 51) : typ === 'error' ?  new Color("#e71e25") : new Color('#4d9cf4'),
            type: typ === 'succes'? FeedbackType.Success : typ === 'warning'? FeedbackType.Warning : typ === 'error'? FeedbackType.Error : null,

        });
    }

    hideFeedback()
    {
        this.feedback.hide()
    }

    pokazModalWyboru(context: string)
    {
        return new Promise<boolean>((resolve) => {
                this.potwierdznieModal.awaitToDecision(context).then((wybor) => {
                    resolve(wybor);
                })
            })
    }

    pokazModalListy(lista: Array<string>)
    {
        return new Promise<number>((resolve) => {
                this.wyborModal.awaitToDecision(lista).then((wybor) => {
                    resolve(wybor);
                })
            })
    }

    sesjaWygasla()
    {
        this.showFeedback('error',"Twoja sesja wygasła. Zaloguj się ponownie", 5);
    }

    get ladowane()
    {
       return this.listaLadowania
    }

    setConfirmComponent(component: PotwierdzenieModalComponent)
    {
        this.potwierdznieModal = component;
    }

    setChooseComponent(component: WyborModalComponent)
    {
        this.wyborModal = component;
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
