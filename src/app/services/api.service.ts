import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable()
export class ApiService {
  BASE_URL = 'http://localhost:8000';

  constructor(private http: HttpClient) {
  }

  getSimpleHeaders(): any {
    return new HttpHeaders({
      'Content-Type': 'application/json'

    });
  }

  sendDataUser(data) {
    return this.http.post(this.BASE_URL + '/api/human/', data, {headers: this.getSimpleHeaders()});
  }

  login(data) {
    return this.http.post(this.BASE_URL + '/api/login/', data, {headers: this.getSimpleHeaders()});
  }

  checkFace(data) {
    return this.http.post(this.BASE_URL + '/api/check-face/', data, {headers: this.getSimpleHeaders()});
  }

}
