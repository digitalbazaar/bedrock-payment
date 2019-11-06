const bedrock = require('bedrock');
const {promisify} = require('util');
const database = require('bedrock-mongodb');
const logger = require('./logger');

const {config} = bedrock;
// open some collections once the database is ready
bedrock.events.on('bedrock-mongodb.ready', async () => {
  const {collectionName} = config.bedrock_payment;
  logger.debug('CREATING PAYMENT COLLECTION', {collectionName});
  const collections = [
    collectionName
  ];
  await promisify(database.openCollections)(collections);
  await promisify(database.createIndexes)([
    {
      collection: collectionName,
      fields: {id: 1},
      options: {unique: true, background: false}
    },
    {
      collection: collectionName,
      fields: {serviceId: 1},
      // serviceIds can come from multiple payment providers
      // so we can't safely assume they will be unique.
      options: {unique: false, background: false}
    },
    {
      collection: collectionName,
      fields: {creator: 1},
      options: {unique: false, background: false}
    },
    // ex: PayPal, Stripe, etc.
    {
      collection: collectionName,
      fields: {service: 1},
      options: {unique: false, background: false}
    }
  ]);
});
