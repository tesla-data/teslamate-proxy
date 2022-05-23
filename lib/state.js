const fields = 'battery_heater, battery_heater_on, battery_heater_no_power, outside_temp, ideal_battery_range_km, battery_level, usable_battery_level, date'

exports.buildQuery = (carId) => [
  {
    refId: 'vs1',
    rawSql: `
      SELECT ${fields} FROM (
        (SELECT ${fields} FROM positions WHERE car_id = ${carId} AND usable_battery_level IS NOT NULL ORDER BY date DESC LIMIT 1) UNION
        (SELECT ${fields} FROM charges c JOIN charging_processes p ON p.id = c.charging_process_id WHERE p.car_id = ${carId} AND usable_battery_level IS NOT NULL ORDER BY date DESC LIMIT 1)
      ) AS data ORDER BY date DESC LIMIT 1;
    `
  }, {
    refId: 'vs2',
    rawSql: `SELECT odometer, inside_temp, driver_temp_setting, fan_status, is_climate_on, date FROM positions WHERE car_id = ${carId} ORDER BY date DESC LIMIT 1`
  }, {
    refId: 'charge',
    rawSql: `
      WITH charging_process AS (
        SELECT id AS cid, end_date
        FROM charging_processes
        WHERE car_id = ${carId}
        ORDER BY start_date DESC
        LIMIT 1
      )
      SELECT *
      FROM charges, charging_process
      WHERE charging_process.cid = charging_process_id
      ORDER BY date DESC
      LIMIT 1;
    `
  }, {
    refId: 'update',
    rawSql: `SELECT * FROM updates WHERE car_id = ${carId} ORDER BY id DESC LIMIT 1;`
  }
];

exports.parse = (states) => {
  const charge = states[2][0].end_date ? null : states[2][0]
  const update = states[3][0]
  return { ...states[0][0], ...states[1][0], date: states[0][0].date > states[1][0].date ? states[0][0].date : states[1][0].date, charge, update }
}