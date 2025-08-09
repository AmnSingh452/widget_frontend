// Quick Browser Console Test Script
// Copy and paste this into your browser console on a Shopify store page

console.log('🧪 Starting Jarvis Widget Test...');

// 1. Check if widget loaded
const widgetLoaded = !!document.getElementById('shopify-chatbot-widget');
console.log('✅ Widget loaded:', widgetLoaded);

// 2. Check shop domain detection
const shopDomain = window.SHOP_DOMAIN || window.Shopify?.shop;
console.log('🏪 Shop domain detected:', shopDomain);

// 3. Test settings fetch
if (typeof fetchWidgetSettings === 'function') {
    fetchWidgetSettings().then(settings => {
        console.log('🎨 Widget settings:', settings);
        console.log('🔧 Widget enabled:', settings?.isEnabled !== false);
    }).catch(err => {
        console.log('❌ Settings fetch failed:', err.message);
    });
} else {
    console.log('❌ fetchWidgetSettings function not found');
}

// 4. Check widget elements
const elements = {
    toggleButton: !!document.getElementById('chat-toggle-button'),
    chatWindow: !!document.getElementById('chat-window'),
    chatInput: !!document.getElementById('chat-input'),
    sendButton: !!document.getElementById('chat-send-button')
};
console.log('🎯 Widget elements:', elements);

// 5. Test API configuration
if (typeof getApiUrls === 'function') {
    console.log('📡 API URLs:', getApiUrls());
} else {
    console.log('📡 API URLs (global):', window.API_URLS);
}

// 6. Test shop domain in multiple ways
const domainSources = {
    'window.SHOP_DOMAIN': window.SHOP_DOMAIN,
    'window.Shopify.shop': window.Shopify?.shop,
    'SHOPIFY_CHATBOT_CONFIG': window.SHOPIFY_CHATBOT_CONFIG?.shop_domain,
    'meta tag': document.querySelector('meta[name="shopify-shop-domain"]')?.content,
    'hostname': window.location.hostname
};
console.log('🔍 Domain detection sources:', domainSources);

console.log('🏁 Test complete! Check results above.');
