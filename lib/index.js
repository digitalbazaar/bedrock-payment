const bedrock = require('bedrock');
const injector = require('./injector.js');
const order = require('./order-processor.js');
const db = require('./db.js');
const {Errors, PaymentStatus} = require('./constants.js');

const {BedrockError} = bedrock.util;
const logger = require('./logger.js');
require('./config.js');
require('./setup.js');

const api = {PaymentStatus, order, db, Errors};
/**
 * Registers or retrieves a payment plugin.
 *
 * A plugin can be registered to extend the capabilities of the payment
 * subsystem by adding new payment gateways.
 *
 * @param {string} capabilityName - The name of the capability.
 * @param {string} [capabilityValue=undefined] - Either the value of
 *   the capability: type type type of plugin api the javascript API
 *   for the plugin or `undefined` to use this function as a synchronous getter.
 *
 *  @returns {undefined} Doesn't return.
 */
api.use = (capabilityName, capabilityValue) =>
  injector.use(capabilityName, capabilityValue);

// Gets the Gateway API from a plugin.
const getGatewayApi = ({service}) => {
  const {api} = injector.use(service);
  return api;
};

api.compareAndSwapAmount = async ({payment, amount, expectedAmount}) => {
  const api = getGatewayApi(payment);
  return api.compareAndSwapAmount({payment, amount, expectedAmount});
};

api.createOrder = async ({payment}) => {
  const api = getGatewayApi(payment);
  return api.createOrder({payment});
};

api.createPayment = async ({creator, payment}) => {
  const {service, amount, orders} = payment;
  payment.id = `urn:uuid:${bedrock.util.uuid()}`;
  payment.creator = creator;
  const order = await api.createOrder({payment});
  payment.serviceId = order.id;
  await db.save({payment});
  return {order, payment};
};

api.updatePendingPayment = async ({pendingPayments, paymentData}) => {
  const [pending] = pendingPayments;
  const expectedAmount = pending.amount;
  const payment = Object.assign(pending, paymentData);
  logger.debug('Update Payment started.', {pendingPayments, payment});
  const amount = {currency_code: payment.currency, value: payment.amount};
  // this will throw if the order has been deleted
  // or the order's amount does not match the expectedAmount.
  const updatedOrder = await api.compareAndSwapAmount(
    {payment, amount, expectedAmount});
  logger.debug('Update Payment finished.', {updatedOrder, payment});
  await db.save({payment});
  return {updatedOrder, payment};
};

/**
 * Get Gateway Credentials for a payment provider.
 *
 * @param {object} options - Options to use.
 * @param {string} options.service - The payment service name.
 *
 * @returns {object} The credentials needs for the client side payment.
 */
api.getGatewayCredentials = async ({service}) => {
  const {api} = injector.use(service);
  return api.getGatewayCredentials({service});
};

api.process = async ({payment}) => {
  const api = getGatewayApi(payment);
  const verifiedPurchase = api.process({payment});
  payment.validated = true;
  await db.save({payment});
  return verifiedPurchase;
};

/**
 * Throws an error if the payment is finished.
 *
 * @throws {BedrockError}
 *
 * @returns {boolean} Is the payment finished?
 */
api.finished = ({payment}) => {
  if(payment.status === PaymentStatus.SETTLED) {
    throw new BedrockError(
      'Payment already completed.', Errors.Duplicate, {public: true});
  }
  if(payment.status === PaymentStatus.FAILED) {
    throw new BedrockError(
      'Payment already failed.', Errors.Duplicate, {public: true});
  }
  if(payment.status === PaymentStatus.VOIDED) {
    throw new BedrockError(
      'Payment was canceled.', Errors.Duplicate, {public: true});
  }
  return false;
};

module.exports = api;
