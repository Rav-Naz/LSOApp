import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { RouterExtensions } from 'nativescript-angular/router';
import * as utils from "tns-core-modules/utils/utils";
import * as email from "nativescript-email";
import { UserService } from '~/app/serwisy/user.service';
import { Subscription } from 'rxjs';
import { SecureStorage } from "nativescript-secure-storage";
import { ActivatedRoute } from '@angular/router';
import { UiService } from '~/app/serwisy/ui.service';
import { User } from '~/app/serwisy/user.model';

@Component({
    selector: 'ns-ustawienia-m',
    templateUrl: './ustawienia-m.component.html',
    styleUrls: ['./ustawienia-m.component.css'],
    moduleId: module.id,
})
export class UstawieniaMComponent implements OnInit {
    powiadomieniaSub: Subscription;

    czyAdmin: boolean = false;

    constructor(private page: Page, private router: RouterExtensions, private userService: UserService,
        private active: ActivatedRoute, private tabService: TabindexService, private ui: UiService) {}

    wersja = this.userService.wersja;
    checked: boolean;
    userImieINazwisko: string;
    private secureStroage = new SecureStorage;

    ngOnInit() {
        this.page.actionBarHidden = true;
        this.userImieINazwisko = this.userService.UserImieINazwisko
        this.powiadomieniaSub = this.userService.UserDyuzryPowiadomienia.subscribe(wartosc => {
            this.checked = wartosc;
        })
        if(this.userService.UserPerm === 1)
        {
            this.czyAdmin = true
        }
    }

    nawigujDo(sciezka: string) {
        this.router.navigate(['../' + sciezka], {relativeTo: this.active, transition: { name: 'slideLeft' }});
        // this.router.navigate(['/menu' ,{ outlets: {ministranci: [sciezka]} }],{ relativeTo: this.active, transition: { name: 'slideLeft' }});
        // this.router.navigateByUrl("/menu/(dyzury:dyzury//wiadomosciM:wiadomosciM//ustawieniaM:" + sciezka + ")", {transition: { name: 'slideLeft' }});
    }

    otworzLink(link: string)
    {
        utils.openUrl(link);
    }

    wyloguj()
    {
        this.userService.zmienPowiadomienia(false).then(() => {
            this.secureStroage.removeAll().then(() => {
                this.router.navigate([""],{clearHistory: true, transition: { name: 'slideBottom' }}).then(() => {
                    this.tabService.nowyIndex(0);
                    setTimeout(() => {
                        this.ui.showFeedback('succes',"Pomyślnie wylogowano",3)
                    }, 400)
                });
            })
        })
    }

    kontakt()
    {
        email.available().then(avail => {
            if(avail)
            {
                email.compose({ to: ["kontakt@lsoapp.pl"]});
            }
            else
            {
                this.nawigujDo('info');
            }
        });
    }

    zmienPowiadomienia()
    {
        this.userService.zmienPowiadomienia(!this.checked);
    }

    // zmienNaAdmina()
    // {
    //     this.tabService.zmianaOpiekuna(true).then(res => {
    //         this.router.navigate(['/menu'], { transition: { name: 'slideTop' }, clearHistory: true });
    //     })

    // }

}
