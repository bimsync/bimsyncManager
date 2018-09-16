import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';

import { IAccessToken, IbimsyncUser, IUser } from 'app/bimsync-oauth/bimsync-oauth.models';

import Json from '*.json';

@Injectable()
export class AppService {

  errorMessage: string;
  private _projectsUrl = 'https://binsyncfunction.azurewebsites.net/api';
  // _callbackUrl:string = 'https://bimsyncmanager.firebaseapp.com/callback';
  _callbackUrl: string = 'http://localhost:4200/callback';
  _client_id = 'hl94XJLXaQe3ogX';
  _user: IUser;

  constructor(
    private _http: HttpClient,
    private router: Router
  ) {
    // Encore the callbackURI
    this._callbackUrl = encodeURIComponent(this._callbackUrl);
    // Check if there is a user in local storage
    let currentUser: IUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser != null) {
      this._user = currentUser;
      let now = new Date();
      let refresh = new Date(this._user.RefreshDate)
      if (refresh < now) {
        this.RefreshToken();
      }
    }
  }

  GetUser(): IUser {
    if (this._user != null) {
      let now = new Date();
      let refresh = new Date(this._user.RefreshDate)
      if (refresh < now) {
        this.RefreshToken();
      }
    }
    return this._user;
  }

  CreateUser(authorization_code: string) {
    this.createUserRequest(authorization_code)
      .subscribe(user => {
        this._user = user;
        // Save to local storage
        localStorage.setItem('user', JSON.stringify(user));
        // Redirect to the home page
        this.router.navigate(['/projects']);
      },
        error => this.errorMessage = <any>error);
  }

  RefreshToken() {
    this.RefreshTokenRequest()
      .subscribe(user => {
        this._user = user;
        // Save to local storage
        localStorage.setItem('user', JSON.stringify(user));
      },
        error => this.errorMessage = <any>error);
  }

  CreateBCFToken(authorization_code: string) {
    this.createBCFTokenRequest(authorization_code)
      .subscribe(user => {
        this._user = user;
        // Save to local storage
        localStorage.setItem('user', JSON.stringify(user));
        // Redirect to the home page
        this.router.navigate(['/projects']);
      },
        error => this.errorMessage = <any>error);
  }

  private getUserRequest(authorization_code: string): Observable<IUser> {
    return this._http.post<IUser>(
      this._projectsUrl + 'users', JSON.stringify(this._callbackUrl),
      {
        params: new HttpParams().set('code', authorization_code),
        headers: new HttpHeaders()
          .set('Content-Type', 'application/json')
      })
      .do(data => console.log('All: ' + JSON.stringify(data)))
      .catch(this.handleError);
  }

  private createUserRequest(authorization_code: string): Observable<IUser> {

    let body = {
      AuthorizationCode: authorization_code,
      RedirectURI: this._callbackUrl
    };

    return this._http.post<IUser>(
      this._projectsUrl + '/manager/users', JSON.stringify(body),
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/json')
      })
      .do(data => console.log('All: ' + JSON.stringify(data)))
      .catch(this.handleError);
  }

  private createBCFTokenRequest(authorization_code: string): Observable<IUser> {
    return this._http.get<IUser>(
      this._projectsUrl + '/manager/users/' + this._user.PowerBISecret + '/bcf',
      {
        params: new HttpParams().set('code', authorization_code),
        headers: new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
      })
      .do(data => console.log('All: ' + JSON.stringify(data)))
      .catch(this.handleError);
  }

  private RefreshTokenRequest(): Observable<IUser> {
    return this._http.get<IUser>(
      this._projectsUrl + '/manager/users/' + this._user.PowerBISecret,
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
      })
      .do(data => console.log('All: ' + JSON.stringify(data)))
      .catch(this.handleError);
  }

  private handleError(err: HttpErrorResponse) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage = '';
    if (err.error instanceof Error) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.log(errorMessage);
    return Observable.throw(errorMessage);
  }
}
