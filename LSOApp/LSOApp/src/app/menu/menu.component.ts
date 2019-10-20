import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../serwisy/user.service';
import { User } from '../serwisy/user.model';
import { RouterExtensions } from 'nativescript-angular/router';
import { ActivatedRoute } from '@angular/router';
import { Page, EventData } from 'tns-core-modules/ui/page/page';
import { TabindexService } from '../serwisy/tabindex.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'ns-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
    moduleId: module.id,
})
export class MenuComponent implements OnInit,OnDestroy {

    public selectedIndex: number;
    private tabSelectedIndexSub: Subscription;
    constructor(public userService: UserService, private router: RouterExtensions, private active: ActivatedRoute, private page: Page, public tabIndexService: TabindexService) {
    }

    user: User;
    userSub: Subscription;

    ngOnInit() {
        this.page.actionBarHidden = true;
        this.tabSelectedIndexSub = this.tabIndexService.tabSelectedIndex.subscribe( index => {
            this.selectedIndex = index;
        });
        if (this.tabIndexService.opiekun) {
            this.router.navigate([{ outlets: { obecnosc: ['obecnosc'], ministranci: ['ministranci'], wiadomosciO: ['wiadomosciO'], ustawieniaO: ['ustawieniaO'] } }],
            { relativeTo: this.active });
        }
        else {
            this.userSub = this.userService.UserSub.subscribe(user => {
                this.user = user;
            });
            this.router.navigate([{ outlets: { dyzury: ['dyzury'], wiadomosciM: ['wiadomosciM'], ustawieniaM: ['ustawieniaM'] } }],
                { relativeTo: this.active });
        }

    }
    ngOnDestroy()
    {
        this.tabSelectedIndexSub.unsubscribe();
    }

    locationStrategy()
    {
        this.tabIndexService.nowyIndex(3)
    }

    zmianaIndexu(event: EventData)
    {
        this.selectedIndex = event.object.get('selectedIndex');
    }

}
