import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ConsultationDeadlineService {

  constructor() { }

  getRemainingDays(responseDeadline: string): number | string {
    if (!responseDeadline) return '';
    
    const { diffInDays, isSameDay, diffInHours, diffInMinutes } = this.getDifferenceInDays(responseDeadline);
    const roundedDays = Math.floor(diffInDays);
    
    if (roundedDays < 0 || diffInHours < 0) return '';
    if (roundedDays === 0 || isSameDay) {
      if (diffInHours < 1) {
        return Math.ceil(diffInMinutes);
      }
      return Math.ceil(diffInHours);
    }
    
    const displayDays = roundedDays + 1;
    
    return displayDays;
  }
  
  getRemainingDaysText(responseDeadline: string): string {
    if (!responseDeadline) return '';
    
    const { diffInDays, isSameDay, diffInHours, diffInMinutes } = this.getDifferenceInDays(responseDeadline);
    const roundedDays = Math.floor(diffInDays);
    
    if (roundedDays < 0 || diffInHours < 0) return 'Closed';
    if (roundedDays === 0 || isSameDay) {
      if (diffInHours < 1) {
        const minutesRemaining = Math.ceil(diffInMinutes);
        return minutesRemaining === 1 ? 'minute to respond' : 'minutes to respond';
      }
      const hoursRemaining = Math.ceil(diffInHours);
      return hoursRemaining === 1 ? 'hour to respond' : 'hours to respond';
    }
    
    const displayDays = roundedDays + 1;
    
    if (displayDays === 2) {
      return 'days to respond';
    } else {
      return 'days remaining';
    }
  }

  getDifferenceInDays(deadline: string) {
    const deadlineDate = moment(deadline).local();
    const currentTime = moment();
    const deadlineDateLocal = moment(deadline).local().startOf('day');
    const todayLocal = moment().startOf('day');
    
    const diff_in_time = deadlineDateLocal.valueOf() - todayLocal.valueOf();
    const diffInDays = diff_in_time / (1000 * 3600 * 24);
    const isSameDay = deadlineDateLocal.isSame(todayLocal, 'day');
    
    const diffInHours = deadlineDate.diff(currentTime, 'hours', true);
    const diffInMinutes = deadlineDate.diff(currentTime, 'minutes', true);
    
    return { diffInDays, isSameDay, diffInHours, diffInMinutes };
  }
}
