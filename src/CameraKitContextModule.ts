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

export type Rect = Record<'top' | 'left' | 'bottom' | 'right', number>;
export type ImageFormats = 'JPEG' | 'PNG';

interface CameraKitContextModule {
    createNewSession(apiKey: string): Promise<boolean>;
    closeSession(): Promise<boolean>;
    loadLensGroup(groupId: string): Promise<Lens[]>;
    applyLens(lensId: string, launchData: LensLaunchData): Promise<boolean>;
    removeLens(): Promise<boolean>;
    takeSnapshot(format: ImageFormats, quality: number): Promise<{ uri: string }>;
    takeVideo(): Promise<{ uri: string }>;
    stopTakingVideo(): Promise<boolean>;
}

export function isSupportedImageFormat(value: unknown): value is ImageFormats {
    return value === 'JPEG' || value === 'PNG';
}

export const CameraKitReactNative = getNativeModule<CameraKitContextModule>('CameraKitContext');
