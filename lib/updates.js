
exports.buildQuery = (carId, length_unit = 'km') => ({
  refId: 'updates',
  rawSql: `
with u as (
  select *, coalesce(lag(start_date) over(order by start_date desc), now()) as next_start_date 
  from updates
  where car_id = ${carId} and $__timeFilter(start_date)
),
rng as (
  SELECT
	  to_timestamp(floor(extract(epoch from date)/21600)*21600) AS date,
	  (sum(ideal_battery_range_km) / sum(coalesce(usable_battery_level,battery_level)) * 100 ) AS "battery_rng"
  FROM (
    select battery_level, usable_battery_level, date, rated_battery_range_km, ideal_battery_range_km
    from positions
    where car_id = ${carId} and $__timeFilter(date) and ideal_battery_range_km is not null
    union all
    select battery_level, coalesce(usable_battery_level,battery_level) as usable_battery_level, date, rated_battery_range_km, ideal_battery_range_km
    from charges c
    join charging_processes p ON p.id = c.charging_process_id 
    where $__timeFilter(date) and p.car_id = ${carId}
  ) as data
  GROUP BY 1
)

select	
  u.start_date as time,
	extract(EPOCH FROM u.end_date - u.start_date) AS update_duration,
	extract(EPOCH FROM u.start_date - lag(u.start_date) OVER (ORDER BY u.start_date)) AS since_last_update,
	split_part(u.version, ' ', 1) as version,
	count(distinct cp.id) as chg_ct,
	convert_km(avg(r.battery_rng), '${length_unit}')::numeric(6,2) AS avg_ideal_range_${length_unit}
from u u
left join charging_processes cp
	ON u.car_id = cp.car_id
 	and cp.start_date between u.start_date and u.next_start_date
left join rng r
	ON r.date between u.start_date and u.next_start_date
group by u.car_id,
	u.start_date,
	u.end_date,
	next_start_date,
	split_part(u.version, ' ', 1)
`
});