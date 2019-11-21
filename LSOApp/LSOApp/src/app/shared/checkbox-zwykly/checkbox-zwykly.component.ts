import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'ns-checkbox-zwykly',
  templateUrl: './checkbox-zwykly.component.html',
  styleUrls: ['./checkbox-zwykly.component.css'],
  moduleId: module.id,
})
export class CheckboxZwyklyComponent{

    @Output() checkStatus = new EventEmitter<boolean>();

    @Input() stan:boolean;

    zmien()
    {
        this.stan = !this.stan;
        this.checkStatus.emit(this.stan);
    }


}
