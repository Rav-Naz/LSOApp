import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { RouterExtensions } from 'nativescript-angular/router';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { Page } from 'tns-core-modules/ui/page/page';
import { HttpService } from '../serwisy/http.service';
import { UiService } from '../serwisy/ui.service';


@Component({
    selector: 'ns-zapomnialem',
    templateUrl: './zapomnialem.component.html',
    styleUrls: ['./zapomnialem.component.css'],
    moduleId: module.id,
})
export class ZapomnialemComponent implements OnInit {

    ladowanie: boolean = false;

    form: FormGroup;

    @ViewChild('email', { static: false }) emailRef: ElementRef<TextField>;

    emailValid: boolean = true;
    btnEnabled: boolean = false;

    wyslanePrzyp: boolean = false;

    constructor(private router: RouterExtensions, private page: Page, private httpService: HttpService, private ui: UiService) {}

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.form = new FormGroup({
            email: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.email] })
        });


        this.form.get('email').statusChanges.subscribe(status => {
            this.emailValid = status === 'VALID';
            if (this.emailValid) {
                this.btnEnabled = true;
            }
            else {
                this.btnEnabled = false;
            }
        });
    }

    powrot() {
        this.router.back();
    }

    wyslij() {
        if (!this.form.valid) {
            this.ui.showFeedback('warning',"Wprowadź poprawny adres e-mail",3)
            return;
        }

        let email = this.form.get('email').value

        this.ladowanie = true;

        this.httpService.przypomnij(email).then(res => {
            this.ladowanie = false;
            if(res === 1)
            {
                this.powrot()
                    setTimeout(() => {
                        this.ui.showFeedback('succes',"Kod do zmiany hasła został wysłany na adres e-mail: " + email,3)
                    }, 200)
            }
            else
            {
                this.ui.showFeedback('warning',"Brak konta z przypisanym danym adresem e-mail",3)
                  return
            }
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
