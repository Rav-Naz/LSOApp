import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { Feedback, FeedbackType} from "nativescript-feedback";
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { HttpService } from '~/app/serwisy/http.service';
import { Parafia } from '~/app/serwisy/parafia.model';


@Component({
    selector: 'ns-punktacja',
    templateUrl: './punktacja.component.html',
    styleUrls: ['./punktacja.component.css'],
    moduleId: module.id,
})
export class PunktacjaComponent implements OnInit {

    private feedback: Feedback;

    zmiana: boolean = false;

    constructor(private page: Page, private router: RouterExtensions, private parafiaService: ParafiaService,
        private tabIndexService: TabindexService, private modal: ModalDialogService, private vcRef: ViewContainerRef, private http: HttpService) {
        this.feedback = new Feedback();
    }

    pktZaObecnosc: number = 0;
    pktZaNieobecnosc: number = 0;

    poczObecnosc: number = 0;
    poczNieobecnosc: number = 0;


    ngOnInit() {
        this.page.actionBarHidden = true;

        let o = this.parafiaService.parafia.punkty_dod_sluzba

        let n = this.parafiaService.parafia.punkty_uj_sluzba

        this.poczObecnosc = o.valueOf()

        this.poczNieobecnosc = n.valueOf()

        this.pktZaObecnosc = o.valueOf()

        this.pktZaNieobecnosc = n.valueOf()


    }

    zapisz() {
        this.parafiaService.parafia.punkty_dod_sluzba = this.pktZaObecnosc;
        this.parafiaService.parafia.punkty_uj_sluzba = this.pktZaNieobecnosc;

        this.zmiana = false;

        this.http.aktualizacjaPunktow(this.pktZaObecnosc, this.pktZaNieobecnosc).then(res => {
            let daneParafii: Parafia = JSON.parse(JSON.stringify(res))
            if(daneParafii.id_parafii)
            {
                this.parafiaService.parafia = daneParafii
                setTimeout(() => {
                    this.feedback.show({
                        title: "Sukces!",
                        message: "Zapisano punktację, zacznie ona obowiązywać od następnego sprawdzenia obecności",
                        titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                        messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                        duration: 3500,
                        backgroundColor: new Color(255,49, 155, 49),
                        type: FeedbackType.Success,
                      });
                }, 400)
                this.anuluj();
            }
            else
            {
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

        await this.czyKontynuowac(this.zmiana).then((kontynuowac) => {
            if (!kontynuowac) {
                this.tabIndexService.nowyOutlet(6, "ustawieniaO");
                this.router.back();
            }
        });
    }

    private czyKontynuowac(zmiana: boolean) {
        return new Promise<boolean>((resolve) => {
            if (zmiana && ((this.pktZaNieobecnosc !== this.poczNieobecnosc) || (this.pktZaObecnosc !== this.poczObecnosc))) {
                if (zmiana === true) {
                    this.modal.showModal(PotwierdzenieModalComponent, {
                        context: "Zmienione dane o punktacji nie zostaną zapisane.\nCzy chcesz kontynuować?",
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
            }
            else {
                resolve(false)
            }
        })
    }

    zmien() {
        this.zmiana = true;
    }
}
