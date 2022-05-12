const axios = require('axios');

module.exports = class {
  constructor(url, Authorization) {
    this.url = url + '/api/ds/query';
    this.Authorization = Authorization;
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
}