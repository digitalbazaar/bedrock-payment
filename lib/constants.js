const Errors = {
  Constraint: 'ConstraintError',
  Data: 'DataError',
  Duplicate: 'DuplicateError',
  NotFound: 'NotFoundError',
  NotAllowed: 'NotAllowedError'
};

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

module.exports = {
  Errors,
  PaymentStatus
};

