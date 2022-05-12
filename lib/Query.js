const axios = require('axios');
const JsonFile = require('./JsonFile');

module.exports = class {
  constructor(url, Authorization) {
    this.url = url + '/api/ds/query';
    this.Authorization = Authorization;
  }

  getJsonFile(path, carId) {
    return new JsonFile(path, this.url + this.Authorization, carId);
  }

  async execute(queries, from, to) {
    const { url, Authorization } = this;
    if (!url || !Authorization) return;
    if (from) from = from.toString();
    if (to) to = to.toString();

    const payload = { from, to, queries: queries.map(({ refId, rawSql }) => ({ refId, datasourceId: 1, rawSql, format: 'table' })) };
    const { data: { results } } = await axios.post(url, payload, { headers: { Authorization } });

    const ret = queries.map(({ refId }) => {
      if (results[refId].tables) {
        return results[refId].tables[0].rows.map(r => r.reduce((m, v, i) => { m[results[refId].tables[0].columns[i].text] = v; return m }, {}));
      } else {
        return results[refId].frames[0].data.values[0].map((_, i) => results[refId].frames[0].schema.fields.reduce((m, v, fi) => { m[v.name] = results[refId].frames[0].data.values[fi][i]; return m }, {}));
      }
    })

    return ret.length === 1 ? ret[0] : ret
  }

  async cachedQuery(queries, from, to, carId, cachePath, timeGetter, mergeData) {
    if (!from) {
      const file = this.getJsonFile(cachePath, carId);
      const data = file.load();
      if (data) {
        from = timeGetter(data);
        const ret = await this.execute(queries, from, to);
        const merged = mergeData(data, ret);
        file.save(merged);
        return merged;
      } else {
        const ret = await this.execute(queries, '0', to);
        file.save(ret);
        return ret;
      }
    } else {
      return await this.execute(queries, from, to);
    }
  }
}