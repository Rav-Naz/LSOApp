import { Component, OnInit, ViewContainerRef, ViewChild, ElementRef } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { ParafiaService } from '~/app/serwisy/parafia.service';
import { User } from '~/app/serwisy/user.model';
import { RouterExtensions } from 'nativescript-angular/router';
import { Subscription } from 'rxjs';
import { Wydarzenie } from '~/app/serwisy/wydarzenie.model';
import { WydarzeniaService } from '~/app/serwisy/wydarzenia.service';
import { Stopien } from '~/app/serwisy/stopien.model';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { FeedbackType, Feedback } from 'nativescript-feedback';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { WyborModalComponent } from '~/app/shared/modale/wybor-modal/wybor-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '~/app/serwisy/user.service';


@Component({
    selector: 'ns-ministrant-szczegoly',
    templateUrl: './ministrant-szczegoly.component.html',
    styleUrls: ['./ministrant-szczegoly.component.css'],
    moduleId: module.id,
})
export class MinistrantSzczegolyComponent implements OnInit {

    private feedback: Feedback;


    constructor(private page: Page, private parafiaService: ParafiaService, private router: RouterExtensions,public userService: UserService ,private tabIndexService: TabindexService, private modal: ModalDialogService, private vcRef: ViewContainerRef, private active: ActivatedRoute) {
        this.feedback = new Feedback();
    }
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

    ngOnInit() {
        this.PROSub = this.tabIndexService.PRO.subscribe(listaOutletow => {
            this.PROLista = listaOutletow;
        })

        this.parafiaService.WybranyMinistrant(this.parafiaService.aktualnyMinistrantId);

        this.podgladMinistranta = this.parafiaService.PodgladMinistranta.subscribe(min => {
            if(min !== undefined && min !== null)
            {
                this.ministrant = min
                this.checked = this.ministrant.admin;
            }
        })

        this.page.actionBarHidden = true;

        this.zmiana = false;

        this.parafiaService.wyszukajDyzury(this.parafiaService.aktualnyMinistrantId);

        this.dyzurSub = this.parafiaService.DyzuryMinistranta.subscribe(lista_dyzurow => {

            if(lista_dyzurow === null || lista_dyzurow === undefined)
            {
                return
            }

            this.dyzury = lista_dyzurow
            // if (lista_dyzurow.length === 0) {
            //     return;
            // }
            // lista_dyzurow.forEach(dyzur => {
            //     this.dyzury.push(this.wydarzeniaService.wybraneWydarzenie(dyzur.id_wydarzenia));
            // });
            this.dyzury.sort((wyd1, wyd2) => {
                if (wyd1.dzien_tygodnia > wyd2.dzien_tygodnia) {
                    return 1;
                }
                if (wyd1.dzien_tygodnia < wyd2.dzien_tygodnia) {
                    return -1;
                }
                return 0;
            })
        });
        this.form = new FormGroup({
            punkty: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('^[-0-9]{1,4}$')] }),
        });
    }

    async zamknij() {

        await this.czyKontynuowac(this.zmiana).then((kontynuowac) => {
            if (!kontynuowac) {
                this.tabIndexService.nowyOutlet(4, 'ministranci')
                this.router.back();
                this.parafiaService.odswiezListeMinistrantow();
            }
        });

    }

    private czyKontynuowac(zmiana: boolean) {
        return new Promise<boolean>((resolve) => {
            if (zmiana === true) {
                this.modal.showModal(PotwierdzenieModalComponent, {
                    context: "Zmienione dane tego ministranta nie zostaną zapisane.\nCzy chcesz kontynuować?",
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

    otworzDyzury() {
        if (this.PROLista[6] === 'edytuj-msze' || this.PROLista[6] === 'punktacja') {
            this.feedback.show({
                title: "Uwaga!",
                message: this.PROLista[6] === 'edytuj-msze'? 'Aby skorzystać z tego widoku musisz zamknąć panel Edytuj Msze Święte' : 'Aby skorzystać z tego widoku musisz zamknąć panel Punktacja',
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 3000,
                backgroundColor: new Color(255, 255, 207, 51),
                type: FeedbackType.Warning,
            });
            return;
        }
        this.tabIndexService.nowyOutlet(4, 'ministrant-dyzury')
        this.router.navigate(['../ministrant-dyzury'], {relativeTo: this.active, transition: { name: 'slideLeft' }});

    }

    aktywujKonto() {
        if (this.ministrant.aktywny === 0) {
            if(this.ministrant.email !== null)
            {
                this.parafiaService.wyslanyEmail = true;
            }
            else
            {
                this.parafiaService.wyslanyEmail = false;
            }
            this.tabIndexService.nowyOutlet(4, 'aktywacja-konta')
            this.router.navigate(['../aktywacja-konta'], {relativeTo: this.active, transition: { name: 'slideLeft' }});
        }
        else {
            this.feedback.show({
                title: "Uwaga!",
                message: "Konto ministranta już zostało aktywowane",
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 3000,
                backgroundColor: new Color(255, 255, 207, 51),
                type: FeedbackType.Warning,
            });
            return;
        }
    }

    zmienPunkty(punkty: number) {
        this.wpiszPunkty();
        this.ministrant.punkty += punkty;
    }

    dyzurHeader(dzien_tygodnia: number) {
        return this.DzienTyg[dzien_tygodnia] + ' ';
    }

    stopien(stopien: number) {
        return Stopien[stopien];
    }

    zmienStopien(ministrant: User) {
        this.displayActionDialog(ministrant)
    }

    displayActionDialog(ministrant: User) {

        let lista = ["Kandydat", "Ministrant Ołtarza", "Choralista", "Ministrant Światła", "Ministrant Krzyża", "Ministrant Księgi", "Ministrant Kadzidła", "Ministrant Wody", "Lektor", "Ceremoniarz", "Szafarz", "Ksiądz", "Opiekun"]

        this.modal.showModal(WyborModalComponent, {
            context: lista,
            viewContainerRef: this.vcRef,
            fullscreen: false,
            stretched: false,
            animated: true,
            closeCallback: null,
            dimAmount: 0.8 // Sets the alpha of the background dim,

        } as ExtendedShowModalOptions).then((result) => {
            if (result !== undefined) {
                ministrant.stopien = result;
                this.zmiana = true;
            }
        });
    }

    zapisz() {
        this.wpiszPunkty();
        this.parafiaService.updateMinistranta(this.ministrant).then(res => {
            if(res === 1)
            {
                setTimeout(() => {
                    this.feedback.show({
                        title: "Sukces!",
                        message: "Zapisano zmiany",
                        titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                        messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                        duration: 2000,
                        backgroundColor: new Color(255, 49, 155, 49),
                        type: FeedbackType.Success,
                    });
                }, 400)
                this.zmiana = false;
                this.zamknij()
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

    wpiszPunkty()
    {
        this.punkty.nativeElement.dismissSoftInput();
        this.ministrant.punkty = parseInt(this.form.get('punkty').value)
        this.zmiana = true;
    }

    nadajPrawa(event: number)
    {
        if(this.ministrant.id_user === this.userService.UserID)
        {
            this.feedback.show({
                title: "Uwaga!",
                message: "Nie możesz sam sobie oderbrać praw administratora",
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 3000,
                backgroundColor: new Color(255, 255, 207, 51),
                type: FeedbackType.Warning,
            });
            return;
        }
        else
        {
            if(event === 1)
            {
                this.checked = this.ministrant.admin = 0;
            }
            else
            {
                this.checked = this.ministrant.admin = 1;
            }
            this.zmiana = true;
        }
    }

}
