const injector = require('./injector');

const api = {};

// this gets the project's order processor.
// Should be set in a config file.
api.get = ({id}) => {
  const {api} = injector.use(id);
  return api;
};

module.exports = api;
