'use strict';

const fs = require('fs');
const path = require('path');
const v8 = require('v8');

const runGC = require.main.require('./gc.js');

const PATH = `${__dirname}/sessions`;

const safePath = fn => (token, ...args) => {
    const callback = args[args.length - 1];
    if (typeof token !== 'string') {
        callback(new Error('Invalid session token'));
        return;
    }
    const fileName = path.join(PATH, token);
    if (!fileName.startsWith(PATH)) {
        callback(new Error('Invalid session token'));
        return;
    }
    fn(fileName, ...args);
};

const readSession = safePath(fs.readFile);
const writeSession = safePath(fs.writeFile);
const deleteSession = safePath(fs.unlink);

class Storage extends Map {
    constructor() {
        super();

        this.runGC();
    }

    get(key, callback) {
        const value = super.get(key);
        if (value) {
            callback(null, value);
            return;
        }
        readSession(key, (err, data) => {
            if (err) {
                callback(err);
                return;
            }
            //console.log(`Session loaded: ${key}`);
            const session = v8.deserialize(data);
            super.set(key, session);
            callback(null, session);
        });
    }

    save(key) {
        const value = super.get(key);
        if (value) {
            const data = v8.serialize(value);
            writeSession(key, data, () => {
                //console.log(`Session saved: ${key}`);
            });
        }
    }

    delete(key) {
        deleteSession(key, () => {
            //console.log(`Session deleted: ${key}`);
        });
    }

    runGC() {
        runGC(path.resolve(PATH));
    }
}

module.exports = new Storage();
