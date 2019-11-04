/*!
 * Copyright (c) 2018-2019 Digital Bazaar, Inc. All rights reserved.
 */

// These are the Payment Statuses.
const PaymentStatus = {
  // before the user's payment has been made on the payment gateway.
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  // gateway payment has been processed order is being fulfilled.
  PROCESSING: 'PROCESSING',
  FAILED: 'FAILED',
  // used when the payment has been refunded by the payment gateway.
  VOIDING: 'VOIDING',
  VOIDED: 'VOIDED',
  // A successful processing ends here.
  SETTLING: 'SETTLING',
  // Final status after the order has completed.
  SETTLED: 'SETTLED'
};

/**
 * Payment is class that tracks payments from various providers.
 * It can be used on the front and back end to ensure consistency.
 *
 * @param {object} options - Options to use.
 * @param {string} options.id - An id to use for the payment.
 * @param {string} options.amount - The amount of the payment.
 * @param {string} options.creator - The payee's account id.
 * @param {string} options.service - The payment service to use.
 * @param {string} [options.currency = 'USD'] - The currency of the payment.
 * @param {Array<string>} options.orders - The productIds of the products
 *   being purchased.
 * @param {string} [options.stats = PaymentStatus.PENDING] - The payment status.
 * @param {string} [options.created = RFC3339 Date] - Date created.
 *
 * @returns {Payment} A payment class.
 */
class Payment {
  constructor({
    id, amount, creator, service, serviceId, orders,
    currency = 'USD',
    status = PaymentStatus.PENDING,
    validated = false,
    created = new Date().toISOString(),
    error = null
  }) {
    this.id = id;
    // https://developer.paypal.com/docs/api/reference/currency-codes/
    this.amount = amount;
    this.currency = currency;
    this.creator = creator;
    this.validated = validated;
    this.service = service;
    this.serviceId = serviceId;
    this.status = status;
    this.error = error;
    this.orders = orders;
    this.created = created;
  }
}

module.exports = {Payment, PaymentStatus};
