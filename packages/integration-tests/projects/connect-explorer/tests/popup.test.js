const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const { Controller } = require('../../../websocket-client');
const fixtures = require('./fixtures');

const url = process.env.URL || 'http://localhost:8082/';
const SCREENSHOTS_DIR = './projects/connect-explorer/screenshots';

const wait = (timeout) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, timeout)
    })
}

const log = (...val) => {
    console.log(`[===]`, ...val);
}

const ensureScreenshotsDir = () => {
    if (fs.existsSync(SCREENSHOTS_DIR)) {
        fs.rmSync(SCREENSHOTS_DIR, { recursive: true });
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    } else {
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }
}

// return;
const controller = new Controller({ url: 'ws://localhost:9001/' });

test.beforeAll(async () => {
    await controller.connect();
    await controller.send({ type: 'bridge-start', version: '2.0.27' });

    console.log('========== before all===========');
    ensureScreenshotsDir();
});

let device = {};

const tests = [];

for (fixture of fixtures) {
    ((f) => test(f.method, async ({ page }) => {
        log(f.method, "start");

        if (JSON.stringify(device) !== JSON.stringify(f.device)) {
            device = f.device;
            await controller.send({
                type: 'emulator-stop',
            });
            await controller.send({
                type: 'emulator-start',
                wipe: true,
            });
            await controller.send({
                type: 'emulator-setup',
                ...f.device,
            });
            await controller.send({ type: 'emulator-allow-unsafe-paths' });
        }

        const screenshotsPath = `${SCREENSHOTS_DIR}/${f.method}`;

        if (!fs.existsSync(screenshotsPath)) {
            fs.mkdirSync(screenshotsPath);
        }

        await page.goto(`${url}#/method/${f.method}`);

        // screenshot request
        log(f.method, "screenshot trezor-connect call params");
        await page.waitForTimeout(2000);

        const code = await page.locator('[data-test="@code"]');
        const codeClip = await code.boundingBox();
        await page.screenshot({ path: `${screenshotsPath}/1-request.png`, clip: codeClip  });

        log(f.method, "submitting in connect explorer");
        await page.waitForSelector("button[data-test='@submit-button']", { visible: true });

        // const popupPromise = new Promise(x => explorer.once('popup', x));
        const [popup] = await Promise.all([
            // It is important to call waitForEvent before click to set up waiting.
            page.waitForEvent('popup'),
            // Opens popup.
            page.click("button[data-test='@submit-button']")
        ]);
        await popup.waitForLoadState('load');

        log(f.method, "waiting for popup promise");
        log(f.method, "popup promise resolved");

        // can't really connect device here, experiencing unexpected popup closing
        // await popup.screenshot({ path: `${screenshotsPath}/2-connect-device.png`, fullPage: true });
        // await popup.waitForSelector(".connect", { visible: true, timeout: 30000 });

        try {
            log(f.method, "waiting for confirm permissions button");
            await popup.waitForTimeout(1000);
            await popup.waitForSelector("button.confirm", { visible: true, timeout: 30000 });
            await popup.screenshot({ path: `${screenshotsPath}/2-permissions.png`, fullPage: true });
            await popup.waitForTimeout(1000);

            await popup.click("button.confirm");
        } catch (err) {
            log(f.method, "permissions button not found");
            await popup.screenshot({ path: `${screenshotsPath}/2-err-permissions-not-found.png`, fullPage: true });
        }

        let viewIndex = 0;
        for (v of f.views) {

            log(f.method, v.name, "expecting view");

            await popup.waitForSelector(`.${v.name}`, { visible: true });

            if (!v.confirm) {
                continue;
            }
            let confirmIndex = 0;
            for (confirm of v.confirm) {

                await popup.waitForTimeout(2000);

                await popup.screenshot({ path: `${screenshotsPath}/3-${viewIndex + 1}-${confirmIndex + 1}-${v.name}.png`, fullPage: true });

                if (confirm === 'device' && f.method === 'recoverDevice') {
                    await controller.send({ type: 'emulator-press-yes' });
                    await controller.send({ type: 'select-num-of-words', num: 12 });
                }
                else if (confirm === 'host') {
                    log(f.method, v.name, "user interaction on host");
                    await popup.click("button.confirm");
                } else if (confirm === 'device') {
                    log(f.method, v.name, "user interaction on device");
                    await controller.send({ type: 'emulator-press-yes' });
                } else {
                    await popup.click(confirm);
                }
                confirmIndex++;
            }
            viewIndex++;
            log(f.method, v.name, "view finished");
        }

        log(f.method, "all views finished");

        // screenshot response
        log(f.method, "screenshotting response");
        const response = await page.locator('[data-test="@response"]');
        const responseClip = await response.boundingBox();
        await page.screenshot({ path: `${screenshotsPath}/4-response.png`, clip: responseClip });
        log(f.method, "method finished");
    })
    )(fixture)

}

