// Debug utilities for Suraksha Alert

// Function to check if the map is initialized
function checkMapInitialization() {
    console.log('Checking map initialization...');
    if (typeof map === 'undefined') {
        console.error('Map is not initialized!');
        return false;
    }
    console.log('Map is initialized:', map);
    return true;
}

// Function to check if danger zones are initialized
function checkDangerZonesInitialization() {
    console.log('Checking danger zones initialization...');
    if (typeof dangerZones === 'undefined') {
        console.error('Danger zones array is not initialized!');
        return false;
    }
    console.log('Danger zones array:', dangerZones);
    console.log('Number of danger zones:', dangerZones.length);
    
    // Check for earthquake zones
    const earthquakeZones = dangerZones.filter(zone => zone.type === 'earthquake');
    console.log('Number of earthquake zones:', earthquakeZones.length);
    
    if (earthquakeZones.length > 0) {
        console.log('Earthquake zones:', earthquakeZones);
    } else {
        console.error('No earthquake zones found in the danger zones array!');
    }
    
    return true;
}

// Function to check if a specific danger zone is displayed on the map
function checkDangerZoneDisplay(zone) {
    console.log('Checking if danger zone is displayed:', zone);
    
    if (!zone.circle) {
        console.error('Danger zone does not have a circle property!');
        return false;
    }
    
    if (!zone.marker) {
        console.error('Danger zone does not have a marker property!');
        return false;
    }
    
    console.log('Circle is on map:', zone.circle.getMap() !== null);
    console.log('Marker is on map:', zone.marker.getMap() !== null);
    
    return zone.circle.getMap() !== null && zone.marker.getMap() !== null;
}

// Function to check if the map is centered on a specific location
function checkMapCenter(lat, lng) {
    console.log('Checking map center...');
    if (!checkMapInitialization()) {
        return false;
    }
    
    const center = map.getCenter();
    console.log('Current map center:', center.lat(), center.lng());
    console.log('Expected center:', lat, lng);
    
    const distance = calculateDistance(center.lat(), center.lng(), lat, lng);
    console.log('Distance from expected center:', distance, 'meters');
    
    return distance < 1000; // Within 1km
}

// Function to check the map zoom level
function checkMapZoom() {
    console.log('Checking map zoom level...');
    if (!checkMapInitialization()) {
        return false;
    }
    
    const zoom = map.getZoom();
    console.log('Current map zoom level:', zoom);
    
    return zoom >= 10; // Zoomed in enough to see danger zones
}

// Function to check for console errors
function checkConsoleErrors() {
    console.log('Checking for console errors...');
    // This function can't actually check for errors that have already occurred,
    // but it can remind the user to check the console for errors.
    console.log('Please check the browser console for any errors.');
}

// Function to run all checks
function runAllChecks() {
    console.log('Running all debug checks...');
    
    const mapInitialized = checkMapInitialization();
    const dangerZonesInitialized = checkDangerZonesInitialization();
    const mapCentered = checkMapCenter(28.6288, 77.3644); // Noida Sector 62 coordinates
    const mapZoomed = checkMapZoom();
    
    checkConsoleErrors();
    
    console.log('Debug check results:');
    console.log('- Map initialized:', mapInitialized);
    console.log('- Danger zones initialized:', dangerZonesInitialized);
    console.log('- Map centered on Noida Sector 62:', mapCentered);
    console.log('- Map zoomed in enough:', mapZoomed);
    
    if (mapInitialized && dangerZonesInitialized) {
        // Check if earthquake zones are displayed
        const earthquakeZones = dangerZones.filter(zone => zone.type === 'earthquake');
        console.log('Checking if earthquake zones are displayed...');
        
        earthquakeZones.forEach((zone, index) => {
            const isDisplayed = checkDangerZoneDisplay(zone);
            console.log(`Earthquake zone ${index + 1} is displayed:`, isDisplayed);
        });
    }
}

// Function to manually display an earthquake zone
function manuallyDisplayEarthquakeZone() {
    console.log('Manually displaying earthquake zone...');
    
    if (!checkMapInitialization()) {
        return;
    }
    
    // Create a new earthquake zone
    const earthquakeZone = {
        name: "Manual Earthquake Zone",
        type: "earthquake",
        description: "This is a manually added earthquake zone for debugging purposes.",
        coordinates: {
            lat: 28.6288, // Noida Sector 62 coordinates
            lng: 77.3644
        },
        radius: 25000, // 25km radius
        severity: "critical"
    };
    
    // Add the zone to the map
    if (typeof addDangerZone === 'function') {
        addDangerZone(earthquakeZone);
        console.log('Earthquake zone added manually');
    } else {
        console.error('addDangerZone function not found!');
    }
}

// Function to center the map on Noida Sector 62
function centerOnNoidaSector62() {
    console.log('Centering map on Noida Sector 62...');
    
    if (!checkMapInitialization()) {
        return;
    }
    
    const noidaSector62Location = { lat: 28.6288, lng: 77.3644 };
    map.setCenter(noidaSector62Location);
    map.setZoom(14);
    
    console.log('Map centered on Noida Sector 62');
}

// Add debug buttons to the map
function addDebugButtons() {
    console.log('Adding debug buttons to the map...');
    
    if (!checkMapInitialization()) {
        return;
    }
    
    // Create a container for debug buttons
    const debugContainer = document.createElement('div');
    debugContainer.className = 'debug-container';
    debugContainer.style.position = 'absolute';
    debugContainer.style.bottom = '10px';
    debugContainer.style.left = '10px';
    debugContainer.style.zIndex = '1000';
    debugContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    debugContainer.style.padding = '10px';
    debugContainer.style.borderRadius = '5px';
    debugContainer.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    
    // Create debug buttons
    const runChecksButton = document.createElement('button');
    runChecksButton.textContent = 'Run Debug Checks';
    runChecksButton.style.marginRight = '5px';
    runChecksButton.addEventListener('click', runAllChecks);
    
    const displayZoneButton = document.createElement('button');
    displayZoneButton.textContent = 'Display Earthquake Zone';
    displayZoneButton.style.marginRight = '5px';
    displayZoneButton.addEventListener('click', manuallyDisplayEarthquakeZone);
    
    const centerMapButton = document.createElement('button');
    centerMapButton.textContent = 'Center on Noida Sector 62';
    centerMapButton.addEventListener('click', centerOnNoidaSector62);
    
    // Add buttons to container
    debugContainer.appendChild(runChecksButton);
    debugContainer.appendChild(displayZoneButton);
    debugContainer.appendChild(centerMapButton);
    
    // Add container to map
    map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(debugContainer);
    
    console.log('Debug buttons added to the map');
}

// Initialize debug functionality
function initDebug() {
    console.log('Initializing debug functionality...');
    
    // Wait for the map to be initialized
    const checkInterval = setInterval(() => {
        if (typeof map !== 'undefined') {
            clearInterval(checkInterval);
            console.log('Map detected, adding debug buttons...');
            addDebugButtons();
            runAllChecks();
            
            // Automatically display earthquake zone after a short delay
            setTimeout(() => {
                console.log('Automatically displaying earthquake zone...');
                manuallyDisplayEarthquakeZone();
                centerOnNoidaSector62();
            }, 2000);
        }
    }, 1000);
    
    // Set a timeout to stop checking after 10 seconds
    setTimeout(() => {
        clearInterval(checkInterval);
        if (typeof map === 'undefined') {
            console.error('Map not initialized after 10 seconds!');
        }
    }, 10000);
}

// Start debug functionality when the page loads
document.addEventListener('DOMContentLoaded', initDebug); 