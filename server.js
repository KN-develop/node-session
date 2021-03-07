'use strict';

const http = require('http');

const Client = require(`./client.js`);
const routes = require(`./modules/router/routes.js`);

const routing = routes;

const types = {
    object: JSON.stringify,
    string: s => s,
    number: n => n.toString(),
    undefined: () => 'not found',
};

http.createServer(async (req, res) => {
    const client = await Client.getInstance(req, res);
    const { method, url, headers } = req;
    //console.log(`${method} ${url} ${headers.cookie}`);
    const handler = routing[url];
    res.on('finish', () => {
        if (client.session) client.session.save();
    });
    if (!handler) {
        res.statusCode = 404;
        res.end('Not found 404');
        return;
    }
    handler(client).then(data => {
        const type = typeof data;
        const serializer = types[type];
        const result = serializer(data);
        client.sendCookie();
        res.end(result);
    }, err => {
        res.statusCode = 500;
        res.end('Internal Server Error 500');
        console.log(err);
    });
}).listen(8000);
