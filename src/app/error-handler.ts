import {ErrorHandler, Injectable, NgModule} from '@angular/core';
import {SlackWebhookService} from './services/slack-webhook.service';
import {AppComponent} from './app.component';
import {BrowserModule} from '@angular/platform-browser';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
    providedIn: "root"
})
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private slackWebhookService: SlackWebhookService) {
    }

    handleError(error) {
        //alert(error);
        console.error(error);

        if (error instanceof HttpErrorResponse) {
            this.slackWebhookService.logHttpError(error, (error as HttpErrorResponse).status);
        } else if (error instanceof Error) {
            this.slackWebhookService.logError(error);
        } else {
            this.slackWebhookService.logError(error);
        }

    }
}
