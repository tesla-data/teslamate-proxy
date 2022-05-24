const defDriveTable = require('./table');

exports.buildQuery = (drive_id, length_unit = 'km', temp_unit = 'C') => ({
  refId: 'drive',
  rawSql: `
${defDriveTable(null, length_unit)}
SELECT
  start_date_ts,
  end_date_ts,
  car_id,
  start_km,
  end_km,
  start_ideal_range_km,
  end_ideal_range_km,
  start_path,
  end_path,
  duration_str,
  drive_id,
  -- Columns
  start_date as start_date_km,
  start_address,
  end_address,
  duration_min,
  convert_km(distance::numeric, '${length_unit}') AS distance_${length_unit},
  start_battery_level as "% Start",
  end_battery_level as "% End",
  convert_celsius(outside_temp_avg, '${temp_unit}') AS outside_temp_${temp_unit},
  convert_km(avg_speed::numeric, '${length_unit}') AS speed_avg_${length_unit},
  power_max,
  reduced_range as has_reduced_range,
  range_diff * car_efficiency as "consumption_kWh",
  range_diff * car_efficiency / distance * 1000 * CASE WHEN '${length_unit}' = 'km' THEN 1
                                                    WHEN '${length_unit}' = 'mi' THEN 1.60934
                                                  END
  AS consumption_kWh_${length_unit},
  CASE WHEN is_sufficiently_precise THEN distance / range_diff
        ELSE NULL
  END AS efficiency
FROM data WHERE drive_id = ${drive_id};
  `
});