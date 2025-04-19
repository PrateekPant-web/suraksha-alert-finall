// Add at the very top (after the existing variables)
const socket = io(); // Connect to Socket.IO
let isRegistered = false; // Track if user is registered with socket
let locationTrackingInterval = null; // Track the interval for location updates
let userMarker = null; // Track the user's marker
let accuracyCircle = null; // Track the accuracy circle
let otherUsers = new Map(); // Track other users' markers
let highlightedZone = null; // Track the currently highlighted danger zone

// Function to handle alert data from real-time alerts page
function handleAlertFromRealTimeAlerts() {
    // Check if we're redirected from real-time alerts page
    const urlParams = new URLSearchParams(window.location.search);
    const showAlert = urlParams.get('showAlert');
    
    if (showAlert === 'true') {
        // Get alert data from localStorage
        const alertDataStr = localStorage.getItem('selectedAlert');
        
        if (alertDataStr) {
            try {
                const alertData = JSON.parse(alertDataStr);
                
                // Center map on alert location
                if (alertData.coordinates && alertData.coordinates.lat && alertData.coordinates.lng) {
                    map.setCenter(alertData.coordinates);
                    map.setZoom(14);
                    
                    // Find matching danger zone
                    const matchingZone = findMatchingDangerZone(alertData);
                    
                    if (matchingZone) {
                        // Highlight the danger zone
                        highlightDangerZone(matchingZone);
                        
                        // Show info window
                        showDangerZoneInfo(matchingZone, alertData);
                    } else {
                        // If no matching zone, create a temporary one
                        createTemporaryDangerZone(alertData);
                    }
                    
                    // Show notification
                    addUpdate({
                        type: 'emergency',
                        message: `Alert: ${alertData.title} in ${alertData.location}`,
                        timestamp: new Date()
                    });
                }
            } catch (error) {
                console.error('Error parsing alert data:', error);
            }
        }
    }
}

// Find a matching danger zone based on alert data
function findMatchingDangerZone(alertData) {
    // Try to find a zone with matching coordinates and type
    return dangerZones.find(zone => {
        const distance = calculateDistance(
            alertData.coordinates.lat,
            alertData.coordinates.lng,
            zone.coordinates.lat,
            zone.coordinates.lng
        );
        
        // If within 5km and same type, consider it a match
        const isWithinRange = distance <= 5000;
        const isSameType = alertData.title.toLowerCase().includes(zone.type.toLowerCase());
        
        return isWithinRange && isSameType;
    });
}

