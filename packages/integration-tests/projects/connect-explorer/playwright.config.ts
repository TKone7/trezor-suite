import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testDir: 'tests',
    use: {
        headless: process.env.HEADLESS === 'true',
    },
};
export default config;
