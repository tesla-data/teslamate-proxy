const JsonFile = require('../../lib/JsonFile');
const Query = require('../../lib/Query');
const driveDetail = require('../../lib/drive/detail');
const position = require('../../lib/position');

const version = 'v2'

async function saveDrive({ authorization, url, drive_id }) {
  const jsonFile = new JsonFile('/share/drive', url + authorization, drive_id);

  if (!jsonFile.exists() || jsonFile.load().version !== version) {
    const query = new Query(url, authorization);
    const [drive] = await query.execute([driveDetail.buildQuery(drive_id)]);
    const { car_id, start_date_ts, end_date_ts } = drive;
    const positions = await query.execute([position.buildQuery(car_id, start_date_ts, end_date_ts)], start_date_ts, end_date_ts);
    jsonFile.save({ drive, positions, version });
  }

  return jsonFile;
}

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, drive_id } } = ctx;

  const { hash } = await saveDrive({ authorization, url, drive_id });
  ctx.body = { path: '/share/drive', hash, id: drive_id };
};

module.exports.saveDrive = saveDrive;