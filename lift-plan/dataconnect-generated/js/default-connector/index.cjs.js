const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'lift-plan',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

