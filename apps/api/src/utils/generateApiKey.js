const crypto = require('crypto');

function generateApiKey() {
  return `ff_proj_${crypto.randomBytes(16).toString('hex')}`;
}

module.exports = { generateApiKey };
