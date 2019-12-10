import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { Page } from 'tns-core-modules/ui/page/page';
import { UserService } from '~/app/serwisy/user.service';
import { User } from '~/app/serwisy/user.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { Subscription } from 'rxjs';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { PotwierdzenieModalComponent } from '~/app/shared/modale/potwierdzenie-modal/potwierdzenie-modal.component';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { UiService } from '~/app/serwisy/ui.service';

@Component({
  selector: 'ns-dane-profilowe',
  templateUrl: './dane-profilowe.component.html',
  styleUrls: ['./dane-profilowe.component.css'],
  moduleId: module.id,
})
export class DaneProfiloweComponent implements OnInit {


  constructor(private router: RouterExtensions, private page: Page, private userService: UserService,
     private modal: ModalDialogService, private vcRef: ViewContainerRef, private ui: UiService) {}

    user: User;
    userSub: Subscription;

    form: FormGroup;

    @ViewChild('telefon', { static: false }) telefonRef: ElementRef<TextField>;
    @ViewChild('ulica', { static: false }) ulicaRef: ElementRef<TextField>;
    @ViewChild('kod', { static: false }) kodRef: ElementRef<TextField>;
    @ViewChild('miasto', { static: false }) miastoRef: ElementRef<TextField>;

    _telefon: string;
    _ulica: string;
    _kod: string;
    _miasto: string;

    telefonValid = true;
    ulicaValid = true;
    kodValid = true;
    miastoValid = true;

    zmiana = false;

  ngOnInit() {
    this.page.actionBarHidden = true;
    this.userSub = this.userService.UserSub.subscribe(user => {
        this.user = user;
    });

    this.form = new FormGroup({
        telefon: new FormControl(this.user.telefon, { updateOn: 'change', validators: [Validators.required, Validators.pattern('^[0-9]{9}$')]}),
        ulica: new FormControl(this.user.ulica, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń -]{3,30})')] }),
        kod: new FormControl(this.user.kod_pocztowy, { updateOn: 'change', validators: [Validators.required, Validators.pattern('^[0-9]{2}-[0-9]{3}$')] }),
        miasto: new FormControl(this.user.miasto, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń -]{3,20})')] })
    });

    this.form.get('telefon').statusChanges.subscribe(status => {
        this.zmiana = true;
        this.telefonValid = status === 'VALID';
    });
    this.form.get('ulica').statusChanges.subscribe(status => {
        this.zmiana = true;
        this.ulicaValid = status === 'VALID';
    });
    this.form.get('kod').statusChanges.subscribe(status => {
        this.zmiana = true;
        this.kodValid = status === 'VALID';
    });
    this.form.get('miasto').statusChanges.subscribe(status => {
        this.zmiana = true;
        this.miastoValid = status === 'VALID';
    });
  }

    async zamknij()
    {
        await this.czyKontynuowac(this.zmiana).then((kontynuowac) => {
            if(!kontynuowac)
            {
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
                    context: "Zmienione dane profilowe nie zostaną zapisane.\nCzy chcesz kontynuować?",
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

    zmien()
    {
        this._telefon = this.form.get('telefon').value;
        this._ulica = this.form.get('ulica').value;
        this._kod = this.form.get('kod').value;
        this._miasto = this.form.get('miasto').value;

        if(!this.form.valid)
        {
            this.ui.showFeedback('error',"Formularz nie jest poprawny",3)
            return;
        }

        this.userService.zmienDane(this._telefon,this._ulica,this._kod,this._miasto).then(res => {
            if(res === 1)
            {
                setTimeout(() => {
                    this.ui.showFeedback('succes',"Dane zostały zmienione",3)
                }, 400)

                this.zmiana = false;

                this.zamknij();
            }
            else
            {
                this.ui.showFeedback('error', "Wystąpił nieoczekiwany błąd",3)
            }
        })

    }

    dismiss()
    {
        this.ulicaRef.nativeElement.dismissSoftInput()
    }
}


