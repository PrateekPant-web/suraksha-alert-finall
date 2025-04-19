// Function to wait for map initialization
function waitForMap(callback, maxAttempts = 20) {
    let attempts = 0;
    
    const checkInterval = setInterval(() => {
        attempts++;
        console.log(`Waiting for map to initialize... Attempt ${attempts}/${maxAttempts}`);
        
        if (typeof map !== 'undefined' && typeof google !== 'undefined') {
            clearInterval(checkInterval);
            console.log('Map detected!');
            callback();
            return;
        }
        
        if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.error('Map not initialized after maximum attempts!');
        }
    }, 1000);
}

// Function to add the Manali Valley Landslide zone
function addManaliLandslideZone() {
    console.log('Adding Manali Valley Landslide zone...');
    
    const landslideZone = {
        name: 'Manali Valley Landslide',
        type: 'landslide',
        description: '⚠️ HIGH RISK LANDSLIDE ALERT: Unstable soil conditions detected in the valley region. Local authorities have issued a warning for potential landslides. Avoid hiking trails and steep slopes in this area. If you must travel through this region, exercise extreme caution and monitor local weather conditions.',
        coordinates: {
            lat: 32.2289,
            lng: 77.2015
        },
        radius: 2800,
        severity: 'high'
    };

    // Create circle for the landslide zone
    const circle = new google.maps.Circle({
        strokeColor: '#FF6600',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF6600',
        fillOpacity: 0.5,
        map: map,
        center: landslideZone.coordinates,
        radius: landslideZone.radius,
        clickable: true
    });

    // Create marker for the landslide zone
    const marker = new google.maps.Marker({
        position: landslideZone.coordinates,
        map: map,
        title: landslideZone.name,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#FF6600',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
        }
    });

    // Add click event to show info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="danger-zone-info">
                <h3>${landslideZone.name}</h3>
                <p><strong>Type:</strong> ${landslideZone.type}</p>
                <p><strong>Severity:</strong> ${landslideZone.severity}</p>
                <p>${landslideZone.description}</p>
            </div>
        `
    });

    circle.addListener('click', () => {
        infoWindow.setPosition(landslideZone.coordinates);
        infoWindow.open(map);
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });

    // Center map on the landslide zone
    map.setCenter(landslideZone.coordinates);
    map.setZoom(13);

    console.log('Manali Valley Landslide zone added successfully!');
}

// Initialize when the script loads
waitForMap(() => {
    // Add a small delay to ensure everything is loaded
    setTimeout(addManaliLandslideZone, 2000);
}); 