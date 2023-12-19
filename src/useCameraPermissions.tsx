import { useState, useMemo } from 'react';
import { PermissionsAndroid, type PermissionStatus, Platform, type Permission } from 'react-native';
import { useIsMounted } from './useIsMounted';

export const useCameraPermissions = () => {
    const [permissionStatus, setPermissionStatus] = useState({} as Record<Permission, PermissionStatus>);
    const { isMounted } = useIsMounted();

    return useMemo(
        () => ({
            permissionStatus,
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
