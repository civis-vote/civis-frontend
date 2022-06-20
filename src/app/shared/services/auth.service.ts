import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { CaseStudiesListQuery } from 'src/app/modules/auth/auth.graphql';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private apollo: Apollo,
  ) {}

   getCaseStudiesList() {
    const variables = {
      sort: 'created_at',
      sortDirection: 'desc'
    };
    return this.apollo.query({
      query: CaseStudiesListQuery,
      variables: variables
    })
    .pipe(
      map((res: any) => res.data.caseStudyList)
    );
  }

}
