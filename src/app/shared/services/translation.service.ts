import {
BehaviorSubject,
Observable,
AsyncSubject
} from 'rxjs';
import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie';
import {LocalStorageService} from 'ngx-webstorage';
import {HttpClient} from '@angular/common/http';
import {Resolve, ActivatedRouteSnapshot, CanActivate} from '@angular/router';
import HindiLang from '../../shared/models/constants/translation.json';
import { LANGUAGE_IDS } from '../models/constants/constants';

interface Dictionary {
  en: string;
  hi: string;
  od: string;
  mr: string;
}

@Injectable({
    providedIn: 'root'
})
export class TranslationService implements Resolve<any>, CanActivate {
loading: AsyncSubject<boolean> = new AsyncSubject();

currentLanguage: string;
dictionary: BehaviorSubject<Array<Dictionary>> = new BehaviorSubject([]);
environment: any;

constructor(
        private _cookieService: CookieService,
        private storage: LocalStorageService,
        private http: HttpClient,
) {

    const currentLanguage = this._cookieService.get('civisLang');

    if (currentLanguage) {
        this.currentLanguage = currentLanguage;

        if (this.storage.retrieve('lang')) {
            this.dictionary.next(this.storage.retrieve('lang'));
            this.setIndex();
        } else {
            const lang = HindiLang;
            this.dictionary.next(lang);
            this.storage.store('lang', lang);
            this.setIndex();
        }
    } else {
        this.currentLanguage = 'en';
        this.loading.next(true);
        this.loading.complete();
    }
}

canActivate() {
    return this.loading;
}

resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.loading;
}


setIndex() {
    this.loading.next(true);
    this.loading.complete();
}

translate(text: string) {
  if (typeof text !== 'string') {
      return text;
  }

  const length = this.dictionary.value.length;
  let translationKey;

  if (this.currentLanguage === LANGUAGE_IDS.HINDI) {
      translationKey = LANGUAGE_IDS.HINDI;
  } else if (this.currentLanguage === LANGUAGE_IDS.ODIA) {
      translationKey = LANGUAGE_IDS.ODIA;
  } else if (this.currentLanguage === LANGUAGE_IDS.MARATHI) {
      translationKey = LANGUAGE_IDS.MARATHI;
  } else {
      return text;
  }

  return this.binarySearch(this.dictionary.value, text.toLowerCase(), 0, length, translationKey) || text;
}

binarySearch(arr: Array<Dictionary>, text: string, start: number, end: number, field: string) {
  const mid = Math.floor((start + end) / 2);

  if (start > end) {
      return null;
  }

const startText = arr[start] && arr[start].en.toLowerCase();
const midText = arr[mid] && arr[mid].en.toLowerCase();
const endText = arr[end] && arr[end].en.toLowerCase();

  if (start === end) {
      if (startText === text) {
          return arr[start][field];
      } else {
          return null;
      }
  }

  if (startText === text) {
      return arr[start][field];
  }

  if (endText === text) {
      return arr[end][field];
  }

  if (midText === text) {
      return arr[mid][field];
  }

  if (midText > text) {
      return this.binarySearch(arr, text, start, mid - 1, field);
  } else {
      return this.binarySearch(arr, text, mid + 1, end, field);
  }
}

translateArrays(values: any, args: string) {
    if (this.currentLanguage !== 'en') {
        if (values) {
            let translatedValues = [];
            for (let item of values) {
                let temp = this.translate(item[args]);
                item[args] = temp;
                translatedValues.push(item);
            }
            return translatedValues;
        }
    } else {
        return values;
    }
}

}
