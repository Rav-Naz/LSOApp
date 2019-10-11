import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { User } from '~/app/serwisy/user.model';
import { RouterExtensions } from 'nativescript-angular/router';
import { Subscription } from 'rxjs';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { Feedback, FeedbackType} from "nativescript-feedback";
import { UiService } from '~/app/serwisy/ui.service';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'ns-ministranci',
    templateUrl: './ministranci.component.html',
    styleUrls: ['./ministranci.component.css'],
    moduleId: module.id,
})
export class MinistranciComponent implements OnInit {

    ministranci: Array<User> = [];

    miniSub: Subscription;

    sortujPoImieniu: boolean = true;

    private feedback: Feedback;

    constructor(private page: Page, private parafiaService: ParafiaService, private router: RouterExtensions, private tabIndexService: TabindexService, private wydarzeniaService: WydarzeniaService, private uiService: UiService, private modal: ModalDialogService, private vcRef: ViewContainerRef, private active: ActivatedRoute) {
        this.feedback = new Feedback();
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
        this.miniSub = this.parafiaService.Ministranci.subscribe(lista => {
            this.ministranci = [];
            if(lista !== undefined)
            {
                lista.forEach(ministrant => {
                    this.ministranci.push({id_user: ministrant.id_user, id_diecezji: ministrant.id_diecezji, id_parafii: ministrant.id_parafii, punkty: ministrant.punkty, stopien: ministrant.stopien, imie: ministrant.imie, nazwisko: ministrant.nazwisko, ulica: ministrant.ulica, kod_pocztowy: ministrant.kod_pocztowy, miasto: ministrant.miasto, email: ministrant.email, telefon: ministrant.telefon, aktywny: ministrant.aktywny})
                })
            }
            this.sortujListe();
        })
    }

    zmianaSortu() {
        this.sortujPoImieniu = !this.sortujPoImieniu;
        this.sortujListe();
    }

    sortujListe() {

        this.ministranci.sort((min1, min2) => {
            if (this.sortujPoImieniu) {
                if (min1.nazwisko > min2.nazwisko) {
                    return 1;
                }
                if (min1.nazwisko < min2.nazwisko) {
                    return -1;
                }
                return 0;
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
    }

    szczegolyMinistranta(id: number) {
        this.tabIndexService.nowyOutlet(4, 'ministrant-szczegoly')
        this.parafiaService.aktualnyMinistrantId = id;
        this.router.navigate(['../ministrant-szczegoly'], {relativeTo: this.active, transition: { name: 'slideLeft' }});
    }

    nowyMinistrant() {
        this.tabIndexService.nowyOutlet(4, 'ministrant-nowy')
        this.router.navigate(['../ministrant-nowy'], {relativeTo: this.active, transition: { name: 'slideBottom' }});
    }

    async usunMinistranta(ministrant: User) {

        await this.czyKontynuowac(true,"Czy na pewno chcesz usunąć\n" + ministrant.nazwisko + " " + ministrant.imie + "\nz listy ministrantów?").then((kontynuowac) => {
            if(!kontynuowac)
            {
                this.parafiaService.usunMinistranta(ministrant.id_user).then(() => {
                    this.wydarzeniaService.dzisiejszeWydarzenia(this.wydarzeniaService.aktywnyDzien)
                    setTimeout(() => {
                        this.feedback.show({
                            title: "Sukces!",
                            message: "Usunięto ministranta " + ministrant.nazwisko + " " + ministrant.imie,
                            titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                            messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                            duration: 2000,
                            backgroundColor: new Color(255,49, 155, 49),
                            type: FeedbackType.Success,

                          });
                    }, 400)
                });
            }
        });
    }

    private czyKontynuowac(zmiana: boolean, context: string)
    {
        return new Promise<boolean>((resolve) => {
            if(zmiana === true)
            {
                this.modal.showModal(PotwierdzenieModalComponent,{
                    context: context,
                    viewContainerRef: this.uiService.getRootVCRef() ? this.uiService.getRootVCRef() : this.vcRef,
                    fullscreen: false,
                    stretched: false,
                    animated:  true,
                    closeCallback: null,
                    dimAmount: 0.8 // Sets the alpha of the background dim,

                  } as ExtendedShowModalOptions).then((wybor) => {
                      if(wybor === true)
                      {
                        resolve(false);
                      }
                      else
                      {
                        resolve(true);
                      }
                  })
            }
            else
            {
                resolve(false)
            }
        })
    }

        // kierunki: 1 (z lewej w prawo), 2 (z prawej w lewo), 4 (z dołu do góry), 8 (z góry do dołu)

        onSwipe(args: SwipeGestureEventData) {
            if (args.direction === 2) {
                this.tabIndexService.nowyIndex(2);
            }
            else if(args.direction === 1)
            {
                this.tabIndexService.nowyIndex(0);
            }
        }


}
