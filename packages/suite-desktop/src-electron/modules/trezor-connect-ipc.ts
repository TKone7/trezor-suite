import { ipcMain } from 'electron';
import TrezorConnect, {
    DEVICE_EVENT,
    UI_EVENT,
    TRANSPORT_EVENT,
    BLOCKCHAIN_EVENT,
} from 'trezor-connect';

type Call = [keyof typeof TrezorConnect, ...any[]];

const init = ({ mainWindow }: Dependencies) => {
    const { logger } = global;
    logger.info('trezor-connect-ipc', 'Starting service');

    // propagate all connect events using trezor-connect-event channel
    // real renderer listeners references are managed by desktopApi (see ./src-electron/preloader)
    TrezorConnect.on(DEVICE_EVENT, event => {
        logger.info('trezor-connect-ipc', `DEVICE_EVENT ${event.type}`);
        mainWindow.webContents.send(`trezor-connect-event`, event);
    });

    TrezorConnect.on(UI_EVENT, event => {
        logger.info('trezor-connect-ipc', `UI_EVENT ${event.type}`);
        mainWindow.webContents.send(`trezor-connect-event`, event);
    });

    TrezorConnect.on(TRANSPORT_EVENT, event => {
        logger.info('trezor-connect-ipc', `TRANSPORT_EVENT ${event.type}`);
        mainWindow.webContents.send(`trezor-connect-event`, event);
    });

    TrezorConnect.on(BLOCKCHAIN_EVENT, event => {
        logger.info('trezor-connect-ipc', `BLOCKCHAIN_EVENT ${event.type}`);
        mainWindow.webContents.send(`trezor-connect-event`, event);
    });

    // handle trezor-connect calls. invoked by @trezor/suite-desktop/src/support/TrezorConnectIpc
    ipcMain.handle('trezor-connect-call', (_event: any, [method, ...params]: Call) => {
        logger.info('trezor-connect-ipc', `Call ${method}`);
        // @ts-ignore method name union
        return TrezorConnect[method](...params);
    });
};

export default init;
