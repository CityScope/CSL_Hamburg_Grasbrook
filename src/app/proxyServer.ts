import * as express from 'express';
import { createProxyMiddleware, Filter, Options, RequestHandler } from 'http-proxy-middleware';
import * as proxy from 'http-proxy-middleware';

const app = express();

export default function() {
    app.use('/api', createProxyMiddleware(
        {
            target: 'https://hooks.slack.com/services/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',
            changeOrigin: true
        })
    );
    app.listen(3000);

}
