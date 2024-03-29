import { Component, OnInit } from '@angular/core';
import { UserService } from '../serwisy/user.service';
import { User } from '../serwisy/user.model';
// import { RouterExtensions } from 'nativescript-angular/router';
import { ActivatedRoute } from '@angular/router';
// import { Page, EventData } from 'tns-core-modules/ui/page/page';
import { TabindexService } from '../serwisy/tabindex.service';
import { Subscription } from 'rxjs';
import { UiService } from '../serwisy/ui.service';
import { Page, isIOS, EventData } from '@nativescript/core';
import { RouterExtensions } from '@nativescript/angular';
// import { isIOS} from "tns-core-modules/platform";
// import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';

@Component({
    selector: 'ns-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
    moduleId: module.id,
})
export class MenuComponent implements OnInit {

    public selectedIndex: number;
    private tabSelectedIndexSub: Subscription;
    constructor(public userService: UserService, private router: RouterExtensions, private active: ActivatedRoute,
        private page: Page, public tabIndexService: TabindexService, public ui: UiService) {
    }

    user: User;
    userSub: Subscription;
    adminSub: Subscription;
    public miejsce: number = 0;
    public ios: boolean;

    ngOnInit() {
        this.ios = isIOS ? true : false;
        this.page.actionBarHidden = true;
        this.tabSelectedIndexSub = this.tabIndexService.tabSelectedIndex.subscribe( index => {
            this.selectedIndex = index;
        });
        this.adminSub = this.tabIndexService.czyOpiekun.subscribe( bool => {
            if (bool) {
                this.router.navigate([{ outlets: { obecnosc: ['obecnosc'], ministranci: ['ministranci'], wiadomosciO: ['wiadomosciO'], ustawieniaO: ['ustawieniaO'] } }],
                { relativeTo: this.active });
            }
            else if(!bool){
                this.userSub = this.userService.UserSub.subscribe(user => {
                    this.user = user;
                    this.userService.miejsceWRankignu().then(res => {
                        this.miejsce = res;
                    })
                });
                this.router.navigate([{ outlets: { dyzury: ['dyzury'], wiadomosciM: ['wiadomosciM'], ustawieniaM: ['ustawieniaM'] } }],
                    { relativeTo: this.active });
            }
        })
    }
    ngOnDestroy()
    {
        this.tabSelectedIndexSub.unsubscribe();
    }

    zmianaIndexu(event: EventData)
    {
        this.selectedIndex = event.object.get('selectedIndex');
    }

    zmienStrone(strona: number)
    {
        this.selectedIndex = strona;
    }

    nic(){}
}
