# Crypto Wallet

A crypto wallet that makes it easy to use the blockchain.

1. Create account
2. Restore account
3. Send ETH
4. View transactions



## Quickstart

```
yarn install
yarn start
```

## Build as an extension:

1. `yarn build`
1. Visit `chrome://extensions` in Chrome browser and 
1. Turn on developer mode
1. Click load unpacked and select the `build/` folder generated from `yarn build`

## Publish to Chrome Store
1. Update the version number in manifest.json
1. Build deployment package: `yarn build`
1. Zip `build/` folder: `zip -r build.zip build`
1. Upload package in Chrome web store developer dashboard
1. Follow instructions on page to submit for review
