import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Page} from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TextField } from 'tns-core-modules/ui/text-field/text-field';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { UserService } from '~/app/serwisy/user.service';
import { UiService } from '~/app/serwisy/ui.service';


@Component({
    selector: 'ns-zmien-haslo-m',
    templateUrl: './zmien-haslo-m.component.html',
    styleUrls: ['./zmien-haslo-m.component.css'],
    moduleId: module.id,
})
export class ZmienHasloMComponent implements OnInit {

    constructor(private page: Page, private router: RouterExtensions, private tabIndexService: TabindexService,
        private userService: UserService, private ui: UiService) {}

    form: FormGroup;

    stareValid: boolean = true;
    noweValid: boolean = true;
    powtorzValid: boolean = true;

    _stare: string;
    _nowe: string;
    _powtorz: string;

    @ViewChild('stare', { static: false }) stareRef: ElementRef<TextField>;
    @ViewChild('nowe', { static: false }) noweRef: ElementRef<TextField>;
    @ViewChild('powtorz', { static: false }) powtorzRef: ElementRef<TextField>;

    ngOnInit() {
        this.page.actionBarHidden = true;

        this.form = new FormGroup({
            stare: new FormControl(null, { updateOn: 'change', validators: [Validators.required] }),
            nowe: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.pattern('([A-ZĘÓĄŚŁŻŹĆŃa-zęóąśłżźćń0-9+*@#$&^~?_]{6,15})')]}),
            powtorz: new FormControl(null, { updateOn: 'change', validators: [Validators.required]})
        })

        this.form.get('stare').statusChanges.subscribe(status => {
            this.stareValid = status === 'VALID';
        });
        this.form.get('nowe').statusChanges.subscribe(status => {
            this.noweValid = status === 'VALID';
        });
        this.form.get('powtorz').statusChanges.subscribe(status => {
            this.powtorzValid = status === 'VALID';
        });
    }

    zapisz() {

        if(!this.form.valid)
        {
            this.ui.showFeedback('error',"Formularz nie jest poprawny",3)
            return;
        }

        this._stare = this.form.get('stare').value;
        this._nowe = this.form.get('nowe').value;
        this._powtorz = this.form.get('powtorz').value;

        if(this._nowe !== this._powtorz)
        {
            this.powtorzValid = false;
            return;
        }

        this.ui.zmienStan(4,true)

        this.userService.zmienHaslo(this._stare,this._nowe).then(res => {
            switch (res) {
                case 1:
                    setTimeout(() => {
                        this.ui.showFeedback('succes',"Hasło zostało zmienione",3)
                  }, 400)

                  this.anuluj();
                    break;
                case 2:
                        this.ui.showFeedback('warning',"Aktualne hasło nie jest poprawne",3)
                    break;
                case 0:
                        this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    break;
                default:
                        this.ui.showFeedback('error',"Sprawdź swoje połączenie z internetem i spróbuj ponownie ",3)
                    break;
            }
            this.ui.zmienStan(4,false)
        })
    }

    anuluj() {
        this.tabIndexService.nowyOutlet(6,"ustawieniaO")
        this.router.back();
    }

    dismiss()
    {
        this.noweRef.nativeElement.dismissSoftInput()
    }
}
