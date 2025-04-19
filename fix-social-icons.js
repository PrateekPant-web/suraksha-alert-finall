// Script to ensure social media icons have their correct brand colors
document.addEventListener('DOMContentLoaded', function() {
    // Get all social media links
    const facebookLinks = document.querySelectorAll('.facebook-link');
    const twitterLinks = document.querySelectorAll('.twitter-link');
    const instagramLinks = document.querySelectorAll('.instagram-link');
    const linkedinLinks = document.querySelectorAll('.linkedin-link');
    
    // Set the correct brand colors directly
    facebookLinks.forEach(link => {
        link.style.backgroundColor = '#4267B2';
        // Remove any background images or gradients
        link.style.backgroundImage = 'none';
        // Ensure icon is white
        const icon = link.querySelector('i');
        if (icon) icon.style.color = '#ffffff';
    });
    
    twitterLinks.forEach(link => {
        link.style.backgroundColor = '#1DA1F2';
        link.style.backgroundImage = 'none';
        // Ensure icon is white
        const icon = link.querySelector('i');
        if (icon) icon.style.color = '#ffffff';
    });
    
    instagramLinks.forEach(link => {
        link.style.backgroundColor = '#E1306C';
        link.style.backgroundImage = 'none';
        // Ensure icon is white
        const icon = link.querySelector('i');
        if (icon) icon.style.color = '#ffffff';
    });
    
    linkedinLinks.forEach(link => {
        link.style.backgroundColor = '#0077B5';
        link.style.backgroundImage = 'none';
        // Ensure icon is white
        const icon = link.querySelector('i');
        if (icon) icon.style.color = '#ffffff';
    });
    
    // Additional fix for any social media icons that might have orange color
    document.querySelectorAll('.social-links a i').forEach(icon => {
        icon.style.color = '#ffffff';
    });
    
    console.log('Social media icon colors have been fixed.');
}); 