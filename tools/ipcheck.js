function ipformat(req) {
    let ip = '';
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
    return ip;
}

function ipcheck(ip) {
    let matcher = /^(?:(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)\.){3}(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)$/;
    if (!matcher.test(ip)) {
        return false;
    } else {
        return true;
    }
}

module.exports.ipformat = ipformat;
module.exports.ipcheck = ipcheck;