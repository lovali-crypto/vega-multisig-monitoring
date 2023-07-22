# VEGA Multisig contract monitoring

The script is checking if the Vega multisig contract is correctly configured, meaning all active validators (and only active validators) have their signature in there.

## Demo

If you don't want to deploy it yourself you can subscribe to the public [Telegram channel](https://t.me/vega_multisig_monitoring) maintained by [Lovali](https://lovali.xyz).

## Usage

- Clone the repository locally
- Rename the .env.example to .env
- Configure the .env file
- Download dependencies

```bash
npm i
```

- Run the script

```bash
node index.js
```

### Configuraiton file

The configuration file contains the following values:

- ETH_NODE_ADDRESS: the url of the Ethereum node
- VEGA_REST_ENDPOINT: the url of the Vega REST endpoint (Datanode)
- VEGA_MULTISIG_ADDRESS: the multisignature contract address ( mainnet current value: '0xDD2df0E7583ff2acfed5e49Df4a424129cA9B58F')
- TG_BOT_TOKEN: your telegram bot token provided by Botfather
- TG_CHAT_ID: your telegram channel id
- HEALTHCHECK_ENDPOINT: the healthcheck.io endpoint.

## Features

- Send alert to Telegram challenge in case of misconfiguration;
- Ping healthcheck.io endpoint at each execution to make sure the script is alive;