import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { Page, EventData, View, Color } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { DzienTyg } from '~/app/serwisy/dzien_tygodnia.model';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { Subscription } from 'rxjs';
import { Wydarzenie } from '~/app/serwisy/wydarzenie.model';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { UiService } from '~/app/serwisy/ui.service';
import { ListViewEventData } from 'nativescript-ui-listview';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { SzczegolyWydarzeniaComponent } from '~/app/shared/modale/szczegoly-wydarzenia/szczegoly-wydarzenia.component';

@Component({
    selector: 'ns-edytuj-msze',
    templateUrl: './edytuj-msze.component.html',
    styleUrls: ['./edytuj-msze.component.css'],
    moduleId: module.id,
})
export class EdytujMszeComponent implements OnInit {

    constructor(private page: Page, private router: RouterExtensions, private wydarzeniaService: WydarzeniaService,
         private tabIndexService: TabindexService, public ui: UiService, private modal: ModalDialogService,
         private vcRef: ViewContainerRef) {}

    @ViewChild('szczegoly', {static: false}) szczegoly: SzczegolyWydarzeniaComponent;

    DzienTygodnia = [0, 1, 2, 3, 4, 5, 6];
    wybranyDzien: number;
    zmiana: boolean = false;
    wydarzeniaSub: Subscription;
    wydarzeniaDnia: Array<Wydarzenie>;
    stareWydarzeniaDnia: Array<Wydarzenie>;
    aktualizujWydarzeniaDnia: Array<Wydarzenie>;
    usuanie: boolean = false;

    ngOnInit() {
        this.ui.zmienStan(3,true);
        this.page.actionBarHidden = true;

        this.wydarzeniaSub = this.wydarzeniaService.WydarzeniaEdycjaSub.subscribe((lista) => {
            this.wydarzeniaDnia = [];
            this.stareWydarzeniaDnia = [];
            this.aktualizujWydarzeniaDnia = [];

            this.ui.zmienStan(3,false);

            if (lista === null || lista === undefined) return;
            if (lista.length === 0) return;
                lista.forEach(wydarzenie => {
                    this.wydarzeniaDnia.push({ id: wydarzenie.id, id_parafii: wydarzenie.id_parafii, nazwa: wydarzenie.nazwa, typ: wydarzenie.typ, dzien_tygodnia: wydarzenie.dzien_tygodnia, godzina: wydarzenie.godzina, grupa: wydarzenie.grupa, data_dokladna: wydarzenie.data_dokladna});
                    this.stareWydarzeniaDnia.push({ id: wydarzenie.id, id_parafii: wydarzenie.id_parafii, nazwa: wydarzenie.nazwa, typ: wydarzenie.typ, dzien_tygodnia: wydarzenie.dzien_tygodnia, godzina: wydarzenie.godzina, grupa: wydarzenie.grupa, data_dokladna: wydarzenie.data_dokladna});
                });
                this.sortuj();
        });
    }

    async dodaj(args: EventData) {
        let przed = [null,new Date(),null,false,null,this.wybranyDzien];
        this.szczegoly.awaitToDecision(przed).then((result) => {
            if(result !== undefined)
            {
                if (this.wydarzeniaDnia.filter(wydarzenie => new Date(wydarzenie.godzina).getHours() === result[1].getHours() && new Date(wydarzenie.godzina).getMinutes() === result[1].getMinutes())[0] === undefined) {
                        this.wydarzeniaDnia.push({ id: 0, id_parafii: 2, nazwa: result[0] === 0 ? "Msza Święta" : result[0] === 1 ? "Nabożeństwo" : "Zbiórka",typ: result[0], dzien_tygodnia: this.wybranyDzien, godzina:  new Date(2018, 10, 15, result[1].getHours(), result[1].getMinutes()).toJSON(), grupa: result[2], data_dokladna: result[3]});
                        this.zmiana = true;
                        setTimeout(() => {
                            this.sortuj();
                        },50);
                    }
                else{
                    this.ui.showFeedback('warning',"Wydarzenie o takiej godzinie już istnieje",3);
                }
            }
        });
    }

