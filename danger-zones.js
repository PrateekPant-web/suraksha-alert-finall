// Danger Zones Implementation
let dangerZones = [];

// Initialize danger zones
function initDangerZones() {
    // Add alert-based danger zones
    addDangerZone({
        name: "Greater Noida Flood Warning",
        type: "flood",
        description: "Severe flooding expected in low-lying areas. Immediate evacuation recommended.",
        coordinates: {
            lat: 28.4744, // Greater Noida coordinates
            lng: 77.5040
        },
        radius: 3000, // 3km radius
        severity: "critical"
    });

    addDangerZone({
        name: "earthquake-zone",
        type: "earthquake",
        description: "⚠️ MAJOR EARTHQUAKE ALERT: A significant earthquake (magnitude 6.2) has been detected in this region. Emergency services are actively responding. If you are in this area, seek immediate shelter under sturdy furniture or in doorways. Avoid elevators and stay away from windows. After the shaking stops, evacuate to open areas if possible. Check for gas leaks and structural damage before re-entering buildings.",
        coordinates: {
            lat: 28.6288, // Noida Sector 62 coordinates
            lng: 77.3644
        },
        radius: 15000, // 15km radius
        severity: "critical"
    });

    addDangerZone({
        name: "New Earthquake Warning",
        type: "earthquake",
        description: "⚠️ SEISMIC ACTIVITY ALERT: Recent seismic activity (magnitude 4.8) detected in this area. Aftershocks are possible. If you feel shaking, remember to DROP, COVER, and HOLD ON. Stay indoors if possible and away from heavy objects that could fall. Emergency response teams are monitoring the situation. Tune to local emergency broadcasts for updates.",
        coordinates: {
            lat: 28.625436243579063,
            lng: 77.36456741595285
        },
        radius: 1500, // 1.5km radius
        severity: "high"
    });

    addDangerZone({
        name: "Delhi NCR Heavy Rainfall Zone",
        type: "flood",
        description: "Heavy rainfall expected in the next 2 hours. Prepare for potential waterlogging.",
        coordinates: {
            lat: 28.6139, // Delhi NCR coordinates
            lng: 77.2090
        },
        radius: 5000, // 5km radius
        severity: "medium"
    });
    
    addDangerZone({
        name: "Manali Landslide Alert",
        type: "landslide",
        description: "Landslide detected in mountainous region. Avoid travel in affected areas.",
        coordinates: {
            lat: 32.2432, // Manali coordinates
            lng: 77.1892
        },
        radius: 2000, // 2km radius
        severity: "high"
    });
    
    addDangerZone({
        name: "Manali Mountain Landslide",
        type: "landslide",
        description: "⚠️ CRITICAL LANDSLIDE ALERT: Recent heavy rainfall has triggered landslides in the mountainous region. Multiple roads are blocked. Avoid all travel in this area. Emergency services are working to clear debris. If you are in this area, move to higher ground immediately and stay away from steep slopes.",
        coordinates: {
            lat: 32.2567, // Different coordinates in Manali
            lng: 77.1756
        },
        radius: 3500, // 3.5km radius
        severity: "critical"
    });
    
    addDangerZone({
        name: "Manali Valley Landslide",
        type: "landslide",
        description: "⚠️ HIGH RISK LANDSLIDE ALERT: Unstable soil conditions detected in the valley region. Local authorities have issued a warning for potential landslides. Avoid hiking trails and steep slopes in this area. If you must travel through this region, exercise extreme caution and monitor local weather conditions.",
        coordinates: {
            lat: 32.2289, // New coordinates in Manali valley
            lng: 77.2015
        },
        radius: 2800, // 2.8km radius
        severity: "high"
    });

    // Add danger zones to the map
    dangerZones.forEach(zone => {
        displayDangerZone(zone);
    });

    // Add update notification
    addUpdate({
        type: 'info',
        message: `Loaded ${dangerZones.length} danger zones on the map`,
        timestamp: new Date()
    });
}

