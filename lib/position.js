
const rawPosition = (carId, from, to, length_unit = 'km', temp_unit = 'C', alternative_length_unit = 'm') => `
SELECT
	$__time(date),
  ROUND(convert_m(elevation, '${alternative_length_unit}')) AS "Elevation [${alternative_length_unit}]",
  latitude,
  longitude,
	convert_km(speed::numeric, '${length_unit}') AS "Speed [${length_unit}/h]",
	power AS "Power [kW]",
	battery_heater::integer*100 AS "Preconditioning",
	convert_km(ideal_battery_range_km, '${length_unit}') AS "range",
	--convert_km(est_battery_range_km, '${length_unit}') AS "Range (est.) [${length_unit}]",
	battery_level,
	usable_battery_level,
  convert_celsius(outside_temp, '${temp_unit}') AS "Outside Temperature [°${temp_unit}]",
	convert_celsius(inside_temp, '${temp_unit}') AS "Inside Temperature [°${temp_unit}]",
	convert_celsius(driver_temp_setting, '${temp_unit}') as "Driver Temperature [°${temp_unit}]",
	convert_celsius(passenger_temp_setting, '${temp_unit}') as "Passenger Temperature [°${temp_unit}]",
  is_climate_on::integer,
	fan_status
FROM
	positions
WHERE
 car_id = ${carId} AND
 $__timeFilter(date)
ORDER BY
	date ASC
`

const timeGroupHours = [1, 2, 5, 24, 24 * 35, 24 * 100, 24 * 200, 24 * 366]
const timeGroups     = [1, 2, 5, 10, 15,      30,       60,       120]
function getTimeGroup(from, to) {
  return timeGroups[timeGroupHours.findIndex(v => to - from < v * 3600 * 1000)] || 180;
}

const groupedPosition = (carId, from, to, length_unit = 'km', temp_unit = 'C', alternative_length_unit = 'm') => `
SELECT
	$__timeGroup(date, '${getTimeGroup(from, to)}s'),
  ROUND(convert_m(avg(elevation), '${alternative_length_unit}')) AS "Elevation [${alternative_length_unit}]",
  avg(latitude) AS latitude,
  avg(longitude) AS longitude,
	convert_km(avg(speed::numeric), '${length_unit}') AS "Speed [${length_unit}/h]",
	max(power) AS "Power [kW]",
	avg(battery_heater::integer*100) AS "Preconditioning",
	convert_km(avg(ideal_battery_range_km), '${length_unit}') AS "range",
	avg(battery_level) AS "battery_level",
	avg(usable_battery_level) AS "usable_battery_level"
  --convert_celsius(avg(outside_temp), '${temp_unit}') AS "Outside Temperature [°${temp_unit}]",
	--convert_celsius(avg(inside_temp), '${temp_unit}') AS "Inside Temperature [°${temp_unit}]",
	--convert_celsius(avg(driver_temp_setting), '${temp_unit}') as "Driver Temperature [°${temp_unit}]",
	--convert_celsius(avg(passenger_temp_setting), '${temp_unit}') as "Passenger Temperature [°${temp_unit}]",
  --avg(is_climate_on::integer),
	--avg(fan_status)
FROM
	positions
WHERE
 car_id = ${carId} AND
 $__timeFilter(date)
GROUP BY
 1
ORDER BY
 1 ASC
`

exports.buildQuery = (carId, from, to, length_unit = 'km', temp_unit = 'C', alternative_length_unit = 'm') => ({
  refId: 'position',
  rawSql: to - from < 600 * 1000 ? rawPosition(carId, from, to, length_unit, temp_unit, alternative_length_unit) : groupedPosition(carId, from, to, length_unit, temp_unit, alternative_length_unit)
})