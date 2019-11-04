const injector = require('./injector.js');

const api = {};

api.get = ({id}) => {
  const {api} = injector.use(id);
  return api;
};

module.exports = api;