// Highlight a danger zone
function highlightDangerZone(zone) {
    // Reset any previously highlighted zone
    if (highlightedZone) {
        resetHighlightedZone();
    }
    
    // Store reference to highlighted zone
    highlightedZone = zone;
    
    // Change the appearance of the circle
    if (zone.circle) {
        zone.circle.setOptions({
            strokeWeight: 4,
            fillOpacity: 0.8
        });
    }
    
    // Change the appearance of the marker
    if (zone.marker) {
        zone.marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

// Reset highlighted zone
function resetHighlightedZone() {
    if (highlightedZone) {
        // Reset circle appearance
        if (highlightedZone.circle) {
            highlightedZone.circle.setOptions({
                strokeWeight: 2,
                fillOpacity: getDefaultFillOpacity(highlightedZone.severity)
            });
        }
        
        // Reset marker animation
        if (highlightedZone.marker) {
            highlightedZone.marker.setAnimation(null);
        }
        
        highlightedZone = null;
    }
}

// Get default fill opacity based on severity
function getDefaultFillOpacity(severity) {
    switch(severity) {
        case 'low':
            return 0.2;
        case 'medium':
            return 0.35;
        case 'high':
            return 0.5;
        case 'critical':
            return 0.7;
        default:
            return 0.35;
    }
}

// Show danger zone info window
function showDangerZoneInfo(zone, alertData) {
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="danger-zone-info">
                <h3>${alertData.title || zone.name}</h3>
                <p><strong>Type:</strong> ${zone.type}</p>
                <p><strong>Severity:</strong> ${zone.severity}</p>
                <p>${alertData.content || zone.description}</p>
                <p><strong>Location:</strong> ${alertData.location}</p>
            </div>
        `
    });
    
    infoWindow.setPosition(zone.coordinates);
    infoWindow.open(map);
}

// Create a temporary danger zone for an alert
function createTemporaryDangerZone(alertData) {
    // Determine zone type based on alert title
    let zoneType = 'other';
    if (alertData.title.toLowerCase().includes('flood')) {
        zoneType = 'flood';
    } else if (alertData.title.toLowerCase().includes('fire')) {
        zoneType = 'fire';
    } else if (alertData.title.toLowerCase().includes('earthquake')) {
        zoneType = 'earthquake';
    } else if (alertData.title.toLowerCase().includes('landslide')) {
        zoneType = 'landslide';
    }
    
    // Determine severity based on alert type
    let severity = 'medium';
    if (alertData.type === 'critical') {
        severity = 'critical';
    } else if (alertData.type === 'high') {
        severity = 'high';
    } else if (alertData.type === 'low') {
        severity = 'low';
    }
    
    // Create a new danger zone
    const tempZone = {
        name: alertData.title,
        type: zoneType,
        description: alertData.content,
        coordinates: alertData.coordinates,
        radius: 1000, // 1km radius
        severity: severity,
        isTemporary: true
    };
    
    // Add the zone to the map
    addDangerZone(tempZone);
    
    // Highlight the zone
    highlightDangerZone(tempZone);
    
    // Show info window
    showDangerZoneInfo(tempZone, alertData);
}

// Modify the shareCurrentLocation function to use Socket.IO
async function shareCurrentLocation() {
    try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Register user with socket if not already registered
        if (!isRegistered) {
            socket.emit('registerUser', 'current-user'); // Replace with actual user ID
            isRegistered = true;
        }
        
        // Send location update via socket
        socket.emit('locationUpdate', { 
            lat: latitude, 
            lng: longitude,
            timestamp: new Date().toISOString()
        });
        
        // Show success message
        addUpdate({
            type: 'info',
            message: 'Location shared successfully',
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error sharing location:', error);
        addUpdate({
            type: 'error',
            message: 'Failed to share location',
            timestamp: new Date()
        });
    }
}

// Add these new socket event listeners (place after initMap function)
socket.on('userLocationUpdate', (data) => {
    const { userId, location } = data;
    
    if (otherUsers.has(userId)) {
        otherUsers.get(userId).setPosition(location);
    } else {
        const marker = new google.maps.Marker({
            position: location,
            map: map,
            title: `User ${userId}`,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: '#FF5722',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
            }
        });
        otherUsers.set(userId, marker);
    }
});

socket.on('userDisconnected', (userId) => {
    if (otherUsers.has(userId)) {
        otherUsers.get(userId).setMap(null);
        otherUsers.delete(userId);
    }
});

// Enhance the updateOtherUsers function
async function updateOtherUsers() {
    try {
        const position = await getCurrentPosition();
        const response = await fetch(`/api/users/nearby?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&radius=5000`);
        
        if (response.ok) {
            const users = await response.json();
            
            // Remove markers for users no longer in range
            for (const [userId, marker] of otherUsers) {
                if (!users.find(u => u.userId === userId)) {
                    marker.setMap(null);
                    otherUsers.delete(userId);
                }
            }
            
            // Update or add markers for users in range
            users.forEach(user => {
                if (user.userId === 'current-user') return;
                
                const position = {
                    lat: user.location.coordinates[1],
                    lng: user.location.coordinates[0]
                };
                
                if (otherUsers.has(user.userId)) {
                    otherUsers.get(user.userId).setPosition(position);
                } else {
                    const marker = new google.maps.Marker({
                        position: position,
                        map: map,
                        title: user.name || `User ${user.userId}`,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 6,
                            fillColor: '#FF5722',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 2
                        }
                    });
                    otherUsers.set(user.userId, marker);
                }
            });
        }
    } catch (error) {
        console.error('Error updating other users:', error);
    }
}

// Add this helper function (place near other utility functions)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

// Add a marker at the specified coordinates
function addCustomLocationMarker() {
    const customLocation = {
        lat: 28.450695,
        lng: 77.584183
    };
    
    const marker = new google.maps.Marker({
        position: customLocation,
        map: map,
        title: 'Custom Location',
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4', // Changed from orange to Google Maps blue
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
        }
    });
    
    // Add info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="location-info">
                <h3>Custom Location</h3>
                <p>Coordinates: ${customLocation.lat}, ${customLocation.lng}</p>
                <p>Added on: ${new Date().toLocaleString()}</p>
            </div>
        `
    });
    
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
    
    // Add update notification
    addUpdate({
        type: 'info',
        message: 'Custom location marker added to the map',
        timestamp: new Date()
    });
    
    return marker;
}

