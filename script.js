// DOM Elements
const emergencyBtn = document.getElementById('emergencyBtn');
const trackBtn = document.getElementById('trackBtn');
const updatesContainer = document.getElementById('updatesContainer');
const startTrackingBtn = document.getElementById('startTracking');
const stopTrackingBtn = document.getElementById('stopTracking');
const saveLocationBtn = document.getElementById('saveLocation');
const locationTypeSelect = document.getElementById('locationType');
const authStatus = document.getElementById('authStatus');
const signOutBtn = document.getElementById('signOut');
const requestLocationPermissionBtn = document.getElementById('requestLocationPermission');

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed');
    
    // Add event listeners for tracking controls
    if (startTrackingBtn) {
        startTrackingBtn.addEventListener('click', () => {
            console.log('Start tracking button clicked');
            if (typeof startLocationTracking === 'function') {
                startLocationTracking();
            } else {
                console.error('startLocationTracking function not found');
                alert('Location tracking functionality not available. Please refresh the page.');
            }
        });
    }
    
    if (stopTrackingBtn) {
        stopTrackingBtn.addEventListener('click', () => {
            console.log('Stop tracking button clicked');
            if (typeof stopLocationTracking === 'function') {
                stopLocationTracking();
            } else {
                console.error('stopLocationTracking function not found');
                alert('Location tracking functionality not available. Please refresh the page.');
            }
        });
    }
    
    if (saveLocationBtn) {
        saveLocationBtn.addEventListener('click', saveCurrentLocation);
    }
    
    if (requestLocationPermissionBtn) {
        requestLocationPermissionBtn.addEventListener('click', () => {
            console.log('Request location permission button clicked');
            if (typeof requestLocationPermission === 'function') {
                requestLocationPermission();
            } else {
                console.error('requestLocationPermission function not found');
                alert('Location permission functionality not available. Please refresh the page.');
            }
        });
    }
    
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            try {
                // Sign out logic here
                console.log('User signed out');
            } catch (error) {
                console.error('Error signing out:', error);
            }
        });
    }
    
    // Listen for online/offline status
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
        console.error('Geolocation is not supported by your browser');
        addUpdate({
            type: 'error',
            message: 'Geolocation is not supported by your browser',
            timestamp: new Date()
        });
    }

    // Initialize Bennett University location
    initializeBennettUniversityLocation();
});

// Handle authentication state changes
function handleAuthStateChange(user, role) {
    if (user) {
        // User is signed in
        authStatus.innerHTML = `
            <span class="user-info">
                <i class="fas fa-user"></i>
                ${user.displayName}
                <span class="role-badge ${role}">${role}</span>
            </span>
            <button id="signOut" class="sign-out-btn">
                <i class="fas fa-sign-out-alt"></i> Sign Out
            </button>
        `;

        // Enable/disable features based on role
        updateFeatureAccess(role);
    } else {
        // User is signed out
        authStatus.innerHTML = `
            <a href="auth/auth.html" class="sign-in-btn">
                <i class="fas fa-sign-in-alt"></i> Sign In
            </a>
        `;

        // Disable all features
        disableAllFeatures();
    }
}

// Update feature access based on role
function updateFeatureAccess(role) {
    // Enable/disable features based on role
    const features = {
        user: ['emergencyBtn', 'trackBtn'],
        volunteer: ['emergencyBtn', 'trackBtn', 'startTracking', 'stopTracking'],
        firstResponder: ['emergencyBtn', 'trackBtn', 'startTracking', 'stopTracking', 'saveLocation']
    };

    // Disable all features first
    disableAllFeatures();

    // Enable features for the role
    features[role].forEach(featureId => {
        const element = document.getElementById(featureId);
        if (element) {
            element.disabled = false;
            element.classList.remove('disabled');
        }
    });
}

// Disable all features
function disableAllFeatures() {
    const features = ['emergencyBtn', 'trackBtn', 'startTracking', 'stopTracking', 'saveLocation'];
    features.forEach(featureId => {
        const element = document.getElementById(featureId);
        if (element) {
            element.disabled = true;
            element.classList.add('disabled');
        }
    });
}

// Handle online/offline status
async function handleOnlineStatus() {
    if (navigator.onLine) {
        addUpdate({
            type: 'info',
            message: 'Back online.',
            timestamp: new Date()
        });
    } else {
        addUpdate({
            type: 'warning',
            message: 'You are offline.',
            timestamp: new Date()
        });
    }
}

