const Query = require('../lib/Query');
const charges = require('../lib/charges');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, car_id, from = 0, to = Date.now() } } = ctx;
  const query = new Query(url, authorization);
  ctx.body = await query.cachedQuery(
    [charges.buildQuery(car_id)], from, to, car_id, '/charges',
    (data) => data[0] && data[0].start_date_ts || '0',
    (data, ret) => {
      data.shift();
      data.unshift(...ret);
      return data;
    },
    'v1'
  );
};