// Add a more visible marker at the specified coordinates
function addBennettUniversityMarker() {
    const bennettLocation = { lat: 28.450695, lng: 77.584183 };
    
    // Create a standard Google Maps blue marker
    const marker = new google.maps.Marker({
        position: bennettLocation,
        map: map,
        title: 'Bennett University',
        icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new google.maps.Size(40, 40),  // Larger size
            anchor: new google.maps.Point(20, 40)     // Proper positioning
        },
        zIndex: 1000  // Ensure it appears above other markers
    });
    
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="min-width: 200px; padding: 10px;">
                <h3 style="margin:0;color:#1a73e8;">Bennett University</h3>
                <p><strong>Address:</strong> Plot No 8-11, TechZone II, Greater Noida</p>
                <p><strong>Coordinates:</strong> 28.450695, 77.584183</p>
            </div>
        `
    });
    
    // Show info window when marker is clicked
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
    
    // Open info window automatically when marker is added
    infoWindow.open(map, marker);
    
    // Add notification to updates log
    addUpdate({
        type: 'info',
        message: 'Bennett University marker added to map',
        timestamp: new Date()
    });
    
    return marker;
}

// Function to center map on Bennett University
function centerOnBennettUniversity() {
    const bennettLocation = { lat: 28.450695, lng: 77.584183 };
    map.setCenter(bennettLocation);
    map.setZoom(15);
    
    addUpdate({
        type: 'info',
        message: 'Map centered on Bennett University',
        timestamp: new Date()
    });
}

// Initialize the map
function initMap() {
    const bennettLocation = { lat: 28.450695, lng: 77.584183 }; // Bennett University coordinates
    
    // Create the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: bennettLocation,
        zoom: 15,
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        }
    });

    // Add user marker at Bennett University (will be updated when user location is available)
    userMarker = new google.maps.Marker({
        position: bennettLocation,
        map: map,
        title: 'Your Location',
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
        }
    });

    // Add accuracy circle
    accuracyCircle = new google.maps.Circle({
        map: map,
        center: userMarker.getPosition(),
        radius: 100,
        fillColor: '#4285F4',
        fillOpacity: 0.15,
        strokeColor: '#4285F4',
        strokeOpacity: 0.3,
        strokeWeight: 1
    });

    // Add share location button
    const shareLocationButton = document.createElement('button');
    shareLocationButton.textContent = 'Share My Location';
    shareLocationButton.className = 'map-control-btn';
    shareLocationButton.addEventListener('click', shareCurrentLocation);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(shareLocationButton);

    // Add start/stop tracking button
    const trackingButton = document.createElement('button');
    trackingButton.textContent = 'Start Tracking';
    trackingButton.className = 'map-control-btn';
    trackingButton.id = 'tracking-button';
    trackingButton.addEventListener('click', () => {
        if (typeof startLocationTracking === 'function') {
            startLocationTracking();
        } else {
            console.error('startLocationTracking function not found');
        }
    });
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(trackingButton);

    // Add Bennett University button
    const bennettButton = document.createElement('button');
    bennettButton.textContent = 'Go to Bennett University';
    bennettButton.className = 'bennett-btn';
    bennettButton.addEventListener('click', centerOnBennettUniversity);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(bennettButton);

    // Initialize danger zones
    initDangerZones();

    // Add Bennett University marker
    const bennettMarker = addBennettUniversityMarker();

    // Handle alert from real-time alerts page
    handleAlertFromRealTimeAlerts();

    // Add update notification
    addUpdate({
        type: 'info',
        message: 'Map initialized successfully',
        timestamp: new Date()
    });
}

// Get current position
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            position => {
                console.log('Current position obtained:', position.coords);
                resolve(position);
            },
            error => {
                console.error('Error getting current position:', error);
                let errorMessage = 'Error getting location. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please enable location access.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'An unknown error occurred.';
                }
                reject(new Error(errorMessage));
            },
            options
        );
    });
}

// Restore the original updateUserMarker function
function updateUserMarker(latitude, longitude, accuracy = 0, heading = null) {
    if (!map || !userMarker) {
        console.error('Map or user marker not initialized');
        return;
    }

    const position = { lat: latitude, lng: longitude };
    
    // Update marker position with animation
    userMarker.setPosition(position);
    
    // Center map on user
    map.setCenter(position);
    
    // Update accuracy circle if it exists, or create a new one
    if (accuracyCircle) {
        accuracyCircle.setCenter(position);
        accuracyCircle.setRadius(accuracy);
    } else if (accuracy > 0) {
        accuracyCircle = new google.maps.Circle({
            strokeColor: '#4285F4',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: '#4285F4',
            fillOpacity: 0.15,
            map: map,
            center: position,
            radius: accuracy
        });
    }
    
    // Update heading if available
    if (heading !== null) {
        userMarker.setIcon({
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            rotation: heading,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
        });
    } else {
        userMarker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
        });
    }
    
    // Add update notification
    addUpdate({
        type: 'info',
        message: `Location updated: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        timestamp: new Date()
    });
}

// Restore the original startLocationTracking function
async function startLocationTracking() {
    try {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported by your browser');
        }

        // Get initial position
        const position = await getCurrentPosition();
        updateUserMarker(
            position.coords.latitude, 
            position.coords.longitude, 
            position.coords.accuracy,
            position.coords.heading || null
        );

        // Set up interval to update location
        locationTrackingInterval = setInterval(async () => {
            try {
                const position = await getCurrentPosition();
                updateUserMarker(
                    position.coords.latitude, 
                    position.coords.longitude, 
                    position.coords.accuracy,
                    position.coords.heading || null
                );

                // Check if user is in any danger zone
                if (typeof checkDangerZones === 'function') {
                    checkDangerZones({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                }
            } catch (error) {
                console.error('Error updating location:', error);
            }
        }, 5000); // Update every 5 seconds
        
        // Add update notification
        addUpdate({
            type: 'info',
            message: 'Location tracking started',
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error starting location tracking:', error);
        addUpdate({
            type: 'error',
            message: 'Failed to start location tracking: ' + error.message,
            timestamp: new Date()
        });
    }
}

// Restore the original stopLocationTracking function
async function stopLocationTracking() {
    if (locationTrackingInterval) {
        clearInterval(locationTrackingInterval);
        locationTrackingInterval = null;
        
        // Add update notification
        addUpdate({
            type: 'info',
            message: 'Location tracking stopped',
            timestamp: new Date()
        });
    }
}