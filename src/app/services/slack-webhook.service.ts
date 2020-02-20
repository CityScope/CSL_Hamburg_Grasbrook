import {Injectable, NgModule} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import data from '../../assets/slack_webhook.json';


import * as proxy from 'http-proxy-middleware';

@Injectable()
export class SlackWebhookService {
    constructor(private http: HttpClient) {
    }

    private name = 'ErrorLogService';

    /**
     * POSTs data to Slack
     * @param message The general error message
     * @param stack The error slack
     */
    private sendMessageToSlack(message: string, stack: string) {
        console.log("posting to slack");
        const postData = {
            "text": message,
            "attachments": [
                {
                    "text": stack
                }
            ]
        };

        const url = (<any>data).url;
        //const url = 'localhost:4200/api';
/*        const httpOptions = {
            headers: new HttpHeaders({
                "User-Agent": 'test',
                "Referer": 'nc.hcu-hamburg.de',
                'Origin': 'nc.hcu-hamburg.de',
                'Connection': 'keep-alive',
            })
        };
*/
        /*
Host: hooks.slack.com
        User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:73.0) Gecko/20100101 Firefox/73.0
        Accept-Language: en-US,en;q=0.5
        Accept-Encoding: gzip, deflate, br
        Access-Control-Request-Method: POST
        Access-Control-Request-Headers: authorization,user-agent
        Referer: nc.hcu-hamburg.de
        Origin: nc.hcu-hamburg.de
        Connection: keep-alive
        Content-Length: 18
        Pragma: no-cache
        Cache-Control: no-cache
        TE: Trailers

         */

        this.http.post(url, JSON.stringify(postData)).subscribe(
            (response) => console.log(response),
            (error) => console.error(error)
        );

    }


    // logs errors to slack
    logError(error: any) {
        // send general error info to slack
        this.sendMessageToSlack(error.message, error.stack);
    }


    // logs relevant http errors to slack
    logHttpError(error: any, httpStatusCode: number) {
        const message = error.message + ' http status: ' + httpStatusCode;
        this.sendMessageToSlack(message, error.stack);
    }

}