// Save current location
async function saveCurrentLocation() {
    try {
        const position = await getCurrentPosition();
        const locationType = locationTypeSelect.value;
        
        const location = {
            name: prompt('Enter location name:'),
            type: locationType,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            description: prompt('Enter location description:'),
            contact: prompt('Enter contact number (if applicable):'),
            capacity: locationType === 'shelters' ? prompt('Enter capacity:') : null
        };

        if (!location.name) {
            alert('Location name is required');
            return;
        }

        await offlineStorageService.saveLocation(locationType, location);
        
        // Add marker to map
        addLocationMarker(location);

        addUpdate({
            type: 'info',
            message: `${locationType} location saved successfully`,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error saving location:', error);
        alert('Error saving location. Please try again.');
    }
}

// Load offline locations
async function loadOfflineLocations() {
    try {
        const types = ['hospitals', 'shelters', 'emergencyServices'];
        
        for (const type of types) {
            const locations = await offlineStorageService.getLocations(type);
            locations.forEach(location => {
                addLocationMarker(location);
            });
        }
    } catch (error) {
        console.error('Error loading offline locations:', error);
    }
}

// Add location marker to map
function addLocationMarker(location) {
    const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: map,
        title: location.name,
        icon: getMarkerIcon(location.type)
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="location-info">
                <h3>${location.name}</h3>
                <p>${location.description}</p>
                ${location.contact ? `<p><i class="fas fa-phone"></i> ${location.contact}</p>` : ''}
                ${location.capacity ? `<p><i class="fas fa-users"></i> Capacity: ${location.capacity}</p>` : ''}
                <p><i class="fas fa-clock"></i> Last updated: ${new Date(location.lastUpdated).toLocaleString()}</p>
            </div>
        `
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

// Get marker icon based on location type
function getMarkerIcon(type) {
    const icons = {
        hospitals: {
            url: '/assets/icons/hospital.png',
            scaledSize: new google.maps.Size(32, 32)
        },
        shelters: {
            url: '/assets/icons/shelter.png',
            scaledSize: new google.maps.Size(32, 32)
        },
        emergencyServices: {
            url: '/assets/icons/emergency.png',
            scaledSize: new google.maps.Size(32, 32)
        }
    };

    return icons[type] || null;
}

// Emergency Alert Function
emergencyBtn.addEventListener('click', async () => {
    try {
        // Get user's location
        const position = await getCurrentPosition();
        
        // Show confirmation dialog
        if (confirm('Are you sure you want to send an emergency alert? This will notify emergency services.')) {
            // Send emergency alert
            sendEmergencyAlert(position);
        }
    } catch (error) {
        alert('Error: Unable to get your location. Please enable location services.');
    }
});

// Location Tracking Function
trackBtn.addEventListener('click', async () => {
    try {
        const position = await getCurrentPosition();
        showLocationOnMap(position);
    } catch (error) {
        alert('Error: Unable to get your location. Please enable location services.');
    }
});

// Get Current Position
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

// Send Emergency Alert
function sendEmergencyAlert(position) {
    // Simulate sending alert to emergency services
    const alert = {
        type: 'emergency',
        timestamp: new Date().toISOString(),
        location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
    };

    // Add to live updates
    addUpdate({
        type: 'emergency',
        message: 'Emergency alert sent! Emergency services have been notified.',
        timestamp: new Date()
    });

    // In a real application, this would send the alert to a backend server
    console.log('Emergency Alert Sent:', alert);
}

// Show Location on Map
function showLocationOnMap(position) {
    console.log('Showing location on map:', position.coords);
    
    const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    try {
        // Update marker position with animation
        if (typeof updateUserMarker === 'function') {
            // If map.js is loaded and updateUserMarker is available
            updateUserMarker(
                position.coords.latitude, 
                position.coords.longitude, 
                position.coords.accuracy,
                position.coords.heading || null
            );
            
            // Don't automatically center map on user
            // if (map) {
            //     map.setCenter(location);
            //     map.setZoom(15);
            // }
        } else {
            // Fallback if map.js is not loaded
            if (userMarker && map) {
                userMarker.setPosition(location);
                // Don't automatically center map on user
                // map.setCenter(location);
                // map.setZoom(15);
            } else {
                console.error('Map or user marker not initialized');
                addUpdate({
                    type: 'error',
                    message: 'Map not initialized. Please refresh the page.',
                    timestamp: new Date()
                });
            }
        }

        // Check if user is in any danger zone
        if (typeof checkDangerZones === 'function') {
            checkDangerZones(location);
        }
        
        // Add update to the UI
        addUpdate({
            type: 'info',
            message: 'Location updated on map',
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error updating location:', error);
        addUpdate({
            type: 'error',
            message: 'Error updating location on map',
            timestamp: new Date()
        });
    }
}

// Live Updates System
function addUpdate(update) {
    const updateElement = document.createElement('div');
    updateElement.className = 'update-item';
    updateElement.innerHTML = `
        <div class="update-icon">
            ${getUpdateIcon(update.type)}
        </div>
        <div class="update-content">
            <p>${update.message}</p>
            <small>${formatTimestamp(update.timestamp)}</small>
        </div>
    `;
    
    updatesContainer.insertBefore(updateElement, updatesContainer.firstChild);
}

// Get Update Icon
function getUpdateIcon(type) {
    switch (type) {
        case 'emergency':
            return '<i class="fas fa-exclamation-circle"></i>';
        case 'warning':
            return '<i class="fas fa-exclamation-triangle"></i>';
        case 'info':
            return '<i class="fas fa-info-circle"></i>';
        default:
            return '<i class="fas fa-bell"></i>';
    }
}

// Format Timestamp
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}

// Simulate Live Updates
function simulateLiveUpdates() {
    const updates = [
        {
            type: 'info',
            message: 'Weather alert: Heavy rain expected in your area',
            timestamp: new Date()
        },
        {
            type: 'warning',
            message: 'Traffic alert: Major road closure on Main Street',
            timestamp: new Date()
        }
    ];

    updates.forEach(update => {
        setTimeout(() => {
            addUpdate(update);
        }, Math.random() * 5000);
    });
}

// Initialize Bennett University location
async function initializeBennettUniversityLocation() {
    const bennettLocation = {
        name: 'Bennett University',
        type: 'university',
        latitude: 28.4733,  // Approximate coordinates for Bennett University
        longitude: 77.4858,
        description: 'Bennett University, Plot No 8-11, TechZone II, Greater Noida, Uttar Pradesh 201310',
        contact: '+91-120-7199300'
    };

    try {
        // Save to backend
        const response = await fetch('/api/locations/static', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bennettLocation)
        });

        if (!response.ok) {
            throw new Error('Failed to save Bennett University location');
        }

        // Add marker to map
        addLocationMarker(bennettLocation);

        addUpdate({
            type: 'info',
            message: 'Bennett University location added successfully',
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error initializing Bennett University location:', error);
        addUpdate({
            type: 'error',
            message: 'Failed to add Bennett University location',
            timestamp: new Date()
        });
    }
} 