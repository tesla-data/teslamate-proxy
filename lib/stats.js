
exports.buildQuery = (carId, period = 'month', timezone = 'Asia/Shanghai', length_unit = 'km', temp_unit = 'C') => ({
  refId: 'stats',
  rawSql: `
WITH data AS (
SELECT
  duration_min > 1 AND
  distance > 1 AND
  (
    start_position.usable_battery_level IS NULL OR
    (end_position.battery_level - end_position.usable_battery_level) = 0 
  ) AS is_sufficiently_precise,
  NULLIF(GREATEST(start_ideal_range_km - end_ideal_range_km, 0), 0) AS range_diff,
  -- with Postgres 12:
  -- date_trunc('${period}', start_date::TIMESTAMP WITHOUT TIME ZONE, '${timezone}') as local_period,
  date_trunc('${period}', (start_date::TIMESTAMP WITHOUT TIME ZONE) AT TIME ZONE '${timezone}') as local_period,
  drives.*
FROM drives
  LEFT JOIN positions start_position ON start_position_id = start_position.id
  LEFT JOIN positions end_position ON end_position_id = end_position.id)
SELECT
  EXTRACT(EPOCH FROM date_trunc('${period}', local_period))*1000 AS date_from,
  EXTRACT(EPOCH FROM date_trunc('${period}', local_period + ('1 ' || '${period}')::INTERVAL))*1000 AS date_to,
  CASE '${period}'
    WHEN 'month' THEN to_char(local_period, 'YYYY Month')
    WHEN 'year' THEN to_char(local_period, 'YYYY')
    WHEN 'week' THEN 'week ' || to_char(local_period, 'WW') || ' starting ' || to_char(local_period, 'YYYY-MM-DD')
    ELSE to_char(local_period, 'YYYY-MM-DD')
  END AS display,
  local_period AS date,
  sum(duration_min)*60 AS sum_duration_h, 
  convert_km(max(end_km)::integer - min(start_km)::integer, '${length_unit}') AS sum_distance_${length_unit},
  convert_celsius(avg(outside_temp_avg), '${temp_unit}') AS avg_outside_temp_${temp_unit},
  count(*) AS cnt,
  sum(distance)/sum(range_diff) AS efficiency
FROM data WHERE
  car_id = ${carId}
  AND $__timeFilter(start_date)
GROUP BY date
ORDER BY date DESC;
  `
});