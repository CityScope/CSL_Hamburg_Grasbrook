import {ErrorHandler, Injectable, NgModule} from '@angular/core';
import {SlackWebhookService} from './services/slack-webhook.service';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private slackWebhookService: SlackWebhookService) {
    }

    handleError(error) {

        if (error instanceof HttpErrorResponse) {
            this.slackWebhookService.logHttpError(error, (error as HttpErrorResponse).status);
        } else if (error instanceof Error) {
            this.slackWebhookService.logError(error);
        } else {
            this.slackWebhookService.logError(error);
        }

    }
}
