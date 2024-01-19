import type { HostComponent } from 'react-native';
import { NativeModules, Platform, UIManager, requireNativeComponent } from 'react-native';

const LINKING_ERROR =
    `The package '@snap/camera-kit-react-native' doesn't seem to be linked. Make sure: \n\n` +
    Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo Go\n';

export function getNativeViewManager<T>(viewManagerName: string): HostComponent<T> {
    return UIManager.getViewManagerConfig(viewManagerName) != null
        ? requireNativeComponent<T>(viewManagerName)
        : (new Proxy(
              {},
              {
                  get() {
                      throw new Error(`View manager '${viewManagerName}' is not found. ${LINKING_ERROR}`);
                  },
              }
          ) as HostComponent<T>);
}

export function getNativeModule<T>(moduleName: string): T {
    return NativeModules[moduleName]
        ? NativeModules[moduleName]
        : (new Proxy(
              {},
              {
                  get() {
                      throw new Error(`Module ${moduleName} is not found. ${LINKING_ERROR}`);
                  },
              }
          ) as T);
}
