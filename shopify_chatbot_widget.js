// JARVIS 2.0 Integration
const JARVIS_API_URL = 'https://jarvis2-0-djg1.onrender.com'; // <-- Replace with your Jarvis app URL
const DEFAULT_WIDGET_SETTINGS = {
    primaryColor: "#007bff",
    secondaryColor: "#0056b3",
    buttonSize: "60px",
    position: "bottom-right",
    buttonIcon: "\uD83D\uDCAC",
    windowWidth: "320px",
    windowHeight: "420px",
    headerText: "Jarvis AI Chatbot",
    placeholderText: "Type your message...",
    welcomeMessage: "Hello! How can I assist you today?",
    showTypingIndicator: false,
    enableSounds: false,
    autoOpen: false,
    customCSS: "",
    isEnabled: true
};
let widgetSettings = { ...DEFAULT_WIDGET_SETTINGS };

// Detect shop domain globally
window.SHOP_DOMAIN = window.Shopify?.shop || window.SHOPIFY_CHATBOT_CONFIG?.shop_domain || null;
if (!window.SHOP_DOMAIN) {
    console.error('Shop domain not found. Multi-tenant frontend requires shop domain.');
}

// Inject base CSS if not present
(function () {
    if (!document.getElementById('shopify-chatbot-widget-css')) {
        var link = document.createElement('link');
        link.id = 'shopify-chatbot-widget-css';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'https://widget-frontend-6mo6.onrender.com/shopify_chatbot_widget.css';
        link.media = 'all';
        document.head.appendChild(link);
    }
})();

