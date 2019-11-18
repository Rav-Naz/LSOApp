import { Component, ElementRef, ViewChild, OnInit, ViewContainerRef } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TabindexService } from '../serwisy/tabindex.service';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { Feedback, FeedbackType } from "nativescript-feedback";
import { SecureStorage } from 'nativescript-secure-storage';
import { LogowanieJakoComponent } from '../shared/modale/logowanie-jako/logowanie-jako.component';
import { ModalDialogService } from 'nativescript-angular/modal-dialog';
import { ExtendedShowModalOptions } from 'nativescript-windowed-modal';
import { HttpService } from '../serwisy/http.service';
import { UserService } from '../serwisy/user.service';
import { User } from '../serwisy/user.model';
import { ParafiaService } from '../serwisy/parafia.service';

@Component({
    selector: 'ns-logowanie',
    templateUrl: './logowanie.component.html',
    styleUrls: ['./logowanie.component.css'],
    moduleId: module.id,
})
export class LogowanieComponent implements OnInit {

    form: FormGroup;

    @ViewChild('email', { static: false }) emailRef: ElementRef<TextField>;
    @ViewChild('haslo', { static: false }) hasloRef: ElementRef<TextField>;

    _email: string;
    _haslo: string;

    emailValid = true;
    hasloValid = true;

    private feedback: Feedback;

    constructor(private router: RouterExtensions, private tabIndexService: TabindexService,
         private page: Page, private modal: ModalDialogService, private vcRef: ViewContainerRef,
          private http: HttpService, private userService: UserService, private parafiaService: ParafiaService) {
            this.feedback = new Feedback();
         }

    ngOnInit() {
        this.page.actionBarHidden = true;

        let secureStorage = new SecureStorage;

        secureStorage.clearAllOnFirstRunSync()

        this.form = new FormGroup({
            email: new FormControl(null, { updateOn:'change', validators: [Validators.required, Validators.email] }),
            haslo: new FormControl(null, { updateOn: 'change', validators: [Validators.required] })
        });

        this.form.get('email').statusChanges.subscribe(status => {
            this.emailValid = status === 'VALID';
        });
        this.form.get('haslo').statusChanges.subscribe(status => {
            this.hasloValid = status === 'VALID';
        });
    }


    zapomnialem() {
        this.router.navigate(['/zapomnialem'], { transition: { name: 'slideBottom' } });
    }

    zaloguj()
    {
       this._email = this.form.get('email').value;
       this._haslo= this.form.get('haslo').value;

       this.http.logowanie(this._email,this._haslo).then(res => {
           if(res === 'brak' || res === 'niepoprawne')
           {
            this.feedback.show({
                title: "Uwaga!",
                message: "Niepoprawny adres e-mail i/lub hasło",
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 3000,
                backgroundColor: new Color(255, 255, 207, 51),
                type: FeedbackType.Warning,

            });
           }
           else if(res === 'nieaktywne')
           {
            this.feedback.show({
                title: "Uwaga!",
                message: "Musisz najpierw aktywować konto aby móc się zalogować",
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 3000,
                backgroundColor: new Color(255, 255, 207, 51),
                type: FeedbackType.Warning,
            });
           }
           else if( res === 'blad')
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
           else
           {
               let user: User = JSON.parse(JSON.stringify(res))
               this.userService.zmienUsera(user);
               this.http.nadajId_Parafii(user.id_parafii);
               this.http.nadajId_User(user.id_user);

               if(user.admin === 1)
               {
                this.modal.showModal(LogowanieJakoComponent, {
                    context: null,
                    viewContainerRef: this.vcRef,
                    fullscreen: false,
                    stretched: false,
                    animated: true,
                    closeCallback: null,
                    dimAmount: 0.8 // Sets the alpha of the background dim,

                } as ExtendedShowModalOptions).then((result) => {

                    if(result !== undefined)
                    {
                        if(result === 1)
                        {
                            this.tabIndexService.zmianaOpiekuna(true).then(resss => {
                                if(resss === 1)
                            {
                                this.parafiaService.pobierzParafie().then(res => {
                                    if(res === 1)
                                    {
                                        this.router.navigate(['/menu'], { transition: { name: 'slideTop' }, clearHistory: true });
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
                        else if(result === 0)
                        {

                        this.tabIndexService.zmianaOpiekuna(false).then(res => {
                            if(res === 1)
                            {
                                this.router.navigate(['/menu'], { transition: { name: 'slideTop' }, clearHistory: true });
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
                    }
                });
               }
               else
               {
                this.tabIndexService.zmianaOpiekuna(false).then(res => {
                    if(res === 1)
                    {
                        this.router.navigate(['/menu'], { transition: { name: 'slideTop' }, clearHistory: true });
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
           }
       })

    }

    doRejestracji()
  {
      this.router.navigate(['/rejestracja'], {transition: {name: 'slideLeft'}});
  }

  nadajHaslo()
  {
    this.router.navigate(['/nadaj-haslo'], {transition: {name: 'slideRight'}});
  }



    onSwipe(args: SwipeGestureEventData) {

        if (args.direction === 1) {
            this.nadajHaslo();
        }
        else if(args.direction === 2)
        {
            this.doRejestracji();
        }
        else if(args.direction === 8)
        {
            this.zapomnialem();
        }
    }
}


