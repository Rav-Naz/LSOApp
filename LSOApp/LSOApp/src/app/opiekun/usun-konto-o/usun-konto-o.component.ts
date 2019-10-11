import { Component, OnInit } from '@angular/core';
import { Page, isIOS, Color } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TabindexService } from '~/app/serwisy/tabindex.service';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { Feedback, FeedbackType} from "nativescript-feedback";

@Component({
  selector: 'ns-usun-konto-o',
  templateUrl: './usun-konto-o.component.html',
  styleUrls: ['./usun-konto-o.component.css'],
  moduleId: module.id,
})
export class UsunKontoOComponent implements OnInit {
    private feedback: Feedback;

    constructor(private page: Page, private router: RouterExtensions, private tabIndexService: TabindexService) {
        this.feedback = new Feedback();
    }

    hasloValid: boolean = true;
    form: FormGroup;
    _haslo: string;

  ngOnInit() {
    this.page.actionBarHidden = true;

    this.form = new FormGroup({
        haslo: new FormControl(null, { updateOn: 'change', validators: [Validators.required, Validators.minLength(1)] })
    });

    this.form.get('haslo').statusChanges.subscribe(status => {
      this.hasloValid = status === 'VALID';
  });
  }

  zapisz() {

    this._haslo = this.form.get('haslo').value;

    //Sprawdzanie czy wpisane hasło jest poprawne

    this.router.navigate([""],{clearHistory: true, transition: { name: 'slideBottom' }}).then(() => {
          setTimeout(() => {
            this.feedback.show({
                title: "Sukces!",
                message: "Konto zostało usunięte pomyślnie. Dziękujemy za skorzystanie z aplikacji :)",
                titleFont: isIOS ? "Audiowide" : "Audiowide-Regular.ttf",
                messageFont: isIOS ? "Lexend Deca" : "LexendDeca-Regular.ttf",
                duration: 3000,
                backgroundColor: new Color(255,49, 155, 49),
                type: FeedbackType.Success,
              });
        }, 400)
    });
}

anuluj() {
    this.tabIndexService.nowyOutlet(6,"ustawieniaO");
    this.router.backToPreviousPage();
}

onSwipe(args: SwipeGestureEventData) {

    if (args.direction === 1) {
        this.anuluj();
    }
}

}
