import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import {MatSnackBar} from "@angular/material";

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private _snackBar: MatSnackBar) {
  }

  success(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  error(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['error-snackbar']
    });

  }
}
