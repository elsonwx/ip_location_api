const router = require('express').Router();
const request = require('request');
const randomstring = require('randomstring');
const $ = require('cheerio');

router.get('/:ip', function(req, res, next) {
    let ip = req.params.ip;
    let matcher = /^(?:(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)\.){3}(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)$/;
    if (!matcher.test(ip)) {
        res.json({
            err: 'ip invalid',
            ip: ip
        });
        return;
    }

    ipipnet_location(ip).then((ipipnet_location) => {
        ip138_location(ip).then((ip138_location)=>{
            res.json({
                ip:ip,
                ipipnet_location:ipipnet_location,
                ip138_location:ip138_location
            });
        });
    });
});

function ipipnet_location(ip) {
    return new Promise((resolve, reject) => {
        request.post({
            url: 'http://www.ipip.net/ip.html',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
                'Referer': 'http://www.ipip.net/ip.html'
            },
            form: {
                '_verify': randomstring.generate(32),
                'ip': ip
            }
        }, function(err, res, body) {
            if (!err && res.statusCode == 200) {
                let ip_location = $(body).find('#myself').eq(0).text().trim();
                resolve(ip_location);
            } else {
                resolve('ipipnet api failed');
            }
        });
    });
}

function ip138_location(ip) {
    let now_time = Date.now();
    let qs ={
        query:ip,
        co:'',
        resource_id:6006,
        t:now_time,
        ie:'utf8',
        oe:'utf8',
        cb:'op_aladdin_callback',
        format:'json',
        tn:'baidu',
        cb:'jQuery110208921704571784295_'+now_time,
        _:Date.now()
    };
    let url = 'https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php';
    return new Promise((resolve, reject) => {
        request.get({
            url:url,
            qs:qs,
            encoding:'utf8'
        },function(err,res,body){
            if (!err && res.statusCode == 200) {
                let result = JSON.parse(body.substring(5+qs.cb.length,body.length-2));
                let ip_location = result.data[0].location;
                resolve(ip_location);
            } else {
                resolve('ip138 api failed');
            }

        });
    });
}
module.exports = router;
