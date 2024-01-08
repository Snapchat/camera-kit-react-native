import React, { createContext, useReducer, type FC, type Dispatch, useContext, type Reducer } from 'react';
import type { CameraOptions, CropConfig } from '../../src/NativeView';
import type { VideoRecording } from '../../src/CameraKitContext';

interface CameraState {
    position: CameraOptions['position'];
    aspectRatio: CameraOptions['ratio'];
    mirrorVertically: boolean;
    mirrorHorizontally: boolean;
    crop: CropConfig | undefined;
    snapshotUri: string | undefined;
    videoRecording: VideoRecording | undefined;
    videoUri: string | undefined;
}

export function assertExhaustive(_: never, message: string = `Reached unexpected case in exhaustive switch`): never {
    throw new Error(message);
}

type CameraStateActions =
    | {
          type:
              | 'toggleCameraPosition'
              | 'toggleAspectRatio'
              | 'toggleMirrorVertically'
              | 'toggleMirrorHorizontally'
              | 'toggleCrop';
      }
    | { type: 'setSnapshot'; snapshotUri: string | undefined }
    | { type: 'setVideoRecording'; videoRecording: VideoRecording | undefined }
    | {
          type: 'setVideo';
          videoUri: string | undefined;
      };

const initialState = Object.freeze<CameraState>({
    position: 'front',
    aspectRatio: 'RATIO_16_9',
    mirrorVertically: false,
    mirrorHorizontally: false,
    crop: undefined,
    snapshotUri: undefined,
    videoRecording: undefined,
    videoUri: undefined,
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
        case 'toggleAspectRatio':
            return {
                ...state,
                aspectRatio: state.aspectRatio === 'RATIO_16_9' ? 'RATIO_4_3' : 'RATIO_16_9',
            };
        case 'toggleMirrorVertically':
            return {
                ...state,
                mirrorVertically: !state.mirrorVertically,
            };
        case 'toggleMirrorHorizontally':
            return {
                ...state,
                mirrorHorizontally: !state.mirrorHorizontally,
            };
        case 'toggleCrop':
            return {
                ...state,
                crop: state.crop ? undefined : { aspectRatioDenominator: 2, aspectRatioNumerator: 2 },
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
