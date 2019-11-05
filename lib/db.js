const bedrock = require('bedrock');
const database = require('bedrock-mongodb');
const {config} = bedrock;
const {BedrockError} = bedrock.util;
const logger = require('./logger.js');
const {Errors} = require('./constants.js');

const collection = () =>
  database.collections[config.bedrock_payment.collectionName];

const _projection = {_id: 0, __index: 0};

const api = {};
/**
 * Saves the current Payment.
 *
 * @param {object} [options] - Options for the save.
 * @param {Payment} options.payment - A payment.
 * @param {object} [options.options] - Options for the save.
 *
 * @returns {object} Returns the result of the save.
 */
api.save = async ({
  payment,
  options = {upsert: true, projection: _projection}} = {}
) => {
  if(!payment.id) {
    throw new BedrockError(
      'Invalid Payment Save. You must set an id', Errors.Data);
  }
  const data = await collection().findOneAndUpdate(
    {_id: payment.id},
    payment,
    options
  );
  logger.info('PAYMENT SAVED', {id: payment.id, status: payment.status});
  return data;
};

/**
 * Finds a payment by the query.
 *
 * @param {object} options - Options to use.
 * @param {object} options.query - Query to find the payments.
 * @param {object} [options.projection = _projection] - What fields to return.
 *
 * @returns {Payment|undefined} Returns The Payment or undefined.
 */
api.findOne = async ({query, projection = _projection}) => {
  const result = await collection().findOne(query, projection);
  if(!result) {
    return result;
  }
  logger.info('EXISTING PAYMENT FOUND', {id: result.id});
  return result;
};

/**
 * Finds payments by query.
 *
 * @param {object} options - Options to use.
 * @param {object} options.query - Query to find the payments.
 * @param {object} [options.projection = _projection] - Which fields
 *   to not return.
 *
 * @returns {Array<Payment>} Returns an Array of Payments.
 */
api.findAll = async ({query, projection = _projection}) => {
  const result = await collection().find(query, projection).toArray();
  return result;
};

/**
 * Mongo pseudo-atomic operation. This can be used to ensure
 * we are updating a payment that is PROCESSING etc.
 *
 * @param {object} options - Options to use.
 * @param {object} options.query - Query to find the payment.
 * @param {object} options.payment - The updated payment.
 * @param {object} [options.projection = _projection] - Which fields
 *   to not return.
 *
 * @returns {Array<Payment>} Returns an Array of Payments.
 */
api.findOneAndUpdate = async ({query, payment, projection = _projection}) => {
  const options = {projection};
  const result = await collection().findOneAndUpdate(query, payment, options);
  return result;
};

module.exports = api;
