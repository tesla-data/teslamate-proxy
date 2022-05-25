const axios = require('axios');
const JsonFile = require('./JsonFile');

module.exports = class {
  constructor(url, authorization) {
    this.url = url + '/api/ds/query';
    this.authorization = authorization;
  }

  getJsonFile(path, carId) {
    return new JsonFile(path, this.url + this.authorization, carId);
  }

  async execute(queries, from, to) {
    const { url, authorization } = this;
    if (!url || !authorization) return;
    if (from) from = from.toString();
    if (to) to = to.toString();

    const payload = { from, to, queries: queries.map(({ refId, rawSql }) => ({ refId, datasourceId: 1, rawSql, format: 'table' })) };
    const { data: { results } } = await axios.post(url, payload, { headers: { authorization } });

    const ret = queries.map(({ refId }) => {
      if (results[refId].tables) {
        return results[refId].tables[0].rows.map(r => r.reduce((m, v, i) => { m[results[refId].tables[0].columns[i].text] = v; return m }, {}));
      } else {
        return results[refId].frames[0].data.values[0].map((_, i) => results[refId].frames[0].schema.fields.reduce((m, v, fi) => { m[v.name] = results[refId].frames[0].data.values[fi][i]; return m }, {}));
      }
    })

    return ret.length === 1 ? ret[0] : ret
  }

  async cachedQuery(queries, from, to, carId, cachePath, timeGetter, mergeData, requireVersion) {
    if (!from) {
      const file = this.getJsonFile(cachePath, carId);
      const { version, data } = file.load() || {};
      if (data && version === requireVersion) {
        from = timeGetter(data);
        const ret = await this.execute(queries, from, to);
        const merged = mergeData(data, ret);
        file.save({ version, data: merged });
        return merged;
      } else {
        const ret = await this.execute(queries, '0', to);
        file.save({ version: requireVersion, data: ret });
        return ret;
      }
    } else {
      return await this.execute(queries, from, to);
    }
  }
}