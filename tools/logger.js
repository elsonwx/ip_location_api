const winston = require('winston');
let console_level = 'debug';
let file_level = 'debug';

winston.loggers.add('api_logger', {
    console: {
        level:console_level,
        colorize: 'true',
        label: 'api_logger',
        stderrLevels: ['error']
    },
    file: {
        level:file_level,
        colorize: 'true',
        filename: './log/api.log',
        maxsize: 5242880,
        maxFiles: 20,
        stderrLevels: ['error']
    }
});

module.exports = winston;
