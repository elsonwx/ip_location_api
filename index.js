const express = require('express');
const logger = require('./tools/logger.js').loggers.get('api_logger');
const app = express();
// use morgan to print the request info(e.g. path,statusCode .etc)
const morgan = require('morgan');
app.use(morgan('dev'));
app.use('/ip138', require('./routes/ip138'));
app.use('/ipipnet', require('./routes/ipipnet'));
app.set('port', process.env.PORT || 3000);
const server = app.listen(app.get('port'), function() {
    logger.debug('server start at port ', app.get('port'));
});
