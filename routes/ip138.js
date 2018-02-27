const router = require('express').Router();
const request = require('request');
const tool = require('../tools/ipcheck');
const $ = require('cheerio');

router.get('/:ip', function (req, res, next) {
    let ip = req.params.ip;
    if (ip == 'me') {
        ip = tool.ipformat(req);
    } else {
        if(!tool.ipcheck(ip)){
            res.status(400)
            res.json({
                err: 'ip invalid',
                ip: ip
            });
            return;
        }
    }

    ip138_location(ip).then((location) => {
        res.json({
            ip: ip,
            location: location
        });
    }).catch(e => {
        res.status(400);
        res.json({
            err: e
        });
    });
});


function ip138_location(ip) {
    let now_time = Date.now();
    let qs = {
        query: ip,
        co: '',
        resource_id: 6006,
        t: now_time,
        ie: 'utf8',
        oe: 'utf8',
        cb: 'op_aladdin_callback',
        format: 'json',
        tn: 'baidu',
        cb: 'jQuery110208921704571784295_' + now_time,
        _: Date.now()
    };
    let url = 'https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php';
    return new Promise((resolve, reject) => {
        request.get({
            url: url,
            qs: qs,
            encoding: 'utf8'
        }, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                try {
                    let result = JSON.parse(body.substring(5 + qs.cb.length, body.length - 2));
                    let ip_location = result.data[0].location;
                    resolve(ip_location);
                } catch (e) {
                    reject('ip138 resolve failed');
                }
            } else {
                reject('ip138 request failed');
            }
        });
    });
}

module.exports = router;
