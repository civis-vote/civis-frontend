import { Injectable } from '@angular/core';
import {Apollo} from 'apollo-angular';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {HttpLink} from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {prod, staging} from '../../environments/environment';
import { ApolloLink, concat } from 'apollo-link';

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {
   uri = ''; // <-- add the URL of the GraphQL server here
  appApiEndpoint: string;
  host: string;
  environmentName: any;
  environment: any;

  constructor(
    private apollo: Apollo,
    private httpLink: HttpLink,
    private http: HttpClient
  ) {this.setConfigs(); }

  async initializeApollo(): Promise<any> {

    this.environmentName = await this.getEnvironment().catch(e => {
      console.error('Error fetching environment');
    });

    this.environment = this.environmentName === 'staging' ? staging : prod;

    const http = this.httpLink.create({uri: `${this.environment.api}/graphql`});

    return new Promise((resolve, reject) => {
      this.apollo.create({
        link: concat(this.authMiddleware(), http),
        cache: new InMemoryCache()
      });
      resolve();
    });
  }

  authMiddleware() {
    return new ApolloLink((operation, forward) => {
      // Check for token
      const token: string = localStorage.getItem('civis-token') || null;
      if (!token) {
        return forward(operation);
      }
      // add the authorization to the headers
      operation.setContext({
        headers: new HttpHeaders().set('Authorization', token)
      });

      return forward(operation);
    });
  }

  getEnvironment() {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.appApiEndpoint}/getEnvironment`)
        .subscribe((data: any) => {
          resolve(data.environment);
        }, err => {
          reject(err);
        });
    });
  }

  setConfigs() {
    this.host = `${document.location.protocol}//${document.location.host}`;

    if (document.location.hostname === 'localhost' || document.location.hostname === '127.0.0.1') {
      this.appApiEndpoint = `${document.location.protocol}//${document.location.hostname}:3201`;
    } else {
      this.appApiEndpoint = `${document.location.protocol}//${document.location.host}`;
    }
  }

}
