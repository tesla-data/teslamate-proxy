const JsonFile = require('./JsonFile');

exports.buildQuery = (carId) => ({
  refId: 'projected_range',
  rawSql: `
SELECT
  $__timeGroup(date, '6h') AS time,
  convert_km((sum(ideal_battery_range_km) / nullif(sum(coalesce(usable_battery_level,battery_level)),0) * 100)::numeric, 'km') AS "projected_range",
  convert_km(avg(odometer)::numeric, 'km') AS "mileage"
FROM
  positions
WHERE car_id = ${carId} and $__timeFilter(date) and ideal_battery_range_km is not null
GROUP BY
  1
having convert_km((sum(ideal_battery_range_km) / nullif(sum(coalesce(usable_battery_level,battery_level)),0) * 100)::numeric, 'km') is not null
ORDER BY
  1,2  DESC
`
});
