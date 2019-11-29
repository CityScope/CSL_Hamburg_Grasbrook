import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from "../services/authentication.service";
import { AuthGuard } from '../utils/auth.guard';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private loginStatus: boolean;

  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit() {
    this.loginStatus = this.authenticationService.currentUserValue ? true : false;
  }

  logout() {
    this.authenticationService.logout();
  }
}
