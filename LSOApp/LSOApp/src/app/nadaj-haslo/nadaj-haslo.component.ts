import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { RouterExtensions } from 'nativescript-angular/router';
import { Page} from 'tns-core-modules/ui/page/page';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { HttpService } from '../serwisy/http.service';
import { UiService } from '../serwisy/ui.service';
@Component({
  selector: 'ns-nadaj-haslo',
  templateUrl: './nadaj-haslo.component.html',
  styleUrls: ['./nadaj-haslo.component.css'],
  moduleId: module.id,
})
export class NadajHasloComponent implements OnInit {

  form: FormGroup;
  ladowanie: boolean = false;

    @ViewChild('email', { static: false }) emailRef: ElementRef<TextField>;
    @ViewChild('kod', { static: false }) kodRef: ElementRef<TextField>;
    @ViewChild('haslo', { static: false }) hasloRef: ElementRef<TextField>;
    @ViewChild('powtorz', { static: false }) powtorzRef: ElementRef<TextField>;

    emailValid: boolean = true;
    kodValid: boolean = true;
    hasloValid: boolean = true;
    powtorzValid: boolean = true;

    wyslanePrzyp: boolean = false;

    constructor(private router: RouterExtensions, private page: Page, private httpService: HttpService, private ui: UiService) {}

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.form = new FormGroup({
            email: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.email] }),
            kod: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([0-9]{6})')] }),
            haslo: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń0-9+*@#$&^~?_]{6,15})')] }),
            powtorz: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
        });


        this.form.get('email').statusChanges.subscribe(status => {
            this.emailValid = status === 'VALID';
        });
        this.form.get('kod').statusChanges.subscribe(status => {
            this.kodValid = status === 'VALID';
        });
        this.form.get('haslo').statusChanges.subscribe(status => {
            this.hasloValid = status === 'VALID';
        });
        this.form.get('powtorz').statusChanges.subscribe(status => {
            this.powtorzValid = status === 'VALID';
        });
    }

    powrot() {
        this.router.back();
    }

    wyslij() {
        this.powtorzRef.nativeElement.dismissSoftInput()
        if (!this.form.valid) {
            this.ui.showFeedback('warning',"Wprowadź poprawny adres e-mail",3)
            return;
        }
        if (this.form.get('haslo').value !== this.form.get('powtorz').value) {
            this.powtorzValid = false;
            return;
        }
        let email = this.form.get('email').value;
        let kod = this.form.get('kod').value;
        let haslo = this.form.get('haslo').value;

        this.ladowanie = true;

        this.httpService.aktywacjaUsera(email,kod,haslo).then((res) => {
            if(res === 'nieistnieje')
                {
                    this.ui.showFeedback('warning',"Brak konta z przypisanym danym adresem e-mail",3)
                }
                else if(res === 'niepoprawny')
                {
                    this.ui.showFeedback('warning',"Wprowadzony kod aktywacyjny jest niepoprawny",3)
                }
                else if(res === 'niemakodu' || res === 'wygaslo')
                {
                    this.ui.showFeedback('warning',"Kod aktywacyjny nie został jeszcze wygenerowany lub wygasł",3)
                }
                else if(res.hasOwnProperty('changedRows'))
                {
                    this.powrot()
                    setTimeout(() => {
                        this.ui.showFeedback('succes',"Hasło do konta zostało nadane! Możesz sie teraz zalogować",3)
                    }, 200)
                }
                else
                {
                    this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                }
                this.ladowanie = false;
        })

    }

    onSwipe(args: SwipeGestureEventData) {

        if (args.direction === 2) {
            this.powrot();
        }
    }

    nic()
    {

    }

    dismiss()
    {
        this.emailRef.nativeElement.dismissSoftInput()
    }

}
