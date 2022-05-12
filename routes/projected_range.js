const Query = require('../lib/Query');
const projectedRange = require('../lib/projectedRange');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, car_id, from = 0, to = Date.now() } } = ctx;
  const query = new Query(url, authorization);
  ctx.body = await query.cachedQuery(
    [projectedRange.buildQuery(car_id)], from, to, car_id, '/projected_range',
    (data) => data[data.length - 1] && data[data.length - 1].time || '0',
    (data, ret) => {
      data.pop();
      data.push(...ret);
      return data;
    }
  );
};