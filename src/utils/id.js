const { randomUUID } = require('crypto');

const createId = () => randomUUID();

module.exports = { createId };
