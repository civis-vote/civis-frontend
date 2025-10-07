import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import {LocalStorageService} from 'ngx-webstorage';
import { map, filter } from 'rxjs/operators';
import { ConstantType } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {

  constantTypeList: Array<string>;
  constantList: Record<string, any> = {}; // TODO: Define proper Constants interface

  constructor(
    private apollo: Apollo,
    private localStorage: LocalStorageService
  ) {
    this.constantTypeList = [

    ];

    this.loadConstantList(this.constantTypeList);
   }


  async loadConstantList(constantTypeList) {

    const localVersion = this.localStorage.retrieve('constantVersion');
    const version = await this.getVersion();
    this.localStorage.store('constantVersion', version);

    constantTypeList.forEach(constantType => {

      const list = this.localStorage.retrieve(constantType);
      if (list && +localVersion === +version) {
        this.constantList[constantType] = list;
      } else {
        this.setConstantList(constantType);
      }
    });
  }

  setConstantList(type) {

    // Uncommented this code and added your ConstantListQuery
    // const variables = {
    //   type_id: type,
    //   per_page: 2000
    // };
    // this.apollo.query({
    //   query: ConstantListQuery,
    //   variables
    // })
    // .pipe(
    //   map(data => data.data),
    //   filter(data => !!data)
    // )
    // .subscribe((data: any) => {
    //   const constantList = data.constantList;
    //   this.constantList[type] = constantList.data;
    //   this.localStorage.store(type, this.constantList[type]);
    // }, err => {
    //   console.log('Error fetching constants: ', err);
    // });
  }


  getConstant(type): Promise<Array<ConstantType>> {
    const list = this.localStorage.retrieve(type);
    return new Promise(async (resolve, reject) => {
      const localVersion = this.localStorage.retrieve('constantVersion');
      const version = await this.getVersion();
      this.localStorage.store('constantVersion', version);
      if (list && +localVersion === +version) {
        return resolve(list);
      }
      const variables = {
        type_id: type,
        per_page: 2000
      };
      // Uncommented this code and added your ConstantListQuery
      // this.apollo.query({
      //   query: ConstantListQuery,
      //   variables
      // })
      // .subscribe((data: any) => {
      //   if (data) {
      //     const constantList = data.constantList;
      //     this.constantList[type] = constantList.data;
      //     this.localStorage.store(type, this.constantList[type]);
      //     resolve(this.constantList[type]);
      //   }
      // });
    });
  }

  getVersion() {
    // Uncommented this code and added your ConstantVersionQuery
    // return this.apollo.query({
    //   query: ConstantVersionQuery
    // })
    // .pipe(
    //   map(data => data.constantVersion)
    // )
    // .toPromise();
  }

}
