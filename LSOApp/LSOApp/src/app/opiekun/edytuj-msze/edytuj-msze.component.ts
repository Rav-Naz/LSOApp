import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Page, EventData } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { DzienTyg } from '~/app/serwisy/dzien_tygodnia.model';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { Subscription } from 'rxjs';
import { Wydarzenie } from '~/app/serwisy/wydarzenie.model';
import * as TimePicker from "nativescript-datetimepicker"
import { Button } from "tns-core-modules/ui/button";
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { UiService } from '~/app/serwisy/ui.service';

@Component({
    selector: 'ns-edytuj-msze',
    templateUrl: './edytuj-msze.component.html',
    styleUrls: ['./edytuj-msze.component.css'],
    moduleId: module.id,
})
export class EdytujMszeComponent implements OnInit {

    constructor(private page: Page, private router: RouterExtensions, private wydarzeniaService: WydarzeniaService,
         private tabIndexService: TabindexService, private modal: ModalDialogService, private vcRef: ViewContainerRef, public ui: UiService) {}

    DzienTygodnia = [0, 1, 2, 3, 4, 5, 6]
    wybranyDzien: number;
    zmiana: boolean = false;
    wydarzeniaSub: Subscription;
    wydarzeniaDnia: Array<Wydarzenie>;
    stareWydarzeniaDnia: Array<Wydarzenie>;
    aktualizujWydarzeniaDnia: Array<Wydarzenie>

    ngOnInit() {
        this.ui.zmienStan(3,true)
        this.page.actionBarHidden = true;

        this.wydarzeniaSub = this.wydarzeniaService.WydarzeniaEdycjaSub.subscribe((lista) => {
            this.wydarzeniaDnia = [];
            this.stareWydarzeniaDnia = [];
            this.aktualizujWydarzeniaDnia = [];

            this.ui.zmienStan(3,false)

            if (lista === null || lista === undefined) return
            if (lista.length === 0) return
                lista.forEach(wydarzenie => {
                    this.wydarzeniaDnia.push({ id: wydarzenie.id, id_parafii: wydarzenie.id_parafii, nazwa: wydarzenie.nazwa, typ: wydarzenie.typ, cykl: wydarzenie.cykl, dzien_tygodnia: wydarzenie.dzien_tygodnia, godzina: wydarzenie.godzina })
                    this.stareWydarzeniaDnia.push({ id: wydarzenie.id, id_parafii: wydarzenie.id_parafii, nazwa: wydarzenie.nazwa, typ: wydarzenie.typ, cykl: wydarzenie.cykl, dzien_tygodnia: wydarzenie.dzien_tygodnia, godzina: wydarzenie.godzina })
                })
                this.sortuj()
        })
    }

    async timePick(args: EventData, title: string, time?: Date)
    {
        return new Promise<Date>(resolve => {
            TimePicker.DateTimePicker.pickTime({
                context: (<Button>args.object)._context,
                time: time? time : new Date(),
                okButtonText: "Dodaj",
                cancelButtonText: "Anuluj",
                title: title,
                locale: "en_GB",
                is24Hours: true
            }).then((res) => {
                resolve(res)
            })
        })
    }

    async dodaj(args: EventData) {
        this.timePick(args,"Wybierz godzinę").then(res => {
            let godzina = res
            if (godzina !== null) {
                if (this.wydarzeniaDnia.filter(wydarzenie => new Date(wydarzenie.godzina).getHours() === godzina.getHours() && new Date(wydarzenie.godzina).getMinutes() === godzina.getMinutes())[0] === undefined) {
                    this.wydarzeniaDnia.push({ id: 0, id_parafii: 2, nazwa: "Msza codzienna",typ: 0, cykl: 0, dzien_tygodnia:  this.wybranyDzien, godzina:  new Date(2018, 10, 15, godzina.getHours(), godzina.getMinutes()).toJSON() });
                    this.zmiana = true;
                    setTimeout(() => {
                        this.sortuj()
                    },50)
                }
                else {
                    this.ui.showFeedback('warning',"Wydarzenie o takiej godzinie już istnieje",3)
                }
            }
        })
    }

