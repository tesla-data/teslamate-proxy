const JsonFile = require('../../lib/JsonFile');
const Query = require('../../lib/Query');
const drivesQ = require('../../lib/drive/drives');
const chargesQ = require('../../lib/charges');
const position = require('../../lib/position');

const { saveCharge } = require('./charge');
const { saveDrive } = require('./drive');

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, car_id, from, to } } = ctx;
  const jsonFile = new JsonFile('/share/trip', url + authorization, `${car_id}_${from}_${to}`);

  if (!jsonFile.exists() || to > Date.now()) {
    const query = new Query(url, authorization);
    const [drives, charges, positions] = await query.execute([
        drivesQ.buildQuery(car_id),
        chargesQ.buildQuery(car_id),
        position.buildQuery(car_id, from, to)
      ],
      from, to
    );

    for (const c of charges) {
      await saveCharge({ authorization, url, car_id, charge_id: c.id });
    }

    for (const d of drives) {
      await saveDrive({ authorization, url, drive_id: d.drive_id });
    }

    jsonFile.save({ drives, charges, positions });
  }

  const { hash, id } = jsonFile;
  ctx.body = { path: '/share/trip', hash, id: id };
};