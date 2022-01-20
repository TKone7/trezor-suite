import { useRef, useEffect, useState } from 'react';

import { useSelector } from '@suite-hooks';

export const useAnchor = (anchorId: string) => {
    const anchorRef = useRef<HTMLDivElement>(null);

    const { anchor } = useSelector(state => ({
        anchor: state.router.anchor,
    }));

    const [firstRenderDone, setFirstRenderDone] = useState<boolean>(false);
    useEffect(() => {
        setFirstRenderDone(true);
    }, []);

    useEffect(() => {
        if (anchorId === anchor && firstRenderDone && anchorRef.current) {
            anchorRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [anchorRef, anchor, anchorId, firstRenderDone]);

    return {
        anchorRef,
        shouldHighlight: anchorId === anchor,
    };
};
