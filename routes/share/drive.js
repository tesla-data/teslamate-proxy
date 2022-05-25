const JsonFile = require('../../lib/JsonFile');
const Query = require('../../lib/Query');
const driveDetail = require('../../lib/drive/detail');
const position = require('../../lib/position');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, drive_id } } = ctx;
  const jsonFile = new JsonFile('/share/drive', url + authorization, drive_id);

  if (!jsonFile.exists()) {
    const query = new Query(url, authorization);
    const [drive] = await query.execute([driveDetail.buildQuery(drive_id)]);
    const { car_id, start_date_ts, end_date_ts } = drive;
    const positions = await query.execute([position.buildQuery(car_id, start_date_ts, end_date_ts)], start_date_ts, end_date_ts);
    jsonFile.save({ drive, positions });
  }

  const { hash } = jsonFile;
  ctx.body = { path: '/share/drive', hash, id: drive_id };
};