const JsonFile = require('../../lib/JsonFile');
const Query = require('../../lib/Query');
const drivesQ = require('../../lib/drive/drives');
const chargesQ = require('../../lib/charges');
const position = require('../../lib/position');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, car_id, from, to } } = ctx;
  const jsonFile = new JsonFile('/share/trip', url + authorization, `${car_id}_${from}_${to}`);

  if (!jsonFile.exists()) {
    const query = new Query(url, authorization);
    const [drives, charges, positions] = await query.execute([
        drivesQ.buildQuery(car_id),
        chargesQ.buildQuery(car_id),
        position.buildQuery(car_id, from, to)
      ],
      from, to
    );

    jsonFile.save({ drives, charges, positions });
  }

  const { hash, id } = jsonFile;
  ctx.body = { path: '/share/drive', hash, id: id };
};