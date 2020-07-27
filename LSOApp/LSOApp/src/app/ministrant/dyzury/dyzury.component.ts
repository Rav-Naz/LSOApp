import { Component, OnInit } from '@angular/core';
import { Page, EventData, isAndroid, LinearGradient, isIOS } from 'tns-core-modules/ui/page/page';
import { UserService } from '~/app/serwisy/user.service';
import { User } from '~/app/serwisy/user.model';
import { Wydarzenie } from '~/app/serwisy/wydarzenie.model';
import { SecureStorage } from "nativescript-secure-storage";
import { Subscription } from 'rxjs';
import { UiService } from '~/app/serwisy/ui.service';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { HttpService } from '~/app/serwisy/http.service';
import { Label } from 'tns-core-modules/ui/label';

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
    teraz: Date;
    dyzury: Array<Wydarzenie> = [];
    dyzurySub: Subscription;
    powiadomieniaSub: Subscription;
    ladowanie: boolean = false;
    dni = ['NIE','PON','WTO','ŚR','CZW','PIA','SOB'];
    rzedy: Array<number> = [0,1,2,3,6,7,8];
    wydarzeniaWgDni: Array<Array<Wydarzenie>> = [[],[],[],[],[],[],[]];
    aktualneWydarzenie: Wydarzenie = null;
    pozniejszeWydarzenia: Array<Wydarzenie> = [];

    constructor(private page: Page, private userService: UserService, public ui: UiService, public http: HttpService)
    {}

    ngOnInit() {
        this.ui.zmienStan(0,true);
        this.page.actionBarHidden = true;

        this.userSub = this.userService.UserSub.subscribe(user => {
            this.user = user;
        });

        let secureStorage = new SecureStorage;
        secureStorage.clearAllOnFirstRun();
        this.userService.mojeDyzury(this.user.id_user, this.user.stopien).then(res => {
            if(res === 404)
            {
                this.ui.showFeedback('warning','Twoja sesja wygasła. Zaloguj się ponownie aby móc kontynuować',2);
            }
            setTimeout(() => {

                this.ui.zmienStan(0,false);
            },500);
        });

        this.dyzurySub = this.userService.UserDyzurySub.subscribe(dyzury => {

            this.teraz = new Date();
            this.teraz.setHours(3);

            if (dyzury !== undefined && dyzury !== null) {

                if (dyzury.length === 0) {
                    return;
                }

                this.dyzury = dyzury;

                for (let index = 0; index < this.wydarzeniaWgDni.length; index++) {

                    let przedzialPoczatek =  new Date();
                    let przedzialKoniec = new Date();
                    przedzialPoczatek.setFullYear(2018,10,15);
                    przedzialKoniec.setFullYear(2018,10,15);
                    przedzialPoczatek.setMinutes(przedzialPoczatek.getMinutes() - 45);
                    przedzialKoniec.setMinutes(przedzialKoniec.getMinutes() + 45);

                    let dzisiejsze = this.dyzury.filter(dyzur => dyzur.dzien_tygodnia === index);

                    dzisiejsze.sort((wyd1, wyd2) => {
                        if (wyd1.godzina > wyd2.godzina) { return 1; }
                        if (wyd1.godzina < wyd2.godzina) { return -1; }
                        return 0;
                    });

                    if(index === this.teraz.getDay())
                    {
                        let pozniejsze = dzisiejsze.filter(dyzur => new Date(dyzur.godzina) >= przedzialPoczatek);
                        if(pozniejsze.length > 0)
                        {
                            dzisiejsze = dzisiejsze.slice(0,dzisiejsze.indexOf(pozniejsze[0]))
                            this.aktualneWydarzenie = new Date(pozniejsze[0].godzina) <= przedzialKoniec ? pozniejsze.shift() : null
                        }
                        this.pozniejszeWydarzenia = pozniejsze.slice(0,3);
                    }

                    this.wydarzeniaWgDni[index] = dzisiejsze.slice(0,3);
                }
            }
        });

    }

    GodzinaDyzuruNaDanyDzien(godzina: string) {
        return new Date(godzina).toString().slice(16,21);
    }

    onSwipe(args: SwipeGestureEventData)
    {
        if (args.direction === 8 && !this.ladowanie) {
            this.ui.zmienStan(0,true);
            this.ladowanie = true;
            this.http.pobierzMinistranta(this.user.id_user).then(res => {
                this.userService.zmienUsera(res);
            });
            this.userService.mojeDyzury(this.user.id_user, this.user.stopien).then(res => {
                if(res === 404)
                {
                    this.ui.showFeedback('warning','Twoja sesja wygasła. Zaloguj się ponownie aby móc kontynuować',2);
                }
                setTimeout(() => {
                    this.ladowanie = false;
                    this.ui.zmienStan(0,false);
                },500);
            });
        }
    }

    ktoryRzad(index: number)
    {
        return (index+(10-this.teraz.getDay())%7)%7;
    }

    onLabelLoaded(args: EventData, typ: number)
    {
        const lbl = args.object as Label;

        if(isAndroid)
        {
            lbl.android.setGravity(17);
        }
    }

    get marginRight()
    {
        if(isAndroid) return 0;
        return 30;
    }

    opacity(index: number)
    {
        return 3/(Math.pow(Math.abs(3-this.ktoryRzad(index)),2.5)+3);
    }

    wydarzeniaNaDanyDzien(dzien: number)
    {
        return this.wydarzeniaWgDni[dzien];
    }
}
