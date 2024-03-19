import type { EmitterSubscription } from 'react-native';
import {
    stackTraceAndroidToString,
    isNativeError,
    type CameraKitError,
    type NativeError,
    isCameraKitError,
} from '../Errors';
import { cameraKitLogEvents } from './cameraKitLogEvents';

export type LogEntry =
    | {
          level: 'error';
          message: CameraKitError | NativeError | unknown;
      }
    | { level: 'warn' | 'log' | 'info' | 'debug'; message: unknown };

export type LogLevel = LogEntry['level'];

export class Logger {
    private levels: Set<LogLevel> = new Set();
    private subscriptions: Map<LogLevel, EmitterSubscription> = new Map();

    /**
     * Set the new log levels and update subscriptions accordingly.
     *
     * @param {LogLevel[]} newLevels - An array of new log levels to set.
     * @return {void} 
     */
    setLevels(newLevels: LogLevel[]) {
        const newLevelsSet = new Set(newLevels);

        const levelsToSubscribe = newLevels.filter((item) => !this.levels.has(item));
        const levelsToUnsubscribe = [...this.levels].filter((item) => !newLevelsSet.has(item));

        if (levelsToSubscribe.length === 0 && levelsToUnsubscribe.length === 0) {
            return;
        }

        this.levels = newLevelsSet;

        levelsToUnsubscribe.forEach((level) => {
            this.subscriptions.get(level)?.remove();
            this.subscriptions.delete(level);
        });

        levelsToSubscribe.forEach((level) => {
            this.subscriptions.set(
                level,
                cameraKitLogEvents.addListener(level, (event: LogEntry['message']) => {
                    this.log({ level, message: event });
                })
            );
        });
    }

    /**
     * Log a message based on the log entry's level.
     *
     * @param {LogEntry} logEntry - the log entry to be processed
     */
    log(logEntry: LogEntry) {
        if (this.levels.has(logEntry.level)) {
            switch (logEntry.level) {
                case 'error': {
                    if (isNativeError(logEntry.message)) {
                        console[logEntry.level](logEntry.message);
                        console[logEntry.level](stackTraceAndroidToString(logEntry.message.nativeStackAndroid));
                    } else if (isCameraKitError(logEntry.message)) {
                        console[logEntry.level](
                            logEntry.message.message,
                            logEntry.message.cause ?? '',
                            logEntry.message.stackTrace
                        );
                    } else {
                        console[logEntry.level](logEntry.message);
                    }
                    break;
                }
                default: {
                    console[logEntry.level](logEntry.message);
                }
            }
        }
    }
}

export const logger = new Logger();
