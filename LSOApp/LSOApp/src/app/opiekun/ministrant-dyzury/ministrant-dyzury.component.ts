import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { Wydarzenie } from '~/app/serwisy/wydarzenie.model';
import { User } from '~/app/serwisy/user.model';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { Subscription } from 'rxjs';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { Feedback, FeedbackType} from "nativescript-feedback";
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { WyborModalComponent } from '~/app/shared/modale/wybor-modal/wybor-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';

@Component({
    selector: 'ns-ministrant-dyzury',
    templateUrl: './ministrant-dyzury.component.html',
    styleUrls: ['./ministrant-dyzury.component.css'],
    moduleId: module.id,
})
export class MinistrantDyzuryComponent implements OnInit {
    private feedback: Feedback;

    constructor(private page: Page, private router: RouterExtensions, private parafiaService: ParafiaService, private wydarzeniaService: WydarzeniaService, private tabIndexService: TabindexService, private modal: ModalDialogService, private vcRef: ViewContainerRef) {
        this.feedback = new Feedback();
    }
    nazwyDni = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota']
    dni = [false,false,false,false,false,false,false];

    zmiana: boolean = false;

    wydarzeniaMinistranta: Array<Wydarzenie>;
    stareWydarzeniaMinistranta: Array<Wydarzenie>;

    wszystkieWydarzenia: Array<Wydarzenie> = [];

    ministrant: User;

    dyzurSub: Subscription;
    wydarzeniaSub: Subscription;


    ngOnInit() {
        this.page.actionBarHidden = true;

        this.ministrant = this.parafiaService.WybranyMinistrant(this.parafiaService.aktualnyMinistrantId);

        this.wydarzeniaSub = this.wydarzeniaService.WydarzeniaDyzurySub.subscribe( lista => {
            if(lista !== null)
            {
                this.wszystkieWydarzenia = lista;
            }
        })

        this.parafiaService.wyszukajDyzury(this.ministrant.id_user);

        this.dyzurSub = this.parafiaService.DyzuryMinistranta.subscribe(lista_dyzurow => {
            let dyzury: Array<Wydarzenie> = [];
            this.wydarzeniaMinistranta = [null,null,null,null,null,null,null];
            this.stareWydarzeniaMinistranta = [null,null,null,null,null,null,null];
            if (lista_dyzurow.length === 0) {
                return;
            }
            lista_dyzurow.forEach(dyzur => {
                dyzury.push(this.wydarzeniaService.wybraneWydarzenie(dyzur.id_wydarzenia));
            });
            for (let index = 0; index < 7; index++) {
               let c = dyzury.filter(dyzur => dyzur.dzien_tygodnia === index)[0];
               if(c !== undefined)
               {
                   this.wydarzeniaMinistranta[index] = c;
                   this.stareWydarzeniaMinistranta[index] = c;
                   this.dni[index] = true;
               }
            }
        });

    }

    zmianaCheckboxa(index:number, event)
    {
        this.dni[index] = event;
        if(event === false)
        {
            this.zmiana = true;
            this.wydarzeniaMinistranta[index] = null;
        }
    }

    wyborGodziny(dzien_tygodnia: number)
    {
        let danegoDnia = this.wszystkieWydarzenia.filter(dzien => dzien.dzien_tygodnia === dzien_tygodnia);
        this.displayActionDialog(danegoDnia);
    }

    async anuluj() {
        await this.czyKontynuowac(this.zmiana).then((kontynuowac) => {
            if(!kontynuowac)
            {
                this.tabIndexService.nowyOutlet(4,'ministrant-szczegoly')
                this.router.back();
            }
        });
    }

    private czyKontynuowac(zmiana: boolean)
    {
        return new Promise<boolean>((resolve) => {
            if(zmiana === true)
            {
                this.modal.showModal(PotwierdzenieModalComponent,{
                    context: "Dane o dyżurach dla tego ministranta nie zostaną zapisane.\nCzy chcesz kontynuować?",
                    viewContainerRef: this.vcRef,
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

    displayActionDialog(opcje: Array<Wydarzenie>)
    {
        let wybor = [];
        if(opcje.length > 0)
        {
            opcje.sort((wyd1, wyd2) => {
                if (wyd1.godzina > wyd2.godzina) { return 1; }
                if (wyd1.godzina < wyd2.godzina) { return -1; }
                return 0;
            });
            opcje.forEach(wydarzenie => {
                wybor.push(wydarzenie.godzina.toString().slice(11,16));
            })

            this.modal.showModal(WyborModalComponent,{
                context: wybor,
                viewContainerRef:  this.vcRef,
                fullscreen: false,
                stretched: false,
                animated:  true,
                closeCallback: null,
                dimAmount: 0.8 // Sets the alpha of the background dim,

              } as ExtendedShowModalOptions).then((result) => {
                if(result !== undefined)
                {
                    let ktoreWydarzenie = opcje.filter(item => item.godzina.toString().slice(11,16) === wybor[result])[0];
                    this.wydarzeniaMinistranta[ktoreWydarzenie.dzien_tygodnia] = ktoreWydarzenie;
                    this.zmiana = true;
                }
            });
        }
        else
        {
            this.feedback.show({
                title: "Uwaga!",
                message: "Brak wydarzeń w tym dniu",
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 2000,
                backgroundColor: new Color(255,255, 207, 51),
                type: FeedbackType.Warning,

              });
            return;
        }
    }

    zapisz()
    {
        this.parafiaService.zapiszDyzury(this.wydarzeniaMinistranta, this.stareWydarzeniaMinistranta).then(() => {
            setTimeout(() => {
                this.feedback.show({
                    title: "Sukces!",
                    message: "Zapisano dyżury",
                    titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                    messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                    duration: 2000,
                    backgroundColor: new Color(255,49, 155, 49),
                    type: FeedbackType.Success,
                  });
            }, 400)
            this.zmiana = false;
            this.anuluj()
        });
    }

    godzina(index: number)
    {
        if(this.wydarzeniaMinistranta[index] === null)
        {
            return "--:--"
        }
        else
        {
            return this.wydarzeniaMinistranta[index].godzina.toString().slice(11,16);
        }
    }

    onSwipe(args: SwipeGestureEventData) {
        if (args.direction === 1) {
            this.anuluj();
        }
    }
}
