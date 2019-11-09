import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Page, EventData, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { DzienTyg } from '~/app/serwisy/dzien_tygodnia.model';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { Subscription } from 'rxjs';
import { Wydarzenie } from '~/app/serwisy/wydarzenie.model';
import * as TimePicker from "nativescript-datetimepicker"
import { Button } from "tns-core-modules/ui/button";
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { Feedback, FeedbackType } from "nativescript-feedback";
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';

@Component({
    selector: 'ns-edytuj-msze',
    templateUrl: './edytuj-msze.component.html',
    styleUrls: ['./edytuj-msze.component.css'],
    moduleId: module.id,
})
export class EdytujMszeComponent implements OnInit {

    private feedback: Feedback;

    constructor(private page: Page, private router: RouterExtensions, private wydarzeniaService: WydarzeniaService, private tabIndexService: TabindexService, private modal: ModalDialogService, private vcRef: ViewContainerRef) {
        this.feedback = new Feedback();
    }

    DzienTygodnia = [0, 1, 2, 3, 4, 5, 6]
    wybranyDzien: number;
    zmiana: boolean = false;
    wydarzeniaSub: Subscription;
    wydarzeniaDnia: Array<Wydarzenie>;
    stareWydarzeniaDnia: Array<Wydarzenie>;

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.wydarzeniaSub = this.wydarzeniaService.WydarzeniaEdycjaSub.subscribe((lista) => {
            this.wydarzeniaDnia = [];
            this.stareWydarzeniaDnia = [];
            // console.log(lista)
            // this.wydarzeniaDnia = [];
            if (lista === null || lista === undefined) return
            if (lista.length === 0) return
            // this.wydarzeniaDnia = lista
            // this.stareWydarzeniaDnia = lista

            // console.log(this.wydarzeniaDnia)
            // console.log(this.stareWydarzeniaDnia)
            // this.stareWydarzeniaDnia = [];
            // if (lista !== null && lista !== undefined) {
                lista.forEach(wydarzenie => {
                    this.wydarzeniaDnia.push({ id: wydarzenie.id, id_parafii: wydarzenie.id_parafii, nazwa: wydarzenie.nazwa, typ: wydarzenie.typ, cykl: wydarzenie.cykl, dzien_tygodnia: wydarzenie.dzien_tygodnia, godzina: wydarzenie.godzina })
                    this.stareWydarzeniaDnia.push({ id: wydarzenie.id, id_parafii: wydarzenie.id_parafii, nazwa: wydarzenie.nazwa, typ: wydarzenie.typ, cykl: wydarzenie.cykl, dzien_tygodnia: wydarzenie.dzien_tygodnia, godzina: wydarzenie.godzina })
                })

            this.wydarzeniaDnia.sort((wyd1, wyd2) => {
                let godzina1 = new Date(wyd1.godzina)
                // godzina1.setHours(godzina1.getHours() + 1)
                let godzina2 = new Date(wyd2.godzina)
                // godzina2.setHours(godzina2.getHours() + 1)
                // console.log(godzina1 , godzina2)
                if ((godzina1.getHours() && godzina1.getMinutes()) > (godzina2.getHours() && godzina2.getMinutes())) { return 1; }
                if ((godzina1.getHours() && godzina1.getMinutes()) < (godzina2.getHours() && godzina2.getMinutes())) { return -1; }
                return 0;
            });
            // }
        })
    }

    dodaj(args: EventData) {

        TimePicker.DateTimePicker.pickTime({
            context: (<Button>args.object)._context,
            time: new Date(),
            okButtonText: "Dodaj",
            cancelButtonText: "Anuluj",
            title: "Wybierz godzinę",
            locale: "en_GB",
            is24Hours: true
        }).then((godzina) => {
            if (godzina !== null) {
                if (this.wydarzeniaDnia.filter(wydarzenie => new Date(wydarzenie.godzina).getHours() === godzina.getHours() && new Date(wydarzenie.godzina).getMinutes() === godzina.getMinutes())[0] === undefined) {
                    // godzina.setHours(godzina.getHours() + 1);
                    this.wydarzeniaDnia.push({ id: 0, id_parafii: 2, nazwa: "Msza codzienna",typ: 0, cykl: 0, dzien_tygodnia:  this.wybranyDzien, godzina:  new Date(null, null, null, godzina.getHours(), godzina.getMinutes()).toJSON() });
                    this.zmiana = true;
                }
                else {
                    this.feedback.show({
                        title: "Uwaga!",
                        message: "Wydarzenie o takiej godzinie już istnieje",
                        titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                        messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                        duration: 3000,
                        backgroundColor: new Color(255, 255, 207, 51),
                        type: FeedbackType.Warning,

                    });
                }
            }
        })
    }

    async usun(wydarzenie: Wydarzenie) {
        await this.czyKontynuowac(true, "Usunięcie wydarzenia spowoduje utratę przypisanych do niego dyżurów.\nCzy chcesz trwale usunąć wydarzenie z godziny " + new Date(wydarzenie.godzina).toString().slice(16, 21) + "?").then((kontynuowac) => {
            if (!kontynuowac) {
                let index = this.wydarzeniaDnia.indexOf(wydarzenie);
                this.wydarzeniaDnia.splice(index, 1);
                this.zmiana = true;
            }
        });
    }

    zapisz() {
        this.wydarzeniaService.zapiszWydarzenia(this.stareWydarzeniaDnia, this.wydarzeniaDnia, this.wybranyDzien).then(res => {
            this.wydarzeniaService.dzisiejszeWydarzenia(this.wydarzeniaService.aktywnyDzien);
            if (res === 1) {
                this.wydarzeniaService.wydarzeniaWEdycji(this.wybranyDzien).then(() => {
                    this.zmiana = false;
                    this.feedback.show({
                        title: "Sukces!",
                        message: "Zapisano wydarzenia",
                        titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                        messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                        duration: 2000,
                        backgroundColor: new Color(255, 49, 155, 49),
                        type: FeedbackType.Success,

                    });
                })
            }
            else {
                this.feedback.show({
                    title: "Błąd!",
                    message: "Wystąpił nieoczekiwany błąd",
                    titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                    messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                    duration: 3000,
                    backgroundColor: new Color("#e71e25"),
                    type: FeedbackType.Error,
                });
            }
        })
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
                this.zmiana = false;
                this.wybranyDzien = dzien;
                this.wydarzeniaService.wydarzeniaWEdycji(this.wybranyDzien);
            }
        });
    }
}
