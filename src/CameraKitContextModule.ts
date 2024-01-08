import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
    "The package 'camera-kit-react-native' doesn't seem to be linked. Make sure: \n\n" +
    Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo Go\n';

export interface Media {
    imageUrl: string;
}

export interface Snapcode {
    imageUrl: string;
    deepLink: string;
}

export interface Lens {
    id: string;
    name: string;
    icons: Media[];
    groupId: string;
    previews: Media[];
    snapcodes: Snapcode[];
    facingPreference?: 'FRONT' | 'BACK';
    vendorData: Record<string, string>;
}

interface CameraKitContextModule {
    createNewSession(apiKey: string): Promise<boolean>;
    closeSession(): Promise<boolean>;
    loadLensGroups(groupIds: string): Promise<Lens[]>;
    applyLens(lensId: string): Promise<boolean>;
    removeLens(): Promise<boolean>;
    takeSnapshot(format: 'JPEG' | 'PNG', quality: Number): Promise<{ uri: string }>;
    takeVideo(): Promise<{ uri: string }>;
    stopTakingVideo(): Promise<boolean>;
}

export const CameraKitReactNative: CameraKitContextModule = NativeModules.CameraKitContext
    ? NativeModules.CameraKitContext
    : new Proxy(
          {},
          {
              get() {
                  throw new Error(LINKING_ERROR);
              },
          }
      );
