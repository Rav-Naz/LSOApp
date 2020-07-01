import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Page, View, EventData, Color, isIOS } from 'tns-core-modules/ui/page/page';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { User } from '~/app/serwisy/user.model';
import { RouterExtensions } from 'nativescript-angular/router';
import { Subscription } from 'rxjs';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { ActivatedRoute } from '@angular/router';
import { sortPolskich } from '~/app/shared/sortPolskich';
import { UserService } from '~/app/serwisy/user.service';
import { UiService } from '~/app/serwisy/ui.service';
import { ListViewEventData, RadListView, PullToRefreshStyle } from 'nativescript-ui-listview';

@Component({
    selector: 'ns-ministranci',
    templateUrl: './ministranci.component.html',
    styleUrls: ['./ministranci.component.css'],
    moduleId: module.id,
})
export class MinistranciComponent implements OnInit {

    ministranci: Array<User> = [];

    miniSub: Subscription;

    sortujPoImieniu: boolean = false;

    ladowanie: boolean = true;

    constructor(private page: Page, private parafiaService: ParafiaService, private router: RouterExtensions, private tabIndexService: TabindexService, private wydarzeniaService: WydarzeniaService,
         private active: ActivatedRoute, private userService: UserService, public ui: UiService) {}

    ngOnInit() {
        this.ui.zmienStan(1,true)
        this.parafiaService.pobierzMinistrantow().then(res => {
            this.ui.zmienStan(1,false)
        })
        this.page.actionBarHidden = true;
        setTimeout(() => {
            this.miniSub = this.parafiaService.Ministranci.subscribe(lista => {
                this.ministranci = [];
                if(lista !== null)
                {
                    lista.forEach(ministrant => {
                        this.ministranci.push({id_user: ministrant.id_user, id_diecezji: ministrant.id_diecezji, id_parafii: ministrant.id_parafii, punkty: ministrant.punkty, stopien: ministrant.stopien, imie: ministrant.imie, nazwisko: ministrant.nazwisko, ulica: ministrant.ulica, kod_pocztowy: ministrant.kod_pocztowy, miasto: ministrant.miasto, email: ministrant.email, telefon: ministrant.telefon, aktywny: ministrant.aktywny, admin: ministrant.admin, ranking: ministrant.ranking})
                    })
                    this.ministranci = this.ministranci.filter(item => item.stopien !== 11)
                    this.sortujListe();
                    this.ui.zmienStan(1,false)
                }
            })
        },200)
    }

    zmianaSortu() {
        this.ui.zmienStan(1,true)
        this.sortujPoImieniu = !this.sortujPoImieniu;
        this.sortujListe();
    }

    sortujListe() {
        this.ministranci.sort((min1, min2) => {
            if (this.sortujPoImieniu) {
               return sortPolskich(min1.nazwisko,min2.nazwisko)
            }
            else {
                if (min1.punkty < min2.punkty) {
                    return 1;
                }
                if (min1.punkty > min2.punkty) {
                    return -1;
                }
                return 0;
            }
        });
        setTimeout(() => {

            this.ui.zmienStan(1,false)

        }, isIOS ? 1000 : 200)
    }

    kolor(index: number)
    {
        return index%2 === 0 ? new Color("#141414") :  new Color("black")
    }

    public onSwipeCellStarted(args: ListViewEventData) {
        const swipeLimits = args.data.swipeLimits;
        const swipeView = args['object'];
        const leftItem = swipeView.getViewById<View>('delete');
        swipeLimits.left = leftItem.getMeasuredWidth();
        swipeLimits.right = 0;
        swipeLimits.threshold = leftItem.getMeasuredWidth() / 2;
    }

    onLeftSwipeClick(args)
    {
        let index = this.ministranci.indexOf(args.object.bindingContext);
        this.usunMinistranta(this.ministranci[index], index);
    }

    public onPullToRefreshInitiated(args: ListViewEventData) {
        this.parafiaService.pobierzMinistrantow().then(res => {
            setTimeout(function () {
                const listView = args.object;
                listView.notifyPullToRefreshFinished();
            }, 500);
        })
    }

    onLoaded(event: EventData) {
        let style = new PullToRefreshStyle();
        style.indicatorColor = new Color("red");
        style.indicatorBackgroundColor = new Color("black");
        (<RadListView>event.object).pullToRefreshStyle = style;
    }

    szczegolyMinistranta(id: number, index: number) {
        this.tabIndexService.nowyOutlet(4, 'ministrant-szczegoly');
        this.parafiaService.aktualnyMinistrantId = id;
        this.router.navigate(['../ministrant-szczegoly'], {relativeTo: this.active, transition: { name: 'slideLeft' }});
    }

    nowyMinistrant() {
        this.tabIndexService.nowyOutlet(4, 'ministrant-nowy')
        this.router.navigate(['../ministrant-nowy'], {relativeTo: this.active, transition: { name: 'slideBottom' }});
    }

    async usunMinistranta(ministrant: User, index: number) {

        if(ministrant.id_user === this.userService.UserID)
        {
            this.ui.showFeedback('error',"Nie możesz usunąć swojego konta z poziomu widoku opiekuna",3)
            return
        }

        await this.ui.pokazModalWyboru("Czy na pewno chcesz usunąć\n" + ministrant.nazwisko + " " + ministrant.imie + "\nz listy ministrantów?").then((kontynuowac) => {
            if(kontynuowac)
            {
                this.ui.zmienStan(1,true)
                this.parafiaService.usunMinistranta(ministrant.id_user).then(res => {
                    if(res === 404)
                    {
                        this.ui.sesjaWygasla()
                        this.ui.zmienStan(1,false)
                        return
                    }
                    this.wydarzeniaService.dzisiejszeWydarzenia(this.wydarzeniaService.aktywnyDzien, null)
                    setTimeout(() => {
                        this.ui.showFeedback('succes',"Usunięto ministranta " + ministrant.nazwisko + " " + ministrant.imie,3)
                    }, 400)
                });
            }
        });
    }
}
