import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import * as utils from "tns-core-modules/utils/utils";
import * as email from "nativescript-email";
import { UserService } from '~/app/serwisy/user.service';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '~/app/serwisy/http.service';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { WiadomosciService } from '~/app/serwisy/wiadomosci.service';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { SecureStorage } from 'nativescript-secure-storage';
import { ModalDialogService } from 'nativescript-angular/common';
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { UiService } from '~/app/serwisy/ui.service';

@Component({
    selector: 'ns-ustawienia-o',
    templateUrl: './ustawienia-o.component.html',
    styleUrls: ['./ustawienia-o.component.css'],
    moduleId: module.id,
})
export class UstawieniaOComponent implements OnInit {

    secureStorage: SecureStorage;

    constructor(private page: Page, private router: RouterExtensions, private userService: UserService,
        private tabIndexService: TabindexService, private active: ActivatedRoute, private http: HttpService,
        public parafiaService: ParafiaService, private wiadomosciService: WiadomosciService, private wydarzeniaService: WydarzeniaService,
        private modal: ModalDialogService, private vcRef: ViewContainerRef, private ui: UiService) {}

    wersja = this.userService.wersja;
    PROSub: Subscription;
    PROLista: Array<string>;

    ngOnInit() {
        this.PROSub = this.tabIndexService.PRO.subscribe(listaOutletow => {
            this.PROLista = listaOutletow;
        })

        this.secureStorage = new SecureStorage;

        this.page.actionBarHidden = true;
    }

    nawigujDo(sciezka: string) {
        if ((sciezka === "edytuj-msze" || sciezka === "punktacja") && this.PROLista[4] === "ministrant-dyzury") {
            this.ui.showFeedback('warning',"Aby skorzystać z tego widoku musisz zamknąć panel Edytuj dyżury",3)
            return;
        }
        this.tabIndexService.nowyOutlet(6, sciezka);
        this.router.navigate(['../' + sciezka], { relativeTo: this.active, transition: { name: 'slideLeft' } });
    }

    otworzLink(link: string) {
        utils.openUrl(link);
    }

    wyloguj() {
        this.secureStorage.removeAll().then(() => {
            this.http.wyczysc()
            this.parafiaService.wyczysc()
            this.tabIndexService.wyczysc()
            this.userService.wyczysc()
            this.wiadomosciService.wyczysc()
            this.wydarzeniaService.wyczysc()
            this.router.navigate([""], { clearHistory: true, transition: { name: 'slideBottom' } }).then(() => {
                setTimeout(() => {
                    this.ui.showFeedback('succes',"Pomyślnie wylogowano",3)
                }, 400)
            });
        })
    }

    wyzerujPunkty() {
        this.modal.showModal(PotwierdzenieModalComponent, {
            context: 'Czy jesteś pewny, że chcesz wyzerować punkty WSZYSTKIM ministrantom w swojej parafii? Ta funkcja jest zalecana przy rozpoczęciu nowego roku liturgicznego.',
            viewContainerRef: this.vcRef,
            fullscreen: false,
            stretched: false,
            animated: true,
            closeCallback: null,
            dimAmount: 0.8

        } as ExtendedShowModalOptions).then((wybor) => {
            if (wybor) {
                this.ui.zmienStan(4, true)
                this.ui.zmienStan(1, true)
                this.parafiaService.wyzerujPunkty().then(res => {
                    this.ui.zmienStan(4, false)
                    this.ui.zmienStan(1, false)
                    switch (res) {
                        case 0:
                            this.ui.showFeedback('error',"Wystąpił nieoczekiwany błąd",3)
                            break;
                        case 1:
                            this.ui.showFeedback('succes',"Pomyślnie wyzerowano punkty",2)
                            break;
                        default:
                            this.ui.showFeedback('error',"Wystąpił nieoczekiwany błąd",3)
                            break;
                    }
                })
            }
        })
    }

    usunDyzury() {
        this.modal.showModal(PotwierdzenieModalComponent, {
            context: 'Czy jesteś pewny, że chcesz usunąć WSZYSTKIE dyżury ministrantów w swojej parafii? Ta funkcja jest zalecana przy rozpoczęciu nowego roku liturgicznego.',
            viewContainerRef: this.vcRef,
            fullscreen: false,
            stretched: false,
            animated: true,
            closeCallback: null,
            dimAmount: 0.8

        } as ExtendedShowModalOptions).then((wybor) => {
            if (wybor) {
                this.ui.zmienStan(4, true)
                this.ui.zmienStan(0, true)
                this.parafiaService.usunWszystkieDyzury().then(res => {
                    this.ui.zmienStan(4, false)
                    this.ui.zmienStan(0, false)
                    switch (res) {
                        case 0:
                           this.ui.showFeedback('error',"Wystąpił nieoczekiwany błąd",3)
                            break;
                        case 1:
                            this.ui.showFeedback('succes',"Pomyślnie usunięto dyżury",2)
                            break;
                        default:
                                this.ui.showFeedback('error',"Wystąpił nieoczekiwany błąd",3)
                            break;
                    }
                })
            }
        })
    }

    kontakt() {
        email.available().then(avail => {
            if (avail) {
                email.compose({ to: ["kontakt@lsoapp.pl"] });
            }
            else {
                this.nawigujDo('info');
            }
        });
    }
}
