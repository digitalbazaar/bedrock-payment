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
 * Registers or retrieves a payment or order plugin.
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
const getGatewayPlugin = ({paymentService}) => {
  const {api} = injector.use(paymentService);
  return api;
};

/**
 * Creates a Payment on a Gateway.
 *
 * @param {object} options - Options to use.
 * @param {string} options.creator - The account creating the payment.
 * @param {object} options.paymentData - Payment Data.
 *
 * @return {object, object} Returns the gateway order and bedrock payment.
 */
api.createPayment = async ({creator, paymentData}) => {
  const {paymentService, amount, orders} = paymentData;
  paymentData.id = `urn:uuid:${bedrock.util.uuid()}`;
  paymentData.creator = creator;
  const plugin = getGatewayPlugin({paymentService});
  const {order, payment} = await plugin.createGatewayPayment(
    {payment: paymentData});
  await db.save({payment});
  return {order, payment};
};

/**
 * Updates a payment the user has not been charged for yet.
 *
 * @param {object} options - Options to use.
 * @param {Array<object>} options.pendingPayments - Should be an array with
 *   a single payment (payment-http should throw if more than one).
 * @param {object} options.updatedPayment - the next payment amount.
 *
 * @return {object, object} - The updated order and payment.
 */
api.updatePendingPayment = async ({pendingPayments, updatedPayment}) => {
  logger.debug('Update Payment started.', {pendingPayments, updatedPayment});
  const pendingPayment = pendingPayments.find(p => p.id === updatedPayment.id);
  if(!pendingPayment) {
    throw new BedrockError(
      `Could not find pendingPayment for ${updatedPayment.id}`, Errors.NotFound);
  }
  // this will throw if the order has been deleted
  // or the order's amount does not match the expectedAmount.
  const plugin = getGatewayPlugin(pendingPayment);
  const {updatedOrder, payment} = await plugin.updateGatewayPaymentAmount(
    {pendingPayment, updatedPayment});
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

// this is the process gateway payment api.
api.process = async ({payment}) => {
  const plugin = getGatewayPlugin(payment);
  const verifiedPurchase = plugin.processGatewayPayment({payment});
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
