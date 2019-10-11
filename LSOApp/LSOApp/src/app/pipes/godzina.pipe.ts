import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'godzina'
})
export class GodzinaPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return value.slice(11,16);
  }

}
