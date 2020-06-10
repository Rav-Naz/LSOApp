import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Page} from 'tns-core-modules/ui/page/page';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { User } from '~/app/serwisy/user.model';
import { RouterExtensions } from 'nativescript-angular/router';
import { Subscription } from 'rxjs';
import { Wydarzenie } from '~/app/serwisy/wydarzenie.model';
import { Stopien } from '~/app/serwisy/stopien.model';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { WyborModalComponent } from '~/app/shared/modale/wybor-modal/wybor-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '~/app/serwisy/user.service';
import { UiService } from '~/app/serwisy/ui.service';
import { lista } from '~/app/serwisy/stopien.model'


@Component({
    selector: 'ns-ministrant-szczegoly',
    templateUrl: './ministrant-szczegoly.component.html',
    styleUrls: ['./ministrant-szczegoly.component.css'],
    moduleId: module.id,
})
export class MinistrantSzczegolyComponent implements OnInit, AfterViewInit {



    constructor(private page: Page, private parafiaService: ParafiaService, private router: RouterExtensions,public userService: UserService
        ,private tabIndexService: TabindexService, private modal: ModalDialogService, private vcRef: ViewContainerRef,
         private active: ActivatedRoute, public ui: UiService) {}

    form: FormGroup;
    zmiana: boolean;
    ministrant: User = { id_user:0, id_diecezji:0, id_parafii: 0, punkty: 0, stopien: 0, imie: "", nazwisko: "", ulica: null, kod_pocztowy: null, miasto: null, email: null, telefon: null, aktywny: 0, admin: 0, ranking: 0};
    dyzury: Array<Wydarzenie> = [];
    checked: number = 0;
    dyzurSub: Subscription;
    podgladMinistranta: Subscription;
    PROSub: Subscription;
    PROLista: Array<string> = [];
    DzienTyg = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

    @ViewChild('punkty', { static: false }) punkty: ElementRef<TextField>;
    @ViewChild('imie', { static: false }) imieRef: ElementRef<TextField>;
    @ViewChild('nazwisko', { static: false }) nazwiskoRef: ElementRef<TextField>;

