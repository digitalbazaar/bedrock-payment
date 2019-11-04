/*
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';
const bedrock = require('bedrock');
const {util} = bedrock;

const c = util.config.main;
const cc = c.computer();

cc('bedrock_payment', {
  // this where you register bedrock-payment-paypal
  // and other payment plugins
  paymentPlugins: [],
  orderProcessors: [],
  // collectionName can be changed to avoid conflicts.
  collectionName: 'payment'
});
