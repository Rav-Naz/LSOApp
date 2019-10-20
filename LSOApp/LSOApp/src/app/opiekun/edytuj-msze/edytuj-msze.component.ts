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
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
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

    DzienTygodnia = [1, 2, 3, 4, 5, 6, 0]
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
            if (lista !== null && lista !== undefined) {
                lista.forEach(wydarzenie => {
                    this.wydarzeniaDnia.push({ id: wydarzenie.id, id_parafii: wydarzenie.id_parafii, nazwa: wydarzenie.nazwa, typ: wydarzenie.typ, cykl: wydarzenie.cykl, dzien_tygodnia: wydarzenie.dzien_tygodnia, godzina: wydarzenie.godzina })
                    this.stareWydarzeniaDnia.push({ id: wydarzenie.id, id_parafii: wydarzenie.id_parafii, nazwa: wydarzenie.nazwa, typ: wydarzenie.typ, cykl: wydarzenie.cykl, dzien_tygodnia: wydarzenie.dzien_tygodnia, godzina: wydarzenie.godzina })
                })

                this.wydarzeniaDnia.sort((wyd1, wyd2) => {
                    if (wyd1.godzina > wyd2.godzina) { return 1; }
                    if (wyd1.godzina < wyd2.godzina) { return -1; }
                    return 0;
                });
            }
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
                godzina.setHours(godzina.getHours() + 1);
                if (this.wydarzeniaDnia.filter(wydarzenie => new Date(wydarzenie.godzina).getHours() === godzina.getHours() && new Date(wydarzenie.godzina).getMinutes() === godzina.getMinutes())[0] === undefined) {
                    this.wydarzeniaDnia.push(this.wydarzeniaService.noweWydarzenie(this.wybranyDzien, godzina));
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

        await this.czyKontynuowac(true,"Usunięcie wydarzenia spowoduje utratę przypisanych do niego dyżurów.\nCzy chcesz trwale usunąć wydarzenie z godziny " + wydarzenie.godzina.toString().slice(11,16) + "?").then((kontynuowac) => {
            if (!kontynuowac) {
                let index = this.wydarzeniaDnia.indexOf(wydarzenie);
                this.wydarzeniaDnia.splice(index, 1);
                this.zmiana = true;
            }
        });
    }

    zapisz() {
        this.wydarzeniaService.zapiszWydarzenia(this.stareWydarzeniaDnia, this.wydarzeniaDnia, this.wybranyDzien).then(() => {
            this.wydarzeniaService.dzisiejszeWydarzenia(this.wydarzeniaService.aktywnyDzien);
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

    async anuluj() {

        await this.czyKontynuowac(this.zmiana,"Zmienione wydarzenia nie zostaną zapisane.\nCzy chcesz kontynuować?").then((kontynuowac) => {
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
