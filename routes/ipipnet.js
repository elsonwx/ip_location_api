const router = require('express').Router();
const request = require('request');
const randomstring = require('randomstring');
const $ = require('cheerio');

router.get('/:ip', function(req, res, next) {
    let ip = req.params.ip;
    if (ip == 'me') {
        let req_ip = req.ip;
        if (req_ip == '::1') {
            ip = '127.0.0.1';
        }
        if (req_ip.indexOf('::ffff:') >= 0) {
            ip = req_ip.substring(7);
        }
        let xip = req.headers['x-forwarded-for'];
        if (xip) {
            ip = xip.split(',')[0] || ip;
        }
    } else {
        let matcher = /^(?:(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)\.){3}(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)$/;
        if (!matcher.test(ip)) {
            res.json({
                err: 'ip invalid',
                ip: ip
            });
            return;
        }
    }

    ipipnet_info(ip).then((info) => {
        res.json(info);
    }).catch(e => {
        res.status(400);
        res.json({
            err: 'api failed'
        })
    });
});

function ipipnet_info(ip) {
    return new Promise((resolve, reject) => {
        request({
            method: 'GET',
            url: 'https://labs.ipip.net/security/ip/?ip=' + ip,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
                'Referer': 'http://www.ipip.net'
            }
        }, function(err, res, body) {
            if (!err && res.statusCode == 200) {
                let table = $(body).find('table.table-bordered');
                let row_num = 1;
                let geo = '';
                let area = table.find('tr').eq(0).children('td').text().trim();
                if (table.find('tr').eq(1).children('th').text().trim().indexOf('经纬度') > -1) {
                    geo = table.find('tr').eq(1).children('td').text().trim();
                } else {
                    row_num = 0;
                }
                let app_type = table.find('tr').eq(row_num+1).children('td').text().trim();
                let operator = table.find('tr').eq(row_num+2).children('td').text().trim();
                let owner = table.find('tr').eq(row_num+3).children('td').text().trim();
                let current_behavior = table.find('tr').eq(row_num+4).children('td').text().trim();
                let history_behavior = table.find('tr').eq(row_num+5).children('td').text().trim();
                let from = table.find('tr').eq(row_num+7).children('td').text().trim();
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
            } else {
                resolve('ipipnet api failed');
            }
        });
    });
}

module.exports = router;
