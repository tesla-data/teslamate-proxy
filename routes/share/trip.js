const JsonFile = require('../../lib/JsonFile');
const Query = require('../../lib/Query');
const drivesQ = require('../../lib/drive/drives');
const chargesQ = require('../../lib/charges');
const position = require('../../lib/position');

const { saveCharge } = require('./charge');
const { saveDrive } = require('./drive');

const version = 'v2'

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, car_id, from, to } } = ctx;
  if (to - from > 1000 * 60 * 60 * 24 * 7) {
    ctx.body = { error: 'Too long period' };
    return ;
  }

  const jsonFile = new JsonFile('/share/trip', url + authorization, `${car_id}_${from}_${to}`);

  if (!jsonFile.exists() || jsonFile.load().version !== version || to > Date.now()) {
    const query = new Query(url, authorization);
    const [drives, charges, positions] = await query.execute([
        drivesQ.buildQuery(car_id),
        chargesQ.buildQuery(car_id),
        position.buildQuery(car_id, from, to)
      ],
      from, to
    );

    const mergedCharges = charges.reduce((arr, v) => {
      const last = arr[arr.length - 1]
      if (last &&
          last.address === v.address && last.car_id === v.car_id && last.mode === v.mode &&
          last.latitude === v.latitude && last.longitude === v.longitude &&
          v.end_date_ts + 10 * 60 * 1000 < last.start_date_ts
      ) {
        last.duration_min += v.duration_min
        last.charge_energy_added += v.charge_energy_added
        last.start_date = v.start_date
        last.start_date_ts = v.start_date_ts
      } else {
        arr.push(v)
      }

      return arr
    }, [])
    
    for (const c of mergedCharges) {
      await saveCharge({ authorization, url, car_id, charge_id: c.id, from: c.start_date_ts, to: c.end_date_ts });
    }

    for (const d of drives) {
      await saveDrive({ authorization, url, drive_id: d.drive_id });
    }

    jsonFile.save({ drives, charges, positions, version });
  }

  const { hash, id } = jsonFile;
  ctx.body = { path: '/share/trip', hash, id: id };
};