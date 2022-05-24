const Query = require('../lib/Query');
const driveDetail = require('../lib/drive/detail');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, drive_id } } = ctx;
  const query = new Query(url, authorization);
  ctx.body = await query.execute([driveDetail.buildQuery(drive_id)]);
};