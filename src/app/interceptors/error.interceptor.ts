import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {map} from "rxjs/operators";
import {catchError} from 'rxjs/operators';
import {AuthenticationService} from "../services/authentication.service";
import {ActivatedRoute} from '@angular/router';
import {AlertService} from "../services/alert.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private authenticationService: AuthenticationService,
                private alertService: AlertService,
                private route: ActivatedRoute) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.authenticationService.logout(location.pathname);
                // location.reload(true);
            }

            const error = err.error.message || err.statusText;

            this.alertService.error("Login failed. Please check your credentials", "", 5000)
            return throwError(error);
        }))
    }
}
