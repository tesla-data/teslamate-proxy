const JsonFile = require('../../lib/JsonFile');
const Query = require('../../lib/Query');
const charges = require('../../lib/charges');
const chargeDetail = require('../../lib/chargeDetail');

async function saveCharge({ authorization, url, car_id, charge_id, from, to }) {
  const jsonFile = new JsonFile('/share/charge', url + authorization, charge_id);

  if (!jsonFile.exists()) {
    const query = new Query(url, authorization);
    const [detail] = await query.execute(chargeDetail.buildQuery(charge_id, car_id), from, to);
    const [charge] = await query.execute([charges.buildQuery(car_id)], detail[0].time, detail[detail.length - 1].time);
    jsonFile.save({ detail, charge });
  }

  return jsonFile;
}

module.exports = async (ctx) => {
  const { header: { authorization }, query: { url, car_id, charge_id, from, to } } = ctx;
  const { hash, id } = await saveCharge({ authorization, url, car_id, charge_id, from, to });
  ctx.body = { path: '/share/charge', hash, id };
};

module.exports.saveCharge = saveCharge;