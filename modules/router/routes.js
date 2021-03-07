const Session = require(`../../session.js`);

const routes = {
    '/': async () => '<h1>welcome to homepage</h1><hr>',
    '/start': async client => {
        Session.start(client);
        return `Session token is: ${client.token}`;
    },
    '/destroy': async client => {
        const result = `Session destroyed: ${client.token}`;
        Session.delete(client);
        return result;
    },
    '/api/method1': async client => {
        if (client.session) {
            client.session.set('method1', 'called');
            return { data: 'example result' };
        } else {
            return { data: 'access is denied' };
        }
    },
    '/api/method2': async client => ({
        url: client.req.url,
        headers: client.req.headers,
    }),
    '/api/method3': async client => {
        if (client.session) {
            return [...client.session.entries()]
                .map(([key, value]) => `<b>${key}</b>: ${value}<br>`)
                .join();
        }
        return 'No session found';
    },
};

module.exports = routes;