    async edytuj(args: EventData, wydarzenie: Wydarzenie, index: number)
    {
        this.timePick(args,"Edytuj godzinę",new Date(wydarzenie.godzina)).then(res => {
            let godzina = res
            if(godzina !== null)
            {
                if (this.wydarzeniaDnia.filter(wydarzeniaaa => new Date(wydarzeniaaa.godzina).getHours() === godzina.getHours() && new Date(wydarzeniaaa.godzina).getMinutes() === godzina.getMinutes())[0] === undefined) {
                    this.czyAktualizowane(wydarzenie)
                    this.wydarzeniaDnia[index].godzina = godzina.toJSON()
                    wydarzenie.godzina = godzina.toJSON()
                    this.aktualizujWydarzeniaDnia.push(wydarzenie)
                    this.zmiana = true
                }
                else {
                    this.ui.showFeedback('warning',"Wydarzenie o takiej godzinie już istnieje",3)
                }
            }
        })
    }

    private czyAktualizowane( wydarzenie: Wydarzenie)
    {
        let czyAktualizowane = this.aktualizujWydarzeniaDnia.filter(item => item.id === wydarzenie.id)[0]
        if(czyAktualizowane !== undefined)
        {
            let index = this.aktualizujWydarzeniaDnia.indexOf(czyAktualizowane);
            this.aktualizujWydarzeniaDnia.splice(index, 1)
        }
    }

    async usun(wydarzenie: Wydarzenie) {
        await this.czyKontynuowac(true, "Usunięcie wydarzenia spowoduje utratę przypisanych do niego dyżurów.\nCzy chcesz trwale usunąć wydarzenie z godziny " + new Date(wydarzenie.godzina).toString().slice(16, 21) + "?").then((kontynuowac) => {
            if (!kontynuowac) {
                this.czyAktualizowane(wydarzenie)
                let index = this.wydarzeniaDnia.indexOf(wydarzenie);
                this.wydarzeniaDnia.splice(index, 1);
                this.zmiana = true;
            }
        });
    }

    zapisz() {
        this.zmiana = false
        this.ui.zmienStan(3,true)
        this.wydarzeniaService.zapiszWydarzenia(this.stareWydarzeniaDnia, this.wydarzeniaDnia, this.aktualizujWydarzeniaDnia, this.wybranyDzien).then(res => {
            if (res === 1) {
                this.wydarzeniaService.dzisiejszeWydarzenia(this.wydarzeniaService.aktywnyDzien);
                this.wydarzeniaService.wydarzeniaWEdycji(this.wybranyDzien).then(() => {
                    this.ui.showFeedback('succes',"Zapisano wydarzenia",3)
                })
            }
            else {
                this.zmiana = true;
                this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
            }
        })
    }

    private sortuj()
    {
        this.wydarzeniaDnia.sort((wyd1, wyd2) => {
            let godzina1 = new Date(wyd1.godzina)
            let godzina2 = new Date(wyd2.godzina)
            if ((godzina1 > godzina2)) { return 1; }
            if ((godzina1 < godzina2)) { return -1; }
            return 0;
        });
    }

    async anuluj() {

        await this.czyKontynuowac(this.zmiana, "Zmienione wydarzenia nie zostaną zapisane.\nCzy chcesz kontynuować?").then((kontynuowac) => {
            if (!kontynuowac) {
                this.tabIndexService.nowyOutlet(6, "ustawieniaO");
                this.router.back();
            }
        });
    }

    private czyKontynuowac(zmiana: boolean, context: string) {
        return new Promise<boolean>((resolve) => {
            if (zmiana === true) {
                this.modal.showModal(PotwierdzenieModalComponent, {
                    context: context,
                    viewContainerRef: this.vcRef,
                    fullscreen: false,
                    stretched: false,
                    animated: true,
                    closeCallback: null,
                    dimAmount: 0.8 // Sets the alpha of the background dim,

                } as ExtendedShowModalOptions).then((wybor) => {
                    if (wybor === true) {
                        resolve(false);
                    }
                    else {
                        resolve(true);
                    }
                })
            }
            else {
                resolve(false)
            }
        })
    }

    dzienTygodnia(dzien: number) {
        return DzienTyg[dzien];
    }

    async zmienDzien(dzien: number) {
        if (dzien === this.wybranyDzien) {
            return;
        }
        await this.czyKontynuowac(this.zmiana, "Zmienione wydarzenia nie zostaną zapisane.\nCzy chcesz kontynuować?").then((kontynuowac) => {
            if (!kontynuowac) {
                this.ui.zmienStan(3,true)
                this.zmiana = false;
                this.wybranyDzien = dzien;
                this.wydarzeniaService.wydarzeniaWEdycji(this.wybranyDzien);
            }
        });
    }
}
