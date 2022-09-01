import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'notificationFilter'
})
export class NotificationFilter implements PipeTransform {

  transform(value: any[], anotherValue?: any[]): any {
    if (!anotherValue) {
      return [];
    }
    return anotherValue.filter(item => !item.notificationSeen).length;
  }

}
