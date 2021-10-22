import { RESPONSES } from '../../../constants';
import { blockheaderToBlockhash } from '../utils';
import type { BaseWorker } from '../../base';
import type { BlockHeader, ElectrumAPI } from '../../../types/electrum';

const blockListener = (client: ElectrumAPI, worker: BaseWorker<ElectrumAPI>) => {
    const { state: common } = worker;
    const onBlock = (blocks: BlockHeader[]) => {
        blocks.forEach(({ height, hex }) =>
            worker.post({
                id: -1,
                type: RESPONSES.NOTIFICATION,
                payload: {
                    type: 'block',
                    payload: {
                        blockHeight: height,
                        blockHash: blockheaderToBlockhash(hex),
                    },
                },
            })
        );
    };

    const subscribe = () => {
        if (!common.getSubscription('block')) {
            common.addSubscription('block');
            client.on('blockchain.headers.subscribe', onBlock);
        }
        return { subscribed: true };
    };

    const unsubscribe = () => {
        if (common.getSubscription('block')) {
            client.off('blockchain.headers.subscribe', onBlock);
            common.removeSubscription('block');
        }
        return { subscribed: false };
    };

    return {
        subscribe,
        unsubscribe,
    };
};

export default blockListener;
