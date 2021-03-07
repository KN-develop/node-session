/*
* Занимается удалением старых сессий
*
* */

const fs = require('fs');
const path = require('path');

let timer = null;

const runGC = (dir, delay = 10000, timeAlive = 10 * 60 * 1000) => {
    const callback = () => {
        fs.readdir(dir, null, (error, data) => {
            if (error) {
                return undefined;
            }

            data.forEach(file => {
                if (file === '.gitkeep') return undefined;
                const filePath = path.join(dir, file);
                fs.open(filePath, (error, descriptor) => {
                    fs.fstat(descriptor, (error, data) => {
                        const ctime = new Date(data.ctime);
                        const currentDate = new Date();
                        const diff = currentDate.getTime() - ctime.getTime();

                        if (diff > timeAlive) {
                            fs.unlink(filePath, (e)=>{});
                        }
                    })
                });
            });
        })
    }

    if (!timer) {
        callback();
        timer = setInterval(callback, delay);
    }
};

module.exports = runGC;
