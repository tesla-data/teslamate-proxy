const JsonFile = require('../../lib/JsonFile');

module.exports = async (ctx) => {
  const { query: { path, hash, id } } = ctx;
  const jsonFile = new JsonFile('/share/drive');
  jsonFile.setPath(path, hash, id);

  ctx.body = jsonFile.load();
};