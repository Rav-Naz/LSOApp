import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CheckboxStatus } from './checkbox-status.model';

@Component({
  selector: 'ns-checkbox-status',
  templateUrl: './checkbox-status.component.html',
  styleUrls: ['./checkbox-status.component.css'],
  moduleId: module.id,
})
export class CheckboxStatusComponent{

    @Output() checkStatus = new EventEmitter<CheckboxStatus>();

    @Input() status;

    @Input() trzyStany = true;

    zmien()
    {
      if(this.status === 1 && this.trzyStany)
      {
        this.status = CheckboxStatus.Nieobecny;
      }
      else if(this.status === 1)
      {
        this.status = null
      }
      else if(this.status === 0)
      {
        this.status = null
      }
      else
      {
        this.status = CheckboxStatus.Obecny;
      }

        this.checkStatus.emit(this.status);
    }
}
