const dangerZones = require('./danger-zones.js');

dangerZones.addDangerZone({
  name: 'Manali Valley Landslide',
  type: 'landslide',
  description: '⚠️ HIGH RISK LANDSLIDE ALERT: Unstable soil conditions detected in the valley region. Local authorities have issued a warning for potential landslides. Avoid hiking trails and steep slopes in this area. If you must travel through this region, exercise extreme caution and monitor local weather conditions.',
  coordinates: {lat: 32.2289, lng: 77.2015},
  radius: 2800,
  severity: 'high'
});

console.log('Landslide zone added successfully!'); 