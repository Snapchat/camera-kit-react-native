import { isRecord } from './TypeGuards';

export interface CameraKitError {
    message: string;
    stackTrace: string;
    cause?: string;
}

export interface AndroidStackTraceElement {
    class: string;
    file: string;
    lineNumber: number;
    methodName: string;
}

export interface NativeError {
    code: string;
    message: string;
    nativeStackAndroid: Array<AndroidStackTraceElement>;
    nativeStackIOS: Array<unknown>;
    userInfo?: Record<string, unknown>;
}

/**
 * Checks if the error is a native error.
 *
 * @param {any} error - the error to check
 * @return {boolean} true if the error is a native error, false otherwise
 */
export const isNativeError = (error: any): error is NativeError =>
    isRecord(error) && (error.nativeStackAndroid != undefined || error.nativeStackIOS != undefined);

/**
 * Checks if the given error is a CameraKitError.
 *
 * @param {any} error - The error to be checked.
 * @return {boolean} Returns true if the error is a CameraKitError, otherwise false.
 */
export const isCameraKitError = (error: any): error is CameraKitError =>
    isRecord(error) && error.message != undefined && error.stackTrace != undefined;

/**
 * Generates a string representation of the Android native stack trace.
 *
 * @param {Array<AndroidStackTraceElement>} nativeStackAndroid - The array of Android stack trace elements
 * @return {string} The string representation of the Android native stack trace
 */
export const stackTraceAndroidToString = (nativeStackAndroid: Array<AndroidStackTraceElement>): string =>
    nativeStackAndroid.reduce((acc, { lineNumber, file, methodName, class: className }) => {
        const lineNumberString = lineNumber >= 0 ? `:${lineNumber}` : '';
        const fileString = file ?? 'Unknown Source';
        return `${acc}\t${className}.${methodName}(${fileString}${lineNumberString})\n`;
    }, 'Call Stack\n');
