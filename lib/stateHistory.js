
exports.buildQuery = (carId) => [{
  refId: 'state',
  rawSql: `
    WITH states AS (
      SELECT
        unnest(ARRAY [start_date + interval '1 second', end_date]) AS date,
        unnest(ARRAY [2, 0]) AS state
      FROM charging_processes
      WHERE
        car_id = ${carId} AND 
        ($__timeFrom() :: timestamp - interval '30 day') < start_date AND 
        (end_date < ($__timeTo() :: timestamp + interval '30 day') OR end_date IS NULL)
      UNION
      SELECT
        unnest(ARRAY [start_date + interval '1 second', end_date]) AS date,
        unnest(ARRAY [1, 0]) AS state
      FROM drives
      WHERE
        car_id = ${carId} AND 
        ($__timeFrom() :: timestamp - interval '30 day') < start_date AND 
        (end_date < ($__timeTo() :: timestamp + interval '30 day') OR end_date IS NULL)
      UNION
      SELECT
        start_date AS date,
        CASE
          WHEN state = 'offline' THEN 3
          WHEN state = 'asleep' THEN 4
          WHEN state = 'online' THEN 5
        END AS state
      FROM states
      WHERE
        car_id = ${carId} AND 
        ($__timeFrom() :: timestamp - interval '30 day') < start_date AND 
        (end_date < ($__timeTo() :: timestamp + interval '30 day') OR end_date IS NULL)
      UNION
      SELECT
        unnest(ARRAY [start_date + interval '1 second', end_date]) AS date,
        unnest(ARRAY [6, 0]) AS state
      FROM updates
      WHERE
        car_id = ${carId} AND 
        ($__timeFrom() :: timestamp - interval '30 day') < start_date AND 
        (end_date < ($__timeTo() :: timestamp + interval '30 day') OR end_date IS NULL)
    )
    SELECT date AS "time", state
    FROM states
    WHERE 
      date IS NOT NULL AND
      ($__timeFrom() :: timestamp - interval '30 day') < date AND 
      date < ($__timeTo() :: timestamp + interval '30 day') 
    ORDER BY date ASC, state ASC;      
  `
}, {
  refId: 'range_battery',
  rawSql: `
    (
      SELECT $__timeGroup(date, '5s'), avg(battery_level) as "battery_level", convert_km(avg(ideal_battery_range_km), 'km') as "range"
      FROM positions
      WHERE date BETWEEN ($__timeFrom()::timestamp - interval '1 day') AND ($__timeTo()::timestamp + interval '1 day') AND car_id = ${carId}
      GROUP BY 1
    ) UNION ALL (
      SELECT $__timeGroup(date, '5s'), avg(battery_level) as "battery_level", convert_km(avg(ideal_battery_range_km), 'km') as "range"
      FROM charges c
      LEFT JOIN charging_processes p ON c.charging_process_id = p.id
      WHERE date BETWEEN ($__timeFrom()::timestamp - interval '1 day') AND ($__timeTo()::timestamp + interval '1 day') AND p.car_id = ${carId}
      GROUP BY 1
    )
    ORDER BY 1
  `
}];
