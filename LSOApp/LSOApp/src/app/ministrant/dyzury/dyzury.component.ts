import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { UserService } from '~/app/serwisy/user.service';
import { User } from '~/app/serwisy/user.model';
import { Wydarzenie } from '~/app/serwisy/wydarzenie.model';
import { SecureStorage } from "nativescript-secure-storage";
import { Subscription } from 'rxjs';
import { UiService } from '~/app/serwisy/ui.service';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { HttpService } from '~/app/serwisy/http.service';

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
    ladowanie: boolean = false;
    dni = ['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota']

    constructor(private page: Page, private userService: UserService, public ui: UiService, public http: HttpService)
    {}

    ngOnInit() {
        this.ui.zmienStan(0,true);
        this.dzis = this.rowDzis[new Date().getDay()];
        this.page.actionBarHidden = true;

        this.userSub = this.userService.UserSub.subscribe(user => {
            this.user = user;
        });

        let secureStorage = new SecureStorage;
        secureStorage.clearAllOnFirstRun();
        this.stareDyzury = [];

        this.userService.mojeDyzury(this.user.id_user).then(res => {
            if(res === 404)
            {
                this.ui.showFeedback('warning','Twoja sesja wygasła. Zaloguj się ponownie aby móc kontynuować',2)
            }
            setTimeout(() => {

                this.ui.zmienStan(0,false);
            },500)
        });

        this.dyzurySub = this.userService.UserDyzurySub.subscribe(dyzury => {

            if (dyzury !== undefined && dyzury !== null) {

                if (dyzury.length === 0) {
                    return;
                }

                this.dyzury = dyzury
            }
        })
    }

    GodzinaDyzuruNaDanyDzien(dzien: Wydarzenie) {
        return new Date(dzien.godzina).toString().slice(16,21)
    }

    onSwipe(args: SwipeGestureEventData)
    {
        if (args.direction === 8 && !this.ladowanie) {
            this.ui.zmienStan(0,true);
            this.ladowanie = true;
            this.http.pobierzMinistranta(this.user.id_user).then(res => {
                this.userService.zmienUsera(res);
            })
            this.userService.mojeDyzury(this.user.id_user).then(res => {
                if(res === 404)
                {
                    this.ui.showFeedback('warning','Twoja sesja wygasła. Zaloguj się ponownie aby móc kontynuować',2)
                }
                setTimeout(() => {
                    this.ladowanie = false;
                    this.ui.zmienStan(0,false);
                },500)
            });
        }
    }
}
