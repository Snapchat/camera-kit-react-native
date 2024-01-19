import { getNativeModule } from './verifyNativeModule';
export interface Media {
    imageUrl: string | undefined;
}

export interface Snapcode {
    imageUrl: string;
    deepLink: string;
}

export interface LensLaunchData {
    launchParams?: Record<string, string | number | string[] | number[]>;
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
    loadLensGroup(groupId: string): Promise<Lens[]>;
    applyLens(lensId: string, launchData: LensLaunchData): Promise<boolean>;
    removeLens(): Promise<boolean>;
    takeSnapshot(format: 'JPEG' | 'PNG', quality: Number): Promise<{ uri: string }>;
    takeVideo(): Promise<{ uri: string }>;
    stopTakingVideo(): Promise<boolean>;
}

export const CameraKitReactNative = getNativeModule<CameraKitContextModule>('CameraKitContext');
