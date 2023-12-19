import { useEffect, useMemo, useRef } from 'react';

export const useIsMounted = () => {
    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, []);

    return useMemo(
        () => ({
            isMounted: () => mountedRef.current,
        }),
        []
    );
};
