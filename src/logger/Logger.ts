import type { EmitterSubscription } from 'react-native';
import { stackTraceAndroidToString, isNativeError, type CameraKitError, type NativeError } from '../Errors';
import { cameraKitLogEvents } from './cameraKitLogEvents';

export type LogEntry =
    | {
          level: 'error';
          message: CameraKitError | NativeError;
      }
    | { level: 'warn' | 'log' | 'info' | 'debug'; message: unknown };

export type LogLevel = LogEntry['level'];

export class Logger {
    private levels: Set<LogLevel> = new Set();
    private subscriotions2: Map<LogLevel, EmitterSubscription> = new Map();

    setLevels(newLevels: LogLevel[]) {
        const newLevelsSet = new Set(newLevels);

        const levelsToSubscribe = newLevels.filter((item) => !this.levels.has(item));
        const levelsToUnsubscribe = [...this.levels].filter((item) => !newLevelsSet.has(item));

        if (levelsToSubscribe.length === 0 && levelsToUnsubscribe.length === 0) {
            return;
        }

        this.levels = newLevelsSet;

        levelsToUnsubscribe.forEach((level) => {
            this.subscriotions2.get(level)!.remove();
            this.subscriotions2.delete(level);
        });

        levelsToSubscribe.forEach((level) => {
            this.subscriotions2.set(
                level,
                cameraKitLogEvents.addListener(level, (event: CameraKitError) => {
                    this.log({ level, message: event });
                })
            );
        });
    }

    log(logEntry: LogEntry) {
        if (this.levels.has(logEntry.level)) {
            switch (logEntry.level) {
                case 'error': {
                    if (isNativeError(logEntry.message)) {
                        console[logEntry.level](logEntry.message);
                        console[logEntry.level](stackTraceAndroidToString(logEntry.message.nativeStackAndroid));
                    } else {
                        console[logEntry.level](
                            logEntry.message.message,
                            logEntry.message.cause ?? '',
                            logEntry.message.stackTrace
                        );
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
