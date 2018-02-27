const router = require('express').Router();
const request = require('request');
const tool = require('../tools/ipcheck');
const $ = require('cheerio');

router.get('/:ip', function (req, res, next) {
    let ip = req.params.ip;
    if (ip == 'me') {
        ip = tool.ipformat(req);
    } else {
        if (!tool.ipcheck(ip)) {
            res.status(400);
            res.json({
                err: 'ip invalid',
                ip: ip
            });
            return;
        }
    }

    ipipnet_location(ip).then((location) => {
        res.json({
            ip:ip,
            location:location
        });
    }).catch(e => {
        res.status(400);
        res.json({
            err: e
        });
    });
});

router.get('/lab/:ip',function(req,res,next){
    let ip = req.params.ip;
    if (ip == 'me') {
        ip = tool.ipformat(req);
    } else {
        if (!tool.ipcheck(ip)) {
            res.status(400);
            res.json({
                err: 'ip invalid',
                ip: ip
            });
            return;
        }
    }

    ipipnet_lab(ip).then((info) => {
        res.json(info);
    }).catch(e => {
        res.status(400);
        res.json({
            err: e
        });
    });

});

function ipipnet_location(ip) {
    return new Promise((resolve, reject) => {
        request.post({
            url: 'https://www.ipip.net/ip.html',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
                'Referer': 'http://www.ipip.net'
            },
            form: {
                'ip': ip
            }
        }, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                try {
                    let ip_location = $(body).find('#myself').eq(0).text().trim();
                    resolve(ip_location);
                } catch (e) {
                    reject('ipipnet resolve failed');
                }
            } else {
                reject('ipipnet request failed');
            }
        });
    });
}

function ipipnet_lab(ip) {
    return new Promise((resolve, reject) => {
        request({
            method: 'GET',
            url: 'https://labs.ipip.net/security/ip/?ip=' + ip,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
                'Referer': 'http://www.ipip.net'
            }
        }, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                try {
                    let table = $(body).find('table.table-bordered');
                    let row_num = 1;
                    let geo = '';
                    let area = table.find('tr').eq(0).children('td').text().trim();
                    if (table.find('tr').eq(1).children('th').text().trim().indexOf('经纬度') > -1) {
                        geo = table.find('tr').eq(1).children('td').text().trim();
                    } else {
                        row_num = 0;
                    }
                    let app_type = table.find('tr').eq(row_num + 1).children('td').text().trim();
                    let operator = table.find('tr').eq(row_num + 2).children('td').text().trim();
                    let owner = table.find('tr').eq(row_num + 3).children('td').text().trim();
                    let current_behavior = table.find('tr').eq(row_num + 4).children('td').text().trim();
                    let history_behavior = table.find('tr').eq(row_num + 5).children('td').text().trim();
                    let from = table.find('tr').eq(row_num + 7).children('td').text().trim();
                    resolve({
                        ip: ip,
                        area: area,
                        geo: geo,
                        app_type: app_type,
                        operator: operator,
                        owner: owner,
                        current_behavior: current_behavior,
                        history_behavior: history_behavior,
                        from: from
                    });
                } catch (e) {
                    reject('ipipnet lab resolve failed')
                }
            } else {
                reject('ipipnet lab request failed');
            }
        });
    });
}

module.exports = router;
