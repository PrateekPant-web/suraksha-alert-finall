// Configuration settings for the Disaster Management System

export const config = {
    // API Configuration
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.surakshaalert.com/v1',
    
    // Google Maps Configuration
    googleMapsApiKey: 'AIzaSyBEhS87h8QzPx9lllkKAAPmp9xAewOnLsg',
    
    // Weather API Configuration
    weatherApiKey: process.env.REACT_APP_WEATHER_API_KEY,
    weatherApiBaseUrl: 'https://api.weatherapi.com/v1',
    
    // Disaster Prediction API Configuration
    predictionApiKey: process.env.REACT_APP_PREDICTION_API_KEY,
    predictionApiBaseUrl: 'https://api.disasterprediction.com/v1',
    
    // Notification Configuration
    notificationApiKey: process.env.REACT_APP_NOTIFICATION_API_KEY,
    notificationApiBaseUrl: 'https://api.notifications.com/v1',
    
    // Feature Flags
    features: {
        enableOfflineMode: true,
        enablePushNotifications: true,
        enableLocationTracking: true,
        enableDisasterPrediction: true,
        enableAnalytics: true
    },
    
    // Cache Configuration
    cache: {
        maxAge: 3600, // 1 hour in seconds
        maxSize: 50 * 1024 * 1024 // 50MB
    },
    
    // Error Handling Configuration
    errorHandling: {
        maxRetries: 3,
        retryDelay: 1000, // 1 second
        timeout: 10000 // 10 seconds
    },
    
    // UI Configuration
    ui: {
        theme: 'light',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: 'HH:mm:ss'
    },
    
    // Security Configuration
    security: {
        tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
        refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutes
    }
};

// Environment-specific configurations
const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    config.apiBaseUrl = 'http://localhost:3000/api/v1';
    config.features.enableAnalytics = false;
    config.googleMapsApiKey = 'AIzaSyBEhS87h8QzPx9lllkKAAPmp9xAewOnLsg';
}

if (env === 'staging') {
    config.apiBaseUrl = 'https://staging-api.surakshaalert.com/v1';
    config.googleMapsApiKey = 'AIzaSyBEhS87h8QzPx9lllkKAAPmp9xAewOnLsg';
}

if (env === 'production') {
    config.features.enableOfflineMode = false;
    config.googleMapsApiKey = 'AIzaSyBEhS87h8QzPx9lllkKAAPmp9xAewOnLsg';
}

export default config; 