    ngOnInit() {
        this.ui.zmienStan(5,true)
        this.PROSub = this.tabIndexService.PRO.subscribe(listaOutletow => {
            this.PROLista = listaOutletow;
        })

        //Wybrany ministrant
        this.parafiaService.WybranyMinistrant(this.parafiaService.aktualnyMinistrantId).then(res => {
            if(res === 0)
            {
                this.ui.zmienStan(5,true)
                this.ui.zmienStan(1,true)
                setTimeout(() => {
                    this.ui.sesjaWygasla()
                    this.ui.zmienStan(5,false)
                    this.ui.zmienStan(1,false)
                },1000)
                this.tabIndexService.nowyOutlet(4, 'ministranci')
                this.router.back();
                return
            }
        });


        this.podgladMinistranta = this.parafiaService.PodgladMinistranta.subscribe(min => {
            if(min !== undefined && min !== null)
            {
                this.ministrant = min
                this.checked = this.ministrant.admin;
                setTimeout(() => {
                    this.imieRef.nativeElement.text = this.ministrant.imie
                    this.nazwiskoRef.nativeElement.text = this.ministrant.nazwisko
                },100)
            }
        })

        this.page.actionBarHidden = true;

        this.zmiana = false;

        this.parafiaService.wyszukajDyzury(this.parafiaService.aktualnyMinistrantId);

        this.dyzurSub = this.parafiaService.DyzuryMinistranta.subscribe(lista_dyzurow => {

            if(lista_dyzurow === null || lista_dyzurow === undefined)
            {
                setTimeout(() => {
                    this.ui.zmienStan(5,false)
                },500)
                return
            }

            this.dyzury = lista_dyzurow

            this.dyzury.sort((wyd1, wyd2) => {
                if (wyd1.dzien_tygodnia > wyd2.dzien_tygodnia) {
                    return 1;
                }
                if (wyd1.dzien_tygodnia < wyd2.dzien_tygodnia) {
                    return -1;
                }
                return 0;
            })
            setTimeout(() => {
                this.ui.zmienStan(5,false)
            },500)
        });
        this.form = new FormGroup({
            punkty: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('^[-0-9]{1,4}$')] }),
            imie: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃ][A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń ]{1,20})')] }),
            nazwisko: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃ][A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń-]{1,20})')] }),
        });
    }

    ngAfterViewInit(): void {
        if(this.ministrant !== undefined && this.ministrant !== null)
            {
                this.imieRef.nativeElement.text = this.ministrant.imie
                this.nazwiskoRef.nativeElement.text = this.ministrant.nazwisko
            }

    }

    async zamknij() {

        await this.czyKontynuowac(this.zmiana).then((kontynuowac) => {
            if (kontynuowac) {
                this.tabIndexService.nowyOutlet(4, 'ministranci')
                this.router.back();
            }
        });

    }

    private czyKontynuowac(zmiana: boolean) {
        return new Promise<boolean>((resolve) => {
            if (zmiana === true) {
               this.ui.pokazModalWyboru("Dane o dyżurach dla tego ministranta nie zostaną zapisane.\nCzy chcesz kontynuować?").then((result) => {
                   resolve(result);
               })
            }
            else {
                resolve(true)
            }
        })
    }


    otworzDyzury() {
        this.ui.zmienStan(4,true)
        if (this.PROLista[6] === 'edytuj-msze' || this.PROLista[6] === 'punktacja') {
            this.ui.showFeedback('warning',this.PROLista[6] === 'edytuj-msze'? 'Aby skorzystać z tego widoku musisz zamknąć panel Edytuj Msze Święte' : 'Aby skorzystać z tego widoku musisz zamknąć panel Punktacja',3)
            return;
        }
        this.tabIndexService.nowyOutlet(4, 'ministrant-dyzury')
        this.router.navigate(['../ministrant-dyzury'], {relativeTo: this.active, transition: { name: 'slideLeft' }});
        this.ui.zmienStan(4,false)

    }

    aktywujKonto() {
        this.ui.zmienStan(4,true)
        this.parafiaService.wyslanyEmail = {email: this.ministrant.email, aktywny: this.ministrant.aktywny, id_user: this.ministrant.id_user};

        this.tabIndexService.nowyOutlet(4, 'aktywacja-konta')
        this.router.navigate(['../aktywacja-konta'], {relativeTo: this.active, transition: { name: 'slideLeft' }});
        this.ui.zmienStan(4,false)
    }

    zmienPunkty(punkty: number) {
        this.wpiszPunkty();
        this.zmiana = true;
        this.ministrant.punkty += punkty;
    }

    dyzurHeader(dzien_tygodnia: number) {
        return this.DzienTyg[dzien_tygodnia] + ' ';
    }

    stopien(stopien: number) {
        return Stopien[stopien];
    }

    data(value: string)
    {
        let data = new Date(value)
        return data.toString().slice(16,21);
    }

    zmienStopien(ministrant: User) {
        this.displayActionDialog(ministrant)
    }

    displayActionDialog(ministrant: User) {

        this.modal.showModal(WyborModalComponent, {
            context: lista,
            viewContainerRef: this.vcRef,
            fullscreen: false,
            stretched: false,
            animated: false,
            closeCallback: null,
            dimAmount: 0.8 // Sets the alpha of the background dim,

        } as ExtendedShowModalOptions).then((result) => {
            if (result !== undefined) {
                ministrant.stopien = (result === 11? 12 : result);
                this.zmiana = true;
            }
        });
    }

    zapisz() {
        this.zmiana = false;
        this.ui.zmienStan(5,true)
        this.ui.zmienStan(1,true);
        this.wpiszPunkty();
        this.parafiaService.updateMinistranta(this.ministrant).then(res => {
            if(res === 1)
            {
                setTimeout(() => {
                    this.ui.showFeedback('succes',"Zapisano zmiany",2)
                }, 400)
                this.zamknij()
            }
            else if(res === 404)
            {
                this.ui.sesjaWygasla()
                this.zmiana = true;
            }
            else
            {
                this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                this.zmiana = true;
            }
            this.ui.zmienStan(1,false)
            this.ui.zmienStan(5,false)
        })
    }

    wpiszPunkty()
    {
       // this.punkty.nativeElement.dismissSoftInput();
        if(this.ministrant.punkty !== parseInt(this.form.get('punkty').value))
        {
            this.ministrant.punkty = parseInt(this.form.get('punkty').value)
            this.zmiana = true;
        }
    }

    wpiszImieINazwisko()
    {
        //this.imieRef.nativeElement.dismissSoftInput()
        if(this.form.get('imie').value === this.ministrant.imie && this.form.get('nazwisko').value === this.ministrant.nazwisko)
        {
            return
        }
        if(this.form.get('imie').valid && this.form.get('nazwisko').valid)
        {
            this.ministrant.imie = this.form.get('imie').value
            this.ministrant.nazwisko = this.form.get('nazwisko').value
            this.zmiana = true
        }
        else
        {
            this.imieRef.nativeElement.text =  this.ministrant.imie
            this.nazwiskoRef.nativeElement.text =  this.ministrant.nazwisko
            this.ui.showFeedback('warning',"Wprowadzone dane nie są w poprawnej formie",3)
            return;
        }
    }

    nadajPrawa(event: number)
    {
        if(this.ministrant.id_user === this.userService.UserID)
        {
            this.ui.showFeedback('warning',"Nie możesz sam sobie oderbrać praw administratora",3)
            return;
        }
        else
        {
            if(event)
            {
                this.ministrant.admin = 1
            }
            else
            {
                this.ministrant.admin = 0
            }

            this.zmiana = true;
        }
    }

    dismiss()
    {
        return
        this.punkty.nativeElement.dismissSoftInput()
        this.wpiszPunkty()
        this.wpiszImieINazwisko()
    }

}
