import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import {  HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { GraphqlService } from './graphql.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ApolloModule,
  ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
          cache: new InMemoryCache(),
          link: httpLink.create({ uri: 'https://your-graphql-endpoint' }),
        };
      },
      deps: [HttpLink],
    },
    GraphqlService
  ]
})

export class GraphQLModule {
}

export function initializeApollo(graphqlService: GraphqlService) {
  return () => graphqlService.initializeApollo();
}
