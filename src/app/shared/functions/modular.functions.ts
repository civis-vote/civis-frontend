import * as moment from 'moment';
// Date time operations

export function getRelativeTime(dateTime) {
    if (!dateTime) {
        return null;
    }

    const today = moment();

    const date = moment(dateTime);

    const difference = today.diff(date);

    const dayInMilli = 86400000;
    const hourInMilli = 3600000;
    const minuteInMilli = 60000;

    if (difference >= dayInMilli) {
        return moment(date).format(`h:mm a`);
    } else if (difference >= hourInMilli) {
        const diff = today.diff(date, 'hours');
        return `${diff} ${diff > 1 ? 'hours' : 'hour'} ago`;
    } else if (difference >= minuteInMilli) {
        const diff = today.diff(date, 'minutes');
        return `${diff} ${diff > 1 ? 'minutes' : 'minute'} ago`;
    } else if (difference < minuteInMilli) {
        return 'Just now';
    }
}

export function getMinimalisticRelativeTime(dateTime) {
    if (!dateTime) {
        return null;
    }

    const today = moment();

    const time = moment(dateTime);

    const diff = today.diff(time);

    const duration = moment.duration(diff);

    if (duration.years() > 0) {
        return duration.years() + 'y';
    } else if (duration.weeks() > 0) {
        return duration.weeks() + 'w';
    } else if (duration.days() > 0) {
        return duration.days() + 'd';
    } else if (duration.hours() > 0) {
        return duration.hours() + 'h';
    } else if (duration.minutes() > 0) {
        return duration.minutes() + 'm';
    } else if (duration.seconds() > 0) {
        return duration.seconds() + 's';
    }
}


// Object manipulation

export const deepCopy = (item) => {
    if (Array.isArray(item)) {
        return deepCopyArray(item);
    }
    if (typeof item === 'object') {
        return deepCopyObject(item);
    }
    return item;
};

export const deepCopyArray = (arr) => {
    if (!arr) {
        return arr;
    }
    const copy = [];
    arr.forEach(elem => {
        if (Array.isArray(elem)) {
            copy.push(deepCopyArray(elem));
        } else {
            if (typeof elem === 'object') {
                copy.push(deepCopyObject(elem));
            } else {
                copy.push(elem);
            }
        }
    });
    return copy;
};

export const deepCopyObject = (obj) => {
    if (!obj) {
        return obj;
    }

    const keys = Object.keys(obj);
    if (!keys.length) {
        return obj;
    }
    const tempObj = {};
    for (const key of keys) {
        if (Array.isArray(obj[key])) {
            tempObj[key] = deepCopyArray(obj[key]);
        } else {
            if (typeof obj[key] === 'object') {
                tempObj[key] = deepCopyObject(obj[key]);
            } else {
                tempObj[key] = obj[key];
            }
        }
    }
    return tempObj;
};

export const isObjectEmpty = obj => {
    if (!obj) {
        return true;
    }
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
};

export const checkPropertiesPresence = obj => {
    for (const key in obj) {
        if (obj[key] === null ||  obj[key] === '' || obj[key] === undefined) {
          return false;
        }
      }
      return true;
};

// Miscellaneous

export function makeErrorText(
    field: string,
    errorType?: string,
    subErrorTypes?: any
) {
    const FORM_ERRORS = {
        maxlength: ' should not exceed ',
        minlength: ' should be at least ',
        pattern: ' is invalid',
        required: ' is required',
        forbiddenText: ' ',
        min: ' should be '
    };

    let string = '';
    string += field;
    if (FORM_ERRORS[errorType]) {
        if (errorType && FORM_ERRORS[errorType]) {
            string += FORM_ERRORS[errorType];
        }
        if (FORM_ERRORS[errorType] && subErrorTypes) {
            for (const item of Object.keys(subErrorTypes)) {
                switch (item) {
                    case 'requiredLength':
                        string += `${subErrorTypes[item]} characters`;
                        break;
                    case 'forbiddenText':
                        string += `${subErrorTypes[item]}`;
                        break;
                    case 'minlength':
                        string += `${subErrorTypes[item].requiredLength} characters`;
                        break;
                    case 'maxlength':
                        string += `${subErrorTypes[item].requiredLength} characters`;
                        break;
                    case 'min':
                        if (subErrorTypes[item] === 0) {
                            string += `non-negative`;
                        } else {
                            string += `at least ${subErrorTypes[item]}`;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    } else {
        string += ` ${subErrorTypes}`;
    }

    return string;
}

export function isMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}

export const scrollToFirstError = (selector, element) => {
    const firstErrorElement: HTMLElement = element.querySelector(selector);
    if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