    async edytuj(args: EventData, wydarzenie: Wydarzenie, index: number)
    {
        if(this.usuanie) { return; }
        let przed = [wydarzenie.typ,new Date(wydarzenie.godzina),wydarzenie.grupa === undefined ? null : wydarzenie.grupa,true,wydarzenie.data_dokladna, this.wybranyDzien];
        this.szczegoly.awaitToDecision(przed).then((result) => {
            if(result !== undefined)
            {
                if (this.wydarzeniaDnia.filter(wydarzeniaaa => new Date(wydarzeniaaa.godzina).getHours() === result[1].getHours() && new Date(wydarzeniaaa.godzina).getMinutes() === result[1].getMinutes() && wydarzeniaaa.id !== this.wydarzeniaDnia[index].id)[0] === undefined) {
                    if(przed.toString() !== result.toString())
                    {
                        this.czyAktualizowane(wydarzenie);
                        this.wydarzeniaDnia[index].typ = result[0];
                        wydarzenie.typ = result[0];
                        this.wydarzeniaDnia[index].godzina = result[1].toJSON();
                        wydarzenie.godzina = result[1].toJSON();
                        this.wydarzeniaDnia[index].grupa = result[2];
                        wydarzenie.grupa = result[2];
                        this.wydarzeniaDnia[index].data_dokladna = result[3];
                        wydarzenie.data_dokladna = result[3];
                        this.aktualizujWydarzeniaDnia.push(wydarzenie);
                        this.zmiana = true;
                        setTimeout(() => {
                            this.sortuj();
                        },50);
                    }
                }
                else {
                    this.ui.showFeedback('warning',"Wydarzenie o takiej godzinie już istnieje",3);
                }
            }
        });
    }

    private czyAktualizowane( wydarzenie: Wydarzenie)
    {
        let czyAktualizowane = this.aktualizujWydarzeniaDnia.filter(item => item.id === wydarzenie.id)[0];
        if(czyAktualizowane !== undefined)
        {
            let index = this.aktualizujWydarzeniaDnia.indexOf(czyAktualizowane);
            this.aktualizujWydarzeniaDnia.splice(index, 1);
        }
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
        let index = this.wydarzeniaDnia.indexOf(args.object.bindingContext);
        this.usun(this.wydarzeniaDnia[index]);
    }

    async usun(wydarzenie: Wydarzenie) {
        if(this.usuanie) { return; }
        this.usuanie = true;
        await this.czyKontynuowac(true, "Usunięcie wydarzenia spowoduje utratę przypisanych do niego dyżurów.\nCzy chcesz trwale usunąć wydarzenie z godziny " + new Date(wydarzenie.godzina).toString().slice(16, 21) + "?").then((kontynuowac) => {
            if (kontynuowac) {
                this.czyAktualizowane(wydarzenie);
                let index = this.wydarzeniaDnia.indexOf(wydarzenie);
                this.wydarzeniaDnia.splice(index, 1);
                this.zmiana = true;
            }
            this.usuanie = false;
        });
    }

    zapisz() {
        this.zmiana = false;
        this.ui.zmienStan(3,true);
        this.wydarzeniaService.zapiszWydarzenia(this.stareWydarzeniaDnia, this.wydarzeniaDnia, this.aktualizujWydarzeniaDnia, this.wybranyDzien).then(res => {
            if (res === 1) {
                this.wydarzeniaService.dzisiejszeWydarzenia(this.wydarzeniaService.aktywnyDzien, null);
                this.wydarzeniaService.wydarzeniaWEdycji(this.wybranyDzien).then(() => {
                    this.ui.showFeedback('succes',"Zapisano wydarzenia",3);
                });
            }
            else if( res === 404)
            {
                this.ui.sesjaWygasla();
            }
            else {
                this.zmiana = true;
                this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3);
            }
        });
    }

    private sortuj()
    {
        this.wydarzeniaDnia.sort((wyd1, wyd2) => {
            let godzina1 = new Date(wyd1.godzina);
            let godzina2 = new Date(wyd2.godzina);
            if ((godzina1 > godzina2)) { return 1; }
            if ((godzina1 < godzina2)) { return -1; }
            return 0;
        });
    }

    async anuluj() {

        await this.czyKontynuowac(this.zmiana, "Zmienione wydarzenia nie zostaną zapisane.\nCzy chcesz kontynuować?").then((kontynuowac) => {
            if (kontynuowac) {
                this.tabIndexService.nowyOutlet(6, "ustawieniaO");
                this.router.back();
            }
        });
    }

    private czyKontynuowac(zmiana: boolean, context: string) {
        return new Promise<boolean>((resolve) => {
            if (zmiana === true) {
                this.ui.pokazModalWyboru(context).then((result) => {
                    resolve(result);
                });
            }
            else {
                resolve(true);
            }
        });
    }

    dzienTygodnia(dzien: number) {
        return DzienTyg[dzien];
    }

    kolor(index: number)
    {
        return index%2 === 0 ? new Color("#f0f0f0") :  new Color("white");
    }

    async zmienDzien(dzien: number) {
        if (dzien === this.wybranyDzien) {
            return;
        }
        await this.czyKontynuowac(this.zmiana, "Zmienione wydarzenia nie zostaną zapisane.\nCzy chcesz kontynuować?").then((kontynuowac) => {
            if (kontynuowac) {
                this.ui.zmienStan(3,true);
                this.zmiana = false;
                this.wybranyDzien = dzien;
                this.wydarzeniaService.wydarzeniaWEdycji(this.wybranyDzien).then(res => {
                    if(res === 404)
                    {
                        this.ui.sesjaWygasla();
                    }
                });
            }
        });
    }
}
