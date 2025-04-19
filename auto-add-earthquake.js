// Auto-add earthquake zone script
// This script will automatically add an earthquake zone to the map when loaded

// Function to wait for the map to be initialized
function waitForMap(callback, maxAttempts = 20) {
    let attempts = 0;
    
    const checkInterval = setInterval(() => {
        attempts++;
        console.log(`Waiting for map to initialize... Attempt ${attempts}/${maxAttempts}`);
        
        if (typeof map !== 'undefined') {
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

// Function to add an earthquake zone
function addEarthquakeZone() {
    console.log('Adding earthquake zone...');
    
    // Create a new earthquake zone
    const earthquakeZone = {
        name: "Auto-Added Earthquake Zone",
        type: "earthquake",
        description: "This is an automatically added earthquake zone.",
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
        console.log('Earthquake zone added successfully');
        
        // Center the map on the earthquake zone
        map.setCenter(earthquakeZone.coordinates);
        map.setZoom(14);
        console.log('Map centered on earthquake zone');
    } else {
        console.error('addDangerZone function not found!');
    }
}

// Function to initialize the script
function init() {
    console.log('Initializing auto-add earthquake script...');
    
    // Wait for the map to be initialized
    waitForMap(() => {
        // Add a small delay to ensure everything is loaded
        setTimeout(addEarthquakeZone, 2000);
    });
}

// Start the script when the page loads
document.addEventListener('DOMContentLoaded', init); 