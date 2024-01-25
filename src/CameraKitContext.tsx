import React, { useEffect, type FC, useContext, useMemo } from 'react';
import { CameraKitReactNative, type LensLaunchData, type ImageFormats, isSupportedImageFormat } from './CameraKitContextModule';
import { type NativeError } from './Errors';
import { logger, Logger, type LogLevel } from './logger/Logger';
import { useIsMounted } from './useIsMounted';
import { isString, isValidNumber } from './TypeGuards';

export interface CameraKitContextProps {
    apiToken: string;
    logLevels?: LogLevel[];
}

export interface CameraKitState {
    isSessionReady: boolean;
}

export interface VideoRecording {
    stop: () => Promise<{ uri: string }>;
}

const initialState: CameraKitState = Object.freeze({
    isSessionReady: false,
    logger: Logger,
});

export const CameraKitStateContext = React.createContext<CameraKitState>(initialState as CameraKitState);

export const CameraKitContext: FC<CameraKitContextProps> = ({ apiToken, logLevels = ['error'], children }) => {
    logger.setLevels(logLevels);
    const [state, setState] = React.useState<CameraKitState>(initialState);
    const { isMounted } = useIsMounted();

    useEffect(() => {
        setState((prevState) => ({ ...prevState, isSessionReady: false }));

        (async () => {
            try {
                await CameraKitReactNative.closeSession();
                await CameraKitReactNative.createNewSession(apiToken);

                if (isMounted()) {
                    setState((prevState) => ({ ...prevState, isSessionReady: true }));
                }
            } catch (error) {
                logger.log({ level: 'error', message: error as NativeError });
            }
        })();

        return () => {
            setState((prevState) => ({ ...prevState, isSessionReady: false }));

            (async () => {
                try {
                    await CameraKitReactNative.closeSession();
                } catch (error) {
                    logger.log({ level: 'error', message: error as NativeError });
                }
            })();
        };
    }, [apiToken, isMounted]);

    return <CameraKitStateContext.Provider value={state}>{children}</CameraKitStateContext.Provider>;
};

export const useCameraKit = () => {
    const cameraKitState = useContext(CameraKitStateContext);

    if (!cameraKitState) {
        throw new Error('useCameraKit should be used inside of CameraKitContext.');
    }

    return useMemo(() => {
        return {
            isSessionReady: cameraKitState.isSessionReady,
            applyLens: (lensId: string, launchData: LensLaunchData = {}) => {
                if (launchData.launchParams) {
                    for (const [key, value] of Object.entries(launchData.launchParams)) {
                        if (!isValidLaunchParam(value)) {
                            throw new Error(
                                `launchParams values must be strings, numbers, or arrays of strings or numbers. Field ${key} is ` +
                                    `a ${typeof value} instead, with value: ${JSON.stringify(value)}`
                            );
                        }
                    }
                }

                return CameraKitReactNative.applyLens(lensId, launchData);
            },
            removeLens: CameraKitReactNative.removeLens,
            takeSnapshot: (format: ImageFormats, quality: number) => {
                if (!isSupportedImageFormat(format)) {
                    throw new Error(`Image format must be one of PNG, JPEG, but got '${format}'.`);
                }

                if (quality < 0 || quality > 100) {
                    throw new Error(`Quality must be between 0 and 100, but got '${quality}'.`);
                }

                return CameraKitReactNative.takeSnapshot(format, quality);
            },
            loadLensGroup: CameraKitReactNative.loadLensGroup,
            takeVideo: () => {
                const result = CameraKitReactNative.takeVideo();

                return {
                    stop: async () => {
                        await CameraKitReactNative.stopTakingVideo();
                        return result;
                    },
                };
            },
        };
    }, [cameraKitState.isSessionReady]);
};

export const isValidLaunchParam = (value: unknown): boolean => {
    if (Array.isArray(value)) return value.every(isString) || value.every(isValidNumber);
    return isString(value) || isValidNumber(value);
};
