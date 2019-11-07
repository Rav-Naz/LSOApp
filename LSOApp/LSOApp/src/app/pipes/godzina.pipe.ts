import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'godzina'
})
export class GodzinaPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    let data = new Date(value)
    return data.toString().slice(16,21);
  }

}
