const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };

const config = {
    level: LEVELS.debug,
    // prefix: '[App]',
    prefix: '',
    enableTimestamp: true
};

const timeFmt = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
});

function format(level) {
    const parts = [];
    if (config.prefix) parts.push(config.prefix);
    if (config.enableTimestamp) parts.push(timeFmt.format(new Date()));
    parts.push(`[${level.toUpperCase()}]`);
    return parts;
}

const logger = {
    setLevel(level) { config.level = LEVELS[level] ?? config.level; },
    debug(...args) {
        if (config.level > LEVELS.debug) return;
        // console.debug(...format('debug'), ...args);
        console.info(...format('debug'), ...args);
    },
    info(...args) {
        if (config.level > LEVELS.info) return;
        console.info(...format('info'), ...args);
    },
    warn(...args) {
        if (config.level > LEVELS.warn) return;
        console.warn(...format('warn'), ...args);
    },
    error(...args) {
        if (config.level > LEVELS.error) return;
        console.error(...format('error'), ...args);
    }
};

export default logger;