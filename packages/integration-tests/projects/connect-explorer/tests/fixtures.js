const initializedDevice = {
    // some random empty seed. most of the test don't need any account history so it is better not to slow them down with all all seed
    mnemonic:
        'alcohol woman abuse must during monitor noble actual mixed trade anger aisle',
    pin: '',
    passphrase_protection: false,
    label: 'My Trevor',
    needs_backup: false,
};

const fixtures = [
    {
        device: initializedDevice,
        method: 'getPublicKey',
        view: 'export-xpub',
        views: [
            { name: 'export-xpub', confirm: ['host'] }
        ]
    },
    // {
    //     device: initializedDevice,
    //     method: 'getPublicKey-multiple',
    //     views: [
    //         { name: 'export-xpub', confirm: ['host'] },
    //     ],
    // },
    {
        device: initializedDevice,
        method: 'getAddress',
        views: [
            { name: 'export-address', confirm: ['host'] },
            { name: 'check-address', confirm: ['device'] }
        ],
    },
    // {
    //     device: initializedDevice,
    //     method: 'getAddress-multiple',
    //     views: [
    //         { name: 'export-address', confirm: ['host'] },
    //     ],
    // },
    {
        device: initializedDevice,
        method: 'getAccountInfo',
        views: [
            { name: 'export-account-info', confirm: ['host'] },
        ],
    },
];

// todo: flakiness kicks in once I enable these. Need to investigate.
// {
//     method: 'composeTransaction',
//     views: [
//         {
//             name: 'select-account',
//             confirm: [
//                 '#container > div > div.wrapper > div.select-account-list.segwit > button:nth-child(1)',
//             ]
//         },
//         {
//             name: 'select-fee-list',
//             confirm: ['.send-button', 'device', 'device']
//         }
//     ],
// },
// {
//     method: 'signMessage',
//     views: [
//         {
//             name: 'info-panel', // does not have a special screen
//             confirm: ['device', 'device']
//         },
//     ],
// },
// todo: wipe ends up on "connect device to continue" although device is connected
// note: probably only with bridge 2.0.31
// note: hmm not only :(
// {
//     method: 'wipeDevice',
//     views: [
//         {
//             name: 'device-management',
//             confirm: ['host', 'device']
//         },
//     ],
// },
// {
//     device: {
//         wiped: true,
//     },
//     fixtures: [
//         {
//             method: 'resetDevice',
//             views: [
//                 {
//                     name: 'device-management',
//                     confirm: ['host', 'device']
//                 },
//             ],
//         },
//         {
//             method: 'recoverDevice',
//             views: [
//                 {
//                     name: 'device-management',
//                     confirm: ['host', 'device']
//                 },
//             ],
//         },
//     ]
// }

module.exports = fixtures;
