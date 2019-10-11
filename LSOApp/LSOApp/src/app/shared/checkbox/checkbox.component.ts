import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'ns-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css'],
  moduleId: module.id,
})
export class CheckboxComponent{

    @Output() checkStatus = new EventEmitter<boolean>();

    @Input() stan:boolean;

    zmien()
    {
        this.stan = !this.stan;
        this.checkStatus.emit(this.stan);
    }


}
