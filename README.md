<h1 align="center">Welcome to bedrock-payment 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/digitalbazaar/bedrock-payment#readme">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" target="_blank" />
  </a>
  <a href="https://github.com/digitalbazaar/bedrock-payment/graphs/commit-activity">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" target="_blank" />
  </a>
</p>

> Backend payment services for Bedrock.

### 🏠 [Homepage](https://github.com/digitalbazaar/bedrock-payment#readme)

## Install

```sh
npm install --save bedrock-payment bedrock-payment-http bedrock-web-payment
```

## Usage

Provides an interface for bedrock payments and the database.
You will need to pick your own plugin for a payment gateway.
Example:

```sh
npm install --save bedrock-payment-paypal
```

In your configs/ dir you will need to configure bedrock-payment
```js
const {config} = require('bedrock');
const bedrockPayment = require('bedrock-payment');

// this is used by the validator to ensure you
// can not post a service not supported by the current project.
config.bedrock_payment.services = ['my-payment-gateway'];
config.bedrock_payment.orderProcessor = 'my-order-processor';

bedrockPayment.use('paypal', require('bedrock-payment-my-gateway'));
bedrockPayment.use('my-order-processor', require('../lib/my-order-processor.js'));

```

Methods should be documented in files.

## Author

👤 **Digital Bazaar, Inc.**

* Github: [@digitalbazaar](https://github.com/digitalbazaar)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/digitalbazaar/bedrock-payment/issues).

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
