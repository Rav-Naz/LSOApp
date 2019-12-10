import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { UserService } from '~/app/serwisy/user.service';
import { User } from '~/app/serwisy/user.model';
import { Wydarzenie } from '~/app/serwisy/wydarzenie.model';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { SecureStorage } from "nativescript-secure-storage";
import { Subscription } from 'rxjs';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { UiService } from '~/app/serwisy/ui.service';

@Component({
    selector: 'ns-dyzury',
    templateUrl: './dyzury.component.html',
    styleUrls: ['./dyzury.component.css'],
    moduleId: module.id,
})
export class DyzuryComponent implements OnInit {

    user: User;
    userSub: Subscription;
    dzis: number = 0;
    stareDyzury: Array<Wydarzenie> = []; // zapisywane w pamięci urządzenia
    dyzury: Array<Wydarzenie> = [];
    dyzurySub: Subscription;
    powiadomieniaSub: Subscription;
    rowDzis = [0, 2, 4, 6, 8, 10, 12]
    rowPasy = [1, 3, 5, 7, 9, 11]
    dni = ['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota']

    constructor(private page: Page, private userService: UserService, private ui: UiService)
    {}

    ngOnInit() {
        this.dzis = this.rowDzis[new Date().getDay()];
        this.page.actionBarHidden = true;

        this.userSub = this.userService.UserSub.subscribe(user => {
            this.user = user;
        });



        let secureStorage = new SecureStorage;
        secureStorage.clearAllOnFirstRun();
        this.stareDyzury = [];

        this.userService.mojeDyzury(this.user.id_user);

        // if(dyzury !== undefined)
        // {
        //     this.userService.setUserDyzury(dyzury);
        // }
        // else
        // {
        //     this.userService.setUserDyzury([]);
        // }

        this.dyzurySub = this.userService.UserDyzurySub.subscribe(dyzury => {
            // let dyzuryLista = [];

            if (dyzury !== undefined && dyzury !== null) {

                // dyzury.forEach(dyzur => {
                //     dyzuryLista.push(dyzur);
                // })

                if (dyzury.length === 0) {
                    return;
                }

                this.dyzury = dyzury

                // dyzuryLista.forEach(dyzur => {
                //     let wydarzenie = this.wydarzeniaService.wybraneWydarzenie(dyzur.id_wydarzenia);
                //     if (wydarzenie !== undefined) {
                //         this.dyzury.push(wydarzenie);
                //     }
                // })

                // this.powiadomieniaSub = this.userService.UserDyuzryPowiadomienia.subscribe(wartosc => {
                //     secureStorage.get({ key: "stareDyzury" }).then((stare) => {
                //         if (stare !== null) {
                //             this.stareDyzury = JSON.parse(stare);
                //         }
                //     }).then(() => {
                //         if (wartosc === true) {
                //             this.spojnoscList(this.stareDyzury, this.dyzury).then((bool) => {
                //                 if (bool === false) // Przypisywanie dyżurów
                //                 {
                //                     secureStorage.set({ key: "stareDyzury", value: JSON.stringify(this.dyzury) }).then((udaloSie) => {
                //                         if (udaloSie) {

                //                             LocalNotifications.cancelAll();

                //                             for (let i = 0; i < 7; i++) {
                //                                 let dyzur = this.dyzury.filter(dyzur => dyzur.dzien_tygodnia === i)[0];
                //                                 if (dyzur !== undefined) {
                //                                     let data = this.nastepnyDzienTygodnia(i);
                //                                     let dyzurGodzina = new Date(dyzur.godzina);
                //                                     data.setHours(dyzurGodzina.getHours() - 1); //minus 1 bo w JSON nasza godzina jest +1
                //                                     data.setMinutes(dyzurGodzina.getMinutes());
                //                                     data.setSeconds(0);

                //                                     this.zaplanujPowiadomienieOMszy(data, i);
                //                                 }
                //                             }

                //                             this.feedback.show({
                //                                 title: "Uwaga!",
                //                                 message: "Powiadomienia zaczną funkcjonować od następnego dnia dyżurnego",
                //                                 titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                //                                 messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                //                                 duration: 3000,
                //                                 backgroundColor: new Color(255,255, 207, 51),
                //                                 type: FeedbackType.Warning,

                //                               });
                //                         }
                //                     })
                //                 }
                //             })
                //         }
                //         else {
                //             if (this.stareDyzury.length > 0) {
                //                 this.stareDyzury = [];
                //                 secureStorage.set({ key: "stareDyzury", value: JSON.stringify(this.stareDyzury) })
                //                 // console.log("Usuwanie dyżurów")
                //                 LocalNotifications.cancelAll();
                //                 this.feedback.show({
                //                     title: "Uwaga!",
                //                     message: "Powiadomienia wyłączone",
                //                     titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                //                     messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                //                     duration: 2000,
                //                     backgroundColor: new Color(255,255, 207, 51),
                //                     type: FeedbackType.Warning,

                //                   });
                //             }
                //         }
                //     })
                // })
            }
        })
    }

    // private spojnoscList(staraLista: Array<Wydarzenie>, nowaLista: Array<Wydarzenie>) {
    //     return new Promise<boolean>((resolve) => {
    //         let spojne: boolean = true;
    //         nowaLista.forEach(element => {
    //             let index = staraLista.filter(stara => stara.id === element.id)[0];
    //             if (index === undefined) {
    //                 spojne = false;
    //             }
    //         })
    //         staraLista.forEach(element => {
    //             let index = nowaLista.filter(nowa => nowa.id === element.id)[0];
    //             if (index === undefined) {
    //                 spojne = false;
    //             }
    //         })
    //         resolve(spojne);
    //     })
    // }

    GodzinaDyzuruNaDanyDzien(dzien: Wydarzenie) {
        return new Date(dzien.godzina).toString().slice(16,21)
        // let lista = this.dyzury.filter((dyzur) => dyzur.dzien_tygodnia === dzien);
        // console.log(lista)
        // if (lista === []) {
        //     return '';
        // }
        // else {
        //     return new Date(lista[0].godzina).toString();
        // }
    }

    // kierunki: 1 (z lewej w prawo), 2 (z prawej w lewo), 4 (z dołu do góry), 8 (z góry do dołu)

    // private nastepnyDzienTygodnia(index: number) {
    //     let dzis = new Date();
    //     dzis.setDate(dzis.getDate() + (index - 1 - dzis.getDay() + 7) % 7 + 1);
    //     return dzis;
    // }


    // private zaplanujPowiadomienieOMszy(data: Date, index: number) {
    //     let dyzur = data.toString().slice(16, 21);
    //     data.setHours(data.getHours() - 1)
    //     LocalNotifications.schedule([{
    //         id: index, // generated id if not set
    //         title: 'Przypomnienie o służbie',
    //         body: 'Msza Święta. Dziś, godz. ' + dyzur + '. KnC!',
    //         badge: 1,
    //         color: new Color("#e71e25"),
    //         // icon: 'res://icon',
    //         // image: "https://cdn-images-1.medium.com/max/1200/1*c3cQvYJrVezv_Az0CoDcbA.jpeg",
    //         // thumbnail: true,
    //         interval: 'week',
    //         channel: 'Przypomnienia o służbie', // default: 'Channel'
    //         sound: "customsound-ios.wav", // falls back to the default sound on Android
    //         forceShowWhenInForeground: true,
    //         notificationLed: true,
    //         at: data
    //     }])
    // }
}