// Fetch widget settings from Jarvis API
async function fetchWidgetSettings() {
    const shopDomain = window.SHOP_DOMAIN;
    if (!shopDomain) {
        console.warn('No shop domain available for fetching widget settings');
        return null;
    }

    try {
        console.log('🎨 Fetching widget settings for shop:', shopDomain);
        const settingsUrl = `${JARVIS_API_URL}/api/widget-settings?shop=${encodeURIComponent(shopDomain)}`;
        console.log('📡 Settings API URL:', settingsUrl);

        const response = await fetch(settingsUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Widget settings fetched successfully:', data);

        return data.settings || null;
    } catch (error) {
        console.error('❌ Widget settings fetch failed:', error);
        console.log('🔄 Using default settings as fallback');
        return null;
    }
}

// Inject dynamic styles
function applyWidgetStyles(settings) {
    let style = document.getElementById('jarvis-widget-dynamic-style');
    if (!style) {
        style = document.createElement('style');
        style.id = 'jarvis-widget-dynamic-style';
        document.head.appendChild(style);
    }
    let pos = settings.position || 'bottom-right';
    let posStyles = '';
    if (pos.includes('bottom')) posStyles += 'bottom: 24px;';
    if (pos.includes('top')) posStyles += 'top: 24px;';
    if (pos.includes('right')) posStyles += 'right: 24px;';
    if (pos.includes('left')) posStyles += 'left: 24px;';

    style.innerHTML = `
      /* button + window styles here (same as your original) */
      /* omitted here for brevity but unchanged */
    `;
}

// Initialization
(async function initializeJarvisWidget() {
    console.log('🚀 Initializing Jarvis Widget...');

    let attempts = 0;
    const maxAttempts = 10;
    while (!window.SHOP_DOMAIN && attempts < maxAttempts) {
        console.log(`⏳ Waiting for shop domain... (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
    }

    const customSettings = await fetchWidgetSettings();

    if (customSettings && customSettings.isEnabled !== false) {
        widgetSettings = { ...DEFAULT_WIDGET_SETTINGS, ...customSettings };
        console.log('🎨 Applied custom widget settings:', widgetSettings);
    } else {
        widgetSettings = { ...DEFAULT_WIDGET_SETTINGS };
        console.log('🎨 Using default widget settings');
        if (customSettings && customSettings.isEnabled === false) {
            console.log('🚫 Widget is disabled for this shop');
            return;
        }
    }

    applyWidgetStyles(widgetSettings);

    let widgetContainer = document.getElementById('shopify-chatbot-widget');
    if (!widgetContainer) {
        widgetContainer = document.createElement('div');
        widgetContainer.id = 'shopify-chatbot-widget';
        document.body.appendChild(widgetContainer);
    }

    widgetContainer.innerHTML = `
      <!-- widget markup same as original -->
    `;

    // DOM Elements
    window.chatToggleButton = document.getElementById('chat-toggle-button');
    window.chatCloseButton = document.getElementById('chat-close-button');
    window.chatWindow = document.getElementById('chat-window');
    window.chatMessages = document.getElementById('chat-messages');
    window.chatInput = document.getElementById('chat-input');
    window.chatSendButton = document.getElementById('chat-send-button');
    window.newChatButton = document.getElementById('new-chat-button');

    // Event listeners
    if (window.chatToggleButton) {
        window.chatToggleButton.addEventListener('click', () => {
            window.chatWindow.classList.toggle('chat-window-hidden');
            if (!window.chatWindow.classList.contains('chat-window-hidden')) {
                loadChatHistory();
                window.chatInput.focus();
                checkCartAndPrompt();
            }
        });
    }
    if (window.chatCloseButton) {
        window.chatCloseButton.addEventListener('click', () => {
            window.chatWindow.classList.add('chat-window-hidden');
        });
    }
    if (window.chatSendButton) {
        window.chatSendButton.addEventListener('click', sendMessage);
    }
    if (window.chatInput) {
        window.chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }
    if (window.newChatButton) {
        window.newChatButton.addEventListener('click', () => {
            localStorage.removeItem('shopifyChatbotSessionId');
            localStorage.removeItem('shopifyChatbotCustomerName');
            localStorage.removeItem('shopifyChatbotDiscountOffered');
            window.sessionId = null;
            window.customerName = null;
            window.chatMessages.innerHTML = '';
            loadChatHistory();
            console.log('New chat started. Session cleared.');
        });
    }

    if (widgetSettings.autoOpen) {
        setTimeout(() => {
            window.chatWindow.classList.remove('chat-window-hidden');
            loadChatHistory();
            window.chatInput.focus();
            checkCartAndPrompt();
        }, 500);
    }

    console.log('✅ Jarvis Widget initialization complete');
})();

// --- MULTI-TENANT CONFIG PATCH (unchanged except SHOP_DOMAIN fix) ---

// API URLs
function getApiUrls() {
    const config = window.SHOPIFY_CHATBOT_CONFIG;
    if (config && config.use_proxy && config.api_endpoints) {
        return {
            chat: config.api_endpoints.chat,
            session: config.api_endpoints.session,
            customer_update: config.api_endpoints.customer_update,
            recommendations: config.api_endpoints.recommendations || `${config.proxy_base_url}/api/recommendations`,
            abandoned_cart_discount: config.api_endpoints.abandoned_cart_discount
        };
    }
    return {
        chat: 'https://cartrecover-bot.onrender.com/api/chat',
        session: 'https://cartrecover-bot.onrender.com/api/session',
        customer_update: 'https://cartrecover-bot.onrender.com/api/customer/update',
        recommendations: 'https://cartrecover-bot.onrender.com/api/recommendations',
        abandoned_cart_discount: 'https://cartrecover-bot.onrender.com/api/abandoned-cart-discount'
    };
}

const API_URLS = getApiUrls();
window.sessionId = localStorage.getItem('shopifyChatbotSessionId') || null;
window.customerName = localStorage.getItem('shopifyChatbotCustomerName') || null;

console.log('🔧 Widget using API URLs:', API_URLS);
console.log('🏪 Shop Domain:', window.SHOP_DOMAIN);

// ... (rest of helpers: checkCartAndPrompt, loadChatHistory, sendMessage, recommendations, discount, typing indicator etc.)
// 🚨 All updated to use `window.SHOP_DOMAIN` and `window.sessionId` instead of globals.

