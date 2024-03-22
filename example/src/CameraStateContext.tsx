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

/**
 * Reducer function for managing camera state based on different actions.
 *
 * @param {CameraState} state - The current state of the camera
 * @param {CameraStateActions} action - The action to be performed on the camera state
 * @return {CameraState} The updated camera state after applying the action
 */
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

/**
 * React functional component for managing camera context.
 * It provides the camera state and dispatch functions to its child components through context providers.
 * 
 * @param {FC} children - The child components
 * @return {JSX.Element} The JSX element representing the camera context provider
 */
export const CameraContext: FC = ({ children }) => {
    const [state, dispatch] = useReducer(cameraStateReducer, initialState);

    return (
        <CameraStateContext.Provider value={state}>
            <CameraStateDispatchContext.Provider value={dispatch}>{children}</CameraStateDispatchContext.Provider>
        </CameraStateContext.Provider>
    );
};

/**
 * A custom React Hook that provides access to the camera state.
 *
 * @return {CameraState} The camera state object
 */
export function useCameraState() {
    const cameraState = useContext(CameraStateContext);

    if (!cameraState) {
        throw new Error('useCameraState must be used within a CameraContext');
    }

    return cameraState;
}

/**
 * A custom hook that returns the camera state dispatch function.
 *
 * @return {Function} The camera state dispatch function
 */
export function useCameraStateDispatch() {
    const dispatch = useContext(CameraStateDispatchContext);

    if (!dispatch) {
        throw new Error('useCameraStateDispatch must be used within a CameraContext');
    }

    return dispatch;
}
