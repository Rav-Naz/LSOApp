import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TabindexService } from '../serwisy/tabindex.service';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { Page } from 'tns-core-modules/ui/page/page';
import { SecureStorage } from 'nativescript-secure-storage';

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

    constructor(private router: RouterExtensions, private tabIndexService: TabindexService, private page: Page) { }

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
        this.router.navigate(['/zapomnialem'], { transition: { name: 'slideRight' } });
    }

    zaloguj(kto: boolean)
    {
        // if(!this.form.valid)
        // {
        //     return;
        // }
        this.tabIndexService.opiekun = kto;

       this._email = this.form.get('email').value;
       this._haslo= this.form.get('haslo').value;

       this.tabIndexService.nowyIndex(0);
       this.router.navigate(['/menu'], { transition: { name: 'slideTop' }, clearHistory: true });
    }

    doRejestracji()
  {
      this.router.navigate(['/rejestracja'], {transition: {name: 'slideLeft'}});
  }

    onSwipe(args: SwipeGestureEventData) {

        if (args.direction === 1) {
            this.zapomnialem();
        }
        else if(args.direction === 2)
        {
            this.doRejestracji();
        }
    }
}


