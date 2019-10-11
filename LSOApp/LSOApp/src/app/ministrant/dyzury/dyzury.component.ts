import { Component, OnInit } from '@angular/core';
import { Page, Color, isIOS } from 'tns-core-modules/ui/page/page';
import { UserService } from '~/app/serwisy/user.service';
import { User } from '~/app/serwisy/user.model';
import { Wydarzenie } from '~/app/serwisy/wydarzenie.model';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { LocalNotifications } from "nativescript-local-notifications";
import { SecureStorage } from "nativescript-secure-storage";
import { Subscription } from 'rxjs';
import { Feedback, FeedbackType} from "nativescript-feedback";

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
    rowDzis = [12, 0, 2, 4, 6, 8, 10]
    private feedback: Feedback;

    constructor(private page: Page, private userService: UserService, private indexService: TabindexService, private wydarzeniaService: WydarzeniaService)
    {
        this.feedback = new Feedback();
    }

    ngOnInit() {
        this.dzis = this.rowDzis[new Date().getDay()];
        this.page.actionBarHidden = true;
        this.userSub = this.userService.UserSub.subscribe(user => {
            this.user = user;
        });

        let secureStorage = new SecureStorage;
        secureStorage.clearAllOnFirstRun();
        this.stareDyzury = [];
        this.dyzurySub = this.userService.UserDyzurySub.subscribe(dyzury => {
            if (dyzury !== null && dyzury !== undefined && dyzury !== []) {
                let dyzuryLista = [];
                dyzury.forEach(dyzur => {
                    dyzuryLista.push(dyzur);
                })

                if (dyzuryLista === undefined || dyzuryLista.length === 0) {
                    return;
                }

                dyzuryLista.forEach(dyzur => {
                    let wydarzenie = this.wydarzeniaService.wybraneWydarzenie(dyzur.id_wydarzenia);
                    if (wydarzenie !== undefined) {
                        this.dyzury.push(wydarzenie);
                    }
                })

                this.powiadomieniaSub = this.userService.UserDyuzryPowiadomienia.subscribe(wartosc => {
                    secureStorage.get({ key: "stareDyzury" }).then((stare) => {
                        if (stare !== null) {
                            this.stareDyzury = JSON.parse(stare);
                        }
                    }).then(() => {
                        if (wartosc === true) {
                            this.spojnoscList(this.stareDyzury, this.dyzury).then((bool) => {
                                if (bool === false) // Przypisywanie dyżurów
                                {
                                    secureStorage.set({ key: "stareDyzury", value: JSON.stringify(this.dyzury) }).then((udaloSie) => {
                                        if (udaloSie) {

                                            LocalNotifications.cancelAll();

                                            for (let i = 0; i < 7; i++) {
                                                let dyzur = this.dyzury.filter(dyzur => dyzur.dzien_tygodnia === i)[0];
                                                if (dyzur !== undefined) {
                                                    let data = this.nastepnyDzienTygodnia(i);
                                                    data.setHours(new Date(dyzur.godzina).getHours());
                                                    data.setMinutes(new Date(dyzur.godzina).getMinutes());
                                                    data.setSeconds(0);

                                                    this.zaplanujPowiadomienieOMszy(data, i);
                                                }
                                            }

                                            this.feedback.show({
                                                title: "Uwaga!",
                                                message: "Powiadomienia zaczną funkcjonować od następnego dnia dyżurnego",
                                                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                                                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                                                duration: 3000,
                                                backgroundColor: new Color(255,255, 207, 51),
                                                type: FeedbackType.Warning,

                                              });
                                        }
                                    })
                                }
                            })
                        }
                        else {
                            if (this.stareDyzury.length > 0) {
                                this.stareDyzury = [];
                                secureStorage.set({ key: "stareDyzury", value: JSON.stringify(this.stareDyzury) })
                                // console.log("Usuwanie dyżurów")
                                LocalNotifications.cancelAll();
                                this.feedback.show({
                                    title: "Uwaga!",
                                    message: "Powiadomienia wyłączone",
                                    titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                                    messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                                    duration: 2000,
                                    backgroundColor: new Color(255,255, 207, 51),
                                    type: FeedbackType.Warning,

                                  });
                            }
                        }
                    })
                })
            }
        })
    }

    private spojnoscList(staraLista: Array<Wydarzenie>, nowaLista: Array<Wydarzenie>) {
        return new Promise<boolean>((resolve) => {
            let spojne: boolean = true;
            nowaLista.forEach(element => {
                let index = staraLista.filter(stara => stara.id === element.id)[0];
                if (index === undefined) {
                    spojne = false;
                }
            })
            staraLista.forEach(element => {
                let index = nowaLista.filter(nowa => nowa.id === element.id)[0];
                if (index === undefined) {
                    spojne = false;
                }
            })
            resolve(spojne);
        })
    }

    dyzurNaDanyDzien(dzien: number) {
        let lista = this.dyzury.filter((dyzur) => dyzur.dzien_tygodnia === dzien);
        if (lista === undefined) {
            return [];
        }
        else {
            return lista;
        }
    }

    // kierunki: 1 (z lewej w prawo), 2 (z prawej w lewo), 4 (z dołu do góry), 8 (z góry do dołu)

    onSwipe(args: SwipeGestureEventData) {
        if (args.direction === 2) {
            this.indexService.nowyIndex(1);
        }
    }

    private nastepnyDzienTygodnia(index: number) {
        let dzis = new Date();
        dzis.setDate(dzis.getDate() + (index - 1 - dzis.getDay() + 7) % 7 + 1);
        return dzis;
    }


    private zaplanujPowiadomienieOMszy(data: Date, index: number) {
        let dyzur = data.toString().slice(16, 21);
        data.setHours(data.getHours() > 1 ? data.getHours() - 1 : 0)
        LocalNotifications.schedule([{
            id: index, // generated id if not set
            title: 'Przypomnienie o służbie',
            body: 'Msza Święta. Dziś, godz. ' + dyzur + '. KnC!',
            badge: 1,
            color: new Color("#e71e25"),
            // icon: 'res://icon',
            // image: "https://cdn-images-1.medium.com/max/1200/1*c3cQvYJrVezv_Az0CoDcbA.jpeg",
            // thumbnail: true,
            interval: 'week',
            channel: 'Przypomnienia o służbie', // default: 'Channel'
            sound: "customsound-ios.wav", // falls back to the default sound on Android
            forceShowWhenInForeground: true,
            notificationLed: true,
            at: data
        }])
    }

    tap() {
        LocalNotifications.schedule([{
            id: 8, // generated id if not set
            title: 'Przypomnienie o służbie',
            body: 'Msza Święta. Dziś, godz. 18:00. KnC!',
            badge: 1,
            color: new Color("#e71e25"),
            icon: 'res://ic_stat_notify',
            silhouetteIcon: 'ic_stat_notify_silhouette',
            // image: "https://cdn-images-1.medium.com/max/1200/1*c3cQvYJrVezv_Az0CoDcbA.jpeg",
            // thumbnail: true,
            // interval: 'week',
            channel: 'Przypomnienia o służbie', // default: 'Channel'
            sound: "customsound-ios.wav", // falls back to the default sound on Android
            forceShowWhenInForeground: true,
            notificationLed: true,
            at: new Date(new Date().getTime() + (2 * 1000))
        }])
    }
}