// Add a new danger zone
function addDangerZone(zone) {
    // Validate zone data
    if (!zone.name || !zone.type || !zone.coordinates || !zone.radius) {
        console.error('Invalid danger zone data:', zone);
        return false;
    }

    // Add to danger zones array
    dangerZones.push(zone);
    
    // Display on map if map is initialized
    if (typeof displayDangerZone === 'function') {
        displayDangerZone(zone);
    }
    
    return true;
}

// Display a danger zone on the map
function displayDangerZone(zone) {
    if (!map) {
        console.error('Map not initialized');
        return;
    }

    // Set color based on type first (for earthquakes)
    let fillColor, strokeColor;
    if (zone.type === 'earthquake') {
        fillColor = '#FF0000'; // Red
        strokeColor = '#CC0000';
    } else {
        // Set color based on severity for other types
        switch (zone.severity) {
            case 'critical':
                fillColor = '#FF0000'; // Red
                strokeColor = '#CC0000';
                break;
            case 'high':
                fillColor = '#FF6600'; // Orange
                strokeColor = '#CC5200';
                break;
            case 'medium':
                fillColor = '#FFCC00'; // Yellow
                strokeColor = '#CCA300';
                break;
            case 'low':
                fillColor = '#00CC00'; // Green
                strokeColor = '#009900';
                break;
            default:
                fillColor = '#FFCC00'; // Default yellow
                strokeColor = '#CCA300';
        }
    }

    // Set opacity based on type
    let fillOpacity;
    switch (zone.type) {
        case 'flood':
            fillOpacity = 0.5;
            break;
        case 'fire':
            fillOpacity = 0.5;
            break;
        case 'earthquake':
            fillOpacity = 0.5;
            break;
        case 'landslide':
            fillOpacity = 0.5;
            break;
        default:
            fillOpacity = 0.35;
    }

    // Create circle for danger zone
    const circle = new google.maps.Circle({
        strokeColor: strokeColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        map: map,
        center: zone.coordinates,
        radius: zone.radius,
        clickable: true
    });

    // Create marker for danger zone
    const marker = new google.maps.Marker({
        position: zone.coordinates,
        map: map,
        title: zone.name,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: fillColor,
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
        }
    });

    // Store references to the circle and marker
    zone.circle = circle;
    zone.marker = marker;

    // Add click event to show info window
    circle.addListener('click', () => {
        showDangerZoneInfo(zone);
    });

    marker.addListener('click', () => {
        showDangerZoneInfo(zone);
    });

    // Add update notification
    addUpdate({
        type: 'warning',
        message: `New ${zone.severity} severity ${zone.type} alert: ${zone.name}`,
        timestamp: new Date()
    });
}

// Show danger zone info window
function showDangerZoneInfo(zone) {
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="danger-zone-info">
                <h3>${zone.name}</h3>
                <p><strong>Type:</strong> ${zone.type}</p>
                <p><strong>Severity:</strong> ${zone.severity}</p>
                <p>${zone.description}</p>
            </div>
        `
    });
    
    infoWindow.setPosition(zone.coordinates);
    infoWindow.open(map);
}

// Check if a location is in any danger zone
function checkDangerZones(location) {
    if (!location || !location.lat || !location.lng) {
        console.error('Invalid location data:', location);
        return null;
    }

    for (const zone of dangerZones) {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(location.lat, location.lng),
            new google.maps.LatLng(zone.coordinates.lat, zone.coordinates.lng)
        );

        if (distance <= zone.radius) {
            // User is in a danger zone
            addUpdate({
                type: 'emergency',
                message: `⚠️ ALERT: You are in a ${zone.severity} severity ${zone.type} zone: ${zone.name}`,
                timestamp: new Date()
            });
            
            // Show info window
            showDangerZoneInfo(zone);
            
            return zone;
        }
    }

    return null;
}

// Export functions
module.exports = {
    initDangerZones,
    addDangerZone,
    displayDangerZone,
    showDangerZoneInfo,
    checkDangerZones,
    dangerZones
};