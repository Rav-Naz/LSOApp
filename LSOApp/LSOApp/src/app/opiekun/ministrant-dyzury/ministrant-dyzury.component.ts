import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { Wydarzenie } from '~/app/serwisy/wydarzenie.model';
import { User } from '~/app/serwisy/user.model';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { Subscription } from 'rxjs';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { WyborModalComponent } from '~/app/shared/modale/wybor-modal/wybor-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { UiService } from '~/app/serwisy/ui.service';

@Component({
    selector: 'ns-ministrant-dyzury',
    templateUrl: './ministrant-dyzury.component.html',
    styleUrls: ['./ministrant-dyzury.component.css'],
    moduleId: module.id,
})
export class MinistrantDyzuryComponent implements OnInit {

    constructor(private page: Page, private router: RouterExtensions, private parafiaService: ParafiaService,
        private wydarzeniaService: WydarzeniaService, private tabIndexService: TabindexService, private modal: ModalDialogService,
        private vcRef: ViewContainerRef, public ui: UiService) {}
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

        this.ui.zmienStan(6,true)

        this.page.actionBarHidden = true;

        this.wydarzeniaService.wszystkieWydarzeniaWDyzurach().then(res => {
            if(res === 404)
            {
                setTimeout(() => {
                    this.ui.sesjaWygasla()
                },200)
                return
            }
            this.parafiaService.wyszukajDyzury(this.parafiaService.aktualnyMinistrantId);

            this.wydarzeniaSub = this.wydarzeniaService.WydarzeniaDyzurySub.subscribe( lista => {
                if(lista !== null)
                {
                    this.wszystkieWydarzenia = lista;
                }
            })


            this.dyzurSub = this.parafiaService.DyzuryMinistranta.subscribe(lista_dyzurow => {
                let dyzury: Array<Wydarzenie> = [];
                this.wydarzeniaMinistranta = [null,null,null,null,null,null,null];
                this.stareWydarzeniaMinistranta = [null,null,null,null,null,null,null];
                if (lista_dyzurow.length === 0) {
                    this.ui.zmienStan(6,false)
                    return;
                }
                dyzury = lista_dyzurow

                for (let index = 0; index < 7; index++) {
                   let c = dyzury.filter(dyzur => dyzur.dzien_tygodnia === index)[0];
                   if(c !== undefined)
                   {
                       this.wydarzeniaMinistranta[index] = c;
                       this.stareWydarzeniaMinistranta[index] = c;
                       this.dni[index] = true;
                   }
                }
                this.ui.zmienStan(6,false)
            })
        })

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
        let danegoDnia = this.wszystkieWydarzenia.filter(dzien => dzien.dzien_tygodnia === dzien_tygodnia && dzien.typ === 0);
        this.displayActionDialog(danegoDnia);
    }

    async anuluj() {
        await this.czyKontynuowac(this.zmiana).then((kontynuowac) => {
            if(kontynuowac)
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
                this.ui.pokazModalWyboru("Dane o dyżurach dla tego ministranta nie zostaną zapisane.\nCzy chcesz kontynuować?").then((result) => {
                    resolve(result);
                })
            }
            else
            {
                resolve(true)
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
                wybor.push(new Date(wydarzenie.godzina).toString().slice(16,21));
            })

            this.modal.showModal(WyborModalComponent,{
                context: wybor,
                viewContainerRef:  this.vcRef,
                fullscreen: false,
                stretched: false,
                animated:  false,
                closeCallback: null,
                dimAmount: 0.8 // Sets the alpha of the background dim,

              } as ExtendedShowModalOptions).then((result) => {
                if(result !== undefined)
                {
                    let ktoreWydarzenie = opcje[result];
                    this.wydarzeniaMinistranta[ktoreWydarzenie.dzien_tygodnia] = ktoreWydarzenie;
                    this.zmiana = true;
                }
            });
        }
        else
        {
            this.ui.showFeedback('warning',"Brak wydarzeń w tym dniu",2)
            return;
        }
    }

    zapisz()
    {
        this.ui.zmienStan(5,true)
        this.ui.zmienStan(4,true)
        this.parafiaService.zapiszDyzury(this.wydarzeniaMinistranta, this.stareWydarzeniaMinistranta).then(res => {
            if(res === 1)
            {
                setTimeout(() => {
                    this.ui.showFeedback('succes',"Zapisano dyżury",2)
                }, 400)
                this.ui.zmienStan(5,false)
                this.ui.zmienStan(4,false)
                this.zmiana = false;
                this.anuluj()
            }
            else if(res === 404)
            {
                this.ui.sesjaWygasla()
                this.ui.zmienStan(4,false)
                this.ui.zmienStan(5,false)
            }
            else
            {
                this.ui.zmienStan(4,false)
                this.ui.zmienStan(5,false)
                this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
            }
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
            return new Date(this.wydarzeniaMinistranta[index].godzina).toString().slice(16,21);
        }
    }
}
