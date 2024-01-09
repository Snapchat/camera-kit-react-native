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

export const isNativeError = (error: any): error is NativeError =>
    isRecord(error) && (error.nativeStackAndroid != undefined || error.nativeStackIOS != undefined);

export const isCameraKitError = (error: any): error is CameraKitError =>
    isRecord(error) && error.message != undefined && error.stackTrace != undefined;

export const stackTraceAndroidToString = (nativeStackAndroid: Array<AndroidStackTraceElement>): string =>
    nativeStackAndroid.reduce((acc, { lineNumber, file, methodName, class: className }) => {
        const lineNumberString = lineNumber >= 0 ? `:${lineNumber}` : '';
        const fileString = file ?? 'Unknown Source';
        return `${acc}\t${className}.${methodName}(${fileString}${lineNumberString})\n`;
    }, 'Call Stack\n');
