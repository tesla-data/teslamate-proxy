
exports.buildQuery = (carId, length_unit = 'km', temp_unit = 'C') => ({
  refId: 'charges',
  rawSql: `
WITH data AS (
    SELECT
        (round(extract(epoch FROM start_date) - 10) * 1000) AS start_date_ts,
        (round(extract(epoch FROM end_date) + 10) * 1000) AS end_date_ts,
        start_date,
        end_date,
        CONCAT_WS(', ', COALESCE(addresses.name, nullif(CONCAT_WS(' ', addresses.road, addresses.house_number), '')), addresses.city) AS address,
        g.name as geofence_name,
        g.id as geofence_id,
        p.latitude,
        p.longitude,
        cp.charge_energy_added,
        cp.charge_energy_used,
        duration_min,
        start_battery_level,
        end_battery_level,
        start_ideal_range_km,
        end_ideal_range_km,
        outside_temp_avg,
        cp.id,
        lag(end_ideal_range_km) OVER (ORDER BY start_date) - start_ideal_range_km AS range_loss,
        p.odometer - lag(p.odometer) OVER (ORDER BY start_date) AS distance,
        cars.efficiency,
        cp.car_id,
        cost,
        max(c.charger_voltage) as max_charger_voltage,
        CASE WHEN NULLIF(mode() within group (order by charger_phases),0) is null THEN 'dc'
				  ELSE 'ac'
		    END AS mode
    FROM
        charging_processes cp
	  LEFT JOIN charges c ON cp.id = c.charging_process_id
    LEFT JOIN positions p ON p.id = cp.position_id
    LEFT JOIN cars ON cars.id = cp.car_id
    LEFT JOIN addresses ON addresses.id = cp.address_id
    LEFT JOIN geofences g ON g.id = geofence_id
WHERE 
    cp.car_id = ${carId} AND
    $__timeFilter(start_date) AND
    (cp.charge_energy_added IS NULL OR cp.charge_energy_added > 0)
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,11,12,13,14,15,16,17,18,21,p.odometer
ORDER BY
    start_date
)
SELECT
    mode,
    start_date_ts,
    end_date_ts,
    CASE WHEN geofence_id IS NULL THEN CONCAT('new?lat=', latitude, '&lng=', longitude)
         WHEN geofence_id IS NOT NULL THEN CONCAT(geofence_id, '/edit')
    END as path,
    car_id,
    id,
    -- Columns
    start_date,
    end_date,
    COALESCE(geofence_name, address) as address,    
    duration_min,
    cost,
    charge_energy_added,
    charge_energy_used,
    CASE WHEN charge_energy_used IS NULL THEN NULL ELSE LEAST(charge_energy_added / NULLIF(charge_energy_used, 0), 1.0) END as charging_efficiency,
    convert_celsius(outside_temp_avg, '${temp_unit}') AS outside_temp_avg_${temp_unit},
    charge_energy_added * 60 / NULLIF (duration_min, 0) AS charge_energy_added_per_hour,
    convert_km((end_ideal_range_km - start_ideal_range_km) * 60 / NULLIF (duration_min, 0), '${length_unit}') AS range_added_per_hour_${length_unit},
    start_battery_level,
    end_battery_level,
    convert_km(distance::numeric, '${length_unit}') AS distance_${length_unit}
 FROM
    data
WHERE
    (distance >= 0 OR distance IS NULL)
ORDER BY
  start_date DESC;
`
})