// ログ管理ユーティリティ
export class Logger {
    static LOG_LEVELS = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    };

    constructor(component = 'App') {
        this.component = component;
        this.logLevel = this.LOG_LEVELS.ERROR; // 本番環境では ERROR のみ
    }

    error(message, error = null) {
        if (this.logLevel >= this.LOG_LEVELS.ERROR) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] [${this.component}] ERROR: ${message}`;
            
            if (error) {
                console.error(logMessage, error);
            } else {
                console.error(logMessage);
            }
        }
    }

    warn(message) {
        if (this.logLevel >= this.LOG_LEVELS.WARN) {
            const timestamp = new Date().toISOString();
            console.warn(`[${timestamp}] [${this.component}] WARN: ${message}`);
        }
    }

    info(message) {
        if (this.logLevel >= this.LOG_LEVELS.INFO) {
            const timestamp = new Date().toISOString();
            console.info(`[${timestamp}] [${this.component}] INFO: ${message}`);
        }
    }

    debug(message) {
        if (this.logLevel >= this.LOG_LEVELS.DEBUG) {
            const timestamp = new Date().toISOString();
            console.debug(`[${timestamp}] [${this.component}] DEBUG: ${message}`);
        }
    }

    setLogLevel(level) {
        this.logLevel = level;
    }
}

// グローバルロガーインスタンス
export const logger = new Logger();