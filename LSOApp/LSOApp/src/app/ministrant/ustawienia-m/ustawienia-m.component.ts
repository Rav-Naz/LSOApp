import { Component, OnInit } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { RouterExtensions } from 'nativescript-angular/router';
import * as utils from "tns-core-modules/utils/utils";
import * as email from "nativescript-email";
import { UserService } from '~/app/serwisy/user.service';
import { Subscription } from 'rxjs';
import { SecureStorage } from "nativescript-secure-storage";
import { Feedback, FeedbackType} from "nativescript-feedback";
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'ns-ustawienia-m',
    templateUrl: './ustawienia-m.component.html',
    styleUrls: ['./ustawienia-m.component.css'],
    moduleId: module.id,
})
export class UstawieniaMComponent implements OnInit {
    powiadomieniaSub: Subscription;

    private feedback: Feedback;

    constructor(private page: Page, private indexService: TabindexService, private router: RouterExtensions, private userService: UserService, private active: ActivatedRoute, private tabService: TabindexService) {
        this.feedback = new Feedback();
    }

    wersja = this.userService.wersja;
    checked: boolean;
    private secureStroage = new SecureStorage;

    ngOnInit() {
        this.page.actionBarHidden = true;
        this.powiadomieniaSub = this.userService.UserDyuzryPowiadomienia.subscribe(wartosc => {
            this.checked = wartosc;
        })
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
                        this.feedback.show({
                            title: "Sukces!",
                            message: "Pomyślnie wylogowano",
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 3000,
                            backgroundColor: new Color(255,49, 155, 49),
                            type: FeedbackType.Success,
                          });
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

}
