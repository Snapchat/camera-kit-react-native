import React, { createContext, useReducer, type FC, type Dispatch, useContext, type Reducer } from 'react';
import type { CameraOptions } from '../../src/NativeView';
import type { VideoRecording } from '../../src/CameraKitContext';

interface CameraState {
    position: CameraOptions['position'];
    mirrorHorizontally: boolean;
    snapshotUri: string | undefined;
    videoRecording: VideoRecording | undefined;
    videoUri: string | undefined;
    reduceSafeArea: boolean;
}

export function assertExhaustive(_: never, message: string = `Reached unexpected case in exhaustive switch`): never {
    throw new Error(message);
}

type CameraStateActions =
    | {
          type: 'toggleCameraPosition' | 'toggleMirrorHorizontally' | 'toggleSafeArea';
      }
    | { type: 'setSnapshot'; snapshotUri: string | undefined }
    | { type: 'setVideoRecording'; videoRecording: VideoRecording | undefined }
    | {
          type: 'setVideo';
          videoUri: string | undefined;
      };

const initialState = Object.freeze<CameraState>({
    position: 'front',
    mirrorHorizontally: false,
    snapshotUri: undefined,
    videoRecording: undefined,
    videoUri: undefined,
    reduceSafeArea: false,
});

export const CameraStateContext = createContext<CameraState>(initialState);
export const CameraStateDispatchContext = createContext<Dispatch<CameraStateActions>>(() => {});

const cameraStateReducer: Reducer<CameraState, CameraStateActions> = (
    state: CameraState,
    action: CameraStateActions
) => {
    switch (action.type) {
        case 'toggleCameraPosition':
            return {
                ...state,
                position: state.position === 'front' ? 'back' : 'front',
            };

        case 'toggleMirrorHorizontally':
            return {
                ...state,
                mirrorHorizontally: !state.mirrorHorizontally,
            };
        case 'setSnapshot':
            return {
                ...state,
                snapshotUri: action.snapshotUri,
            };
        case 'setVideoRecording':
            return {
                ...state,
                videoRecording: action.videoRecording,
            };
        case 'setVideo':
            return {
                ...state,
                videoUri: action.videoUri,
            };
        case 'toggleSafeArea':
            return {
                ...state,
                reduceSafeArea: !state.reduceSafeArea,
            };
        default:
            assertExhaustive(action);
    }
};

export const CameraContext: FC = ({ children }) => {
    const [state, dispatch] = useReducer(cameraStateReducer, initialState);

    return (
        <CameraStateContext.Provider value={state}>
            <CameraStateDispatchContext.Provider value={dispatch}>{children}</CameraStateDispatchContext.Provider>
        </CameraStateContext.Provider>
    );
};

export function useCameraState() {
    const cameraState = useContext(CameraStateContext);

    if (!cameraState) {
        throw new Error('useCameraState must be used within a CameraContext');
    }

    return cameraState;
}

export function useCameraStateDispatch() {
    const dispatch = useContext(CameraStateDispatchContext);

    if (!dispatch) {
        throw new Error('useCameraStateDispatch must be used within a CameraContext');
    }

    return dispatch;
}
