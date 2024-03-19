import { useState, useMemo } from 'react';
import { PermissionsAndroid, type PermissionStatus, Platform, type Permission } from 'react-native';
import { useIsMounted } from './useIsMounted';

/**
 * Custom hook that manages camera permissions.
 *
 * @return {Object} An object with the current permission status and a request function to ask for permissions.
 */
export const useCameraPermissions = () => {
    const [permissionStatus, setPermissionStatus] = useState({} as Record<Permission, PermissionStatus>);
    const { isMounted } = useIsMounted();

    return useMemo(
        () => ({
            permissionStatus,
            /**
             * A function that requests permissions asynchronously.
             *
             * @param {Permission[]} type - an array of permissions to request
             */
            request: async (type: Permission[]) => {
                if (Platform.OS === 'android') {
                    const result = await PermissionsAndroid.requestMultiple(type);

                    if (isMounted()) {
                        setPermissionStatus((prevState) => ({ ...prevState, ...result }));
                    }
                }
            },
        }),
        [isMounted, permissionStatus]
    );
};
