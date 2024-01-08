import React, { useEffect, type FC, useContext, useMemo } from 'react';
import { CameraKitReactNative } from './CameraKitContextModule';
import { type NativeError } from './Errors';
import { logger, Logger, type LogLevel } from './logger/Logger';
import { useIsMounted } from './useIsMounted';

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
            applyLens: CameraKitReactNative.applyLens,
            removeLens: CameraKitReactNative.removeLens,
            takeSnapshot: CameraKitReactNative.takeSnapshot,
            loadLensGroups: (groupIds: string[]) => CameraKitReactNative.loadLensGroups(groupIds.join(',')),
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
