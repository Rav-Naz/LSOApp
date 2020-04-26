import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uri'
})
export class EnterPipe implements PipeTransform {

  transform(value: string, ...args: any[]): any {
    return decodeURI(value);
  }

}
