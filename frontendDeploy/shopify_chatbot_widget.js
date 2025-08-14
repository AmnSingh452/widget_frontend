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
const SHOP_DOMAIN = window.Shopify?.shop || null;
if (!SHOP_DOMAIN) {
    console.error('Shop domain not found. Multi-tenant frontend requires shop domain.');
}

// Inject base CSS if not present
(function() {
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
    // Get shop domain from multiple sources
    const shopDomain = window.SHOP_DOMAIN || 
                      window.SHOPIFY_CHATBOT_CONFIG?.shop_domain || 
                      window.Shopify?.shop;
    
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

// Inject dynamic styles based on settings
function applyWidgetStyles(settings) {
    let style = document.getElementById('jarvis-widget-dynamic-style');
    if (!style) {
        style = document.createElement('style');
        style.id = 'jarvis-widget-dynamic-style';
        document.head.appendChild(style);
    }
    // Positioning
    let pos = settings.position || 'bottom-right';
    let posStyles = '';
    if (pos.includes('bottom')) posStyles += 'bottom: 24px;';
    if (pos.includes('top')) posStyles += 'top: 24px;';
    if (pos.includes('right')) posStyles += 'right: 24px;';
    if (pos.includes('left')) posStyles += 'left: 24px;';

    style.innerHTML = `
    #chat-toggle-button {
        background: linear-gradient(135deg, ${settings.primaryColor} 60%, ${settings.secondaryColor} 100%);
        color: #fff;
        width: ${settings.buttonSize};
        height: ${settings.buttonSize};
        border-radius: 50%;
        border: none;
        font-size: 2em;
        box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        position: fixed;
        z-index: 9999;
        cursor: pointer;
        ${posStyles}
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s, box-shadow 0.2s;
        animation: smartbot-float 2.5s infinite ease-in-out;
    }
    @keyframes smartbot-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
    }
    #chat-toggle-button:hover {
        background: linear-gradient(135deg, ${settings.secondaryColor} 60%, ${settings.primaryColor} 100%);
        box-shadow: 0 8px 32px rgba(0,0,0,0.22);
    }
    #chat-window {
        width: ${settings.windowWidth};
        height: ${settings.windowHeight};
        position: fixed;
        ${posStyles}
        z-index: 10000;
        background: rgba(255,255,255,0.85);
        border-radius: 24px 24px 12px 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.22);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        backdrop-filter: blur(8px);
        border: 1px solid #e0e0e0;
        transition: box-shadow 0.2s;
    }
    .chat-header {
        background: linear-gradient(90deg, ${settings.primaryColor} 80%, ${settings.secondaryColor} 100%);
        color: #fff;
        font-weight: bold;
        padding: 16px 20px;
        font-size: 1.2em;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #e0e0e0;
    }
    .chat-close-button {
        background: transparent;
        color: #fff;
        border: none;
        font-size: 1.5em;
        cursor: pointer;
        transition: color 0.2s;
    }
    .chat-close-button:hover {
        color: #ffd700;
    }
    .chat-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        background: rgba(248,249,250,0.7);
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .chat-input-area {
        display: flex;
        padding: 12px;
        background: rgba(241,241,241,0.8);
        border-top: 1px solid #e0e0e0;
    }
    .chat-input {
        flex: 1;
        border: 1px solid #ccc;
        border-radius: 12px;
        padding: 10px;
        font-size: 1em;
        background: #fff;
        transition: border 0.2s;
    }
    .chat-input:focus {
        border: 1.5px solid ${settings.primaryColor};
        outline: none;
    }
    .send-button {
        background: linear-gradient(135deg, ${settings.primaryColor} 60%, ${settings.secondaryColor} 100%);
        color: #fff;
        border: none;
        border-radius: 12px;
        margin-left: 10px;
        padding: 0 20px;
        font-size: 1.3em;
        cursor: pointer;
        transition: background 0.2s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.10);
    }
    .send-button:hover {
        background: linear-gradient(135deg, ${settings.secondaryColor} 60%, ${settings.primaryColor} 100%);
    }
    .message.bot-message {
        background: rgba(233,243,255,0.85);
        color: #222;
        border-radius: 16px 16px 16px 4px;
        margin-bottom: 4px;
        padding: 10px 16px;
        max-width: 80%;
        align-self: flex-start;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        position: relative;
        animation: smartbot-bubble-in 0.3s;
    }
    .message.user-message {
        background: ${settings.primaryColor}22;
        color: #222;
        border-radius: 16px 16px 4px 16px;
        margin-bottom: 4px;
        padding: 10px 16px;
        max-width: 80%;
        align-self: flex-end;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        position: relative;
        animation: smartbot-bubble-in 0.3s;
    }
    @keyframes smartbot-bubble-in {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    .new-chat-button {
        background: #f1f1f1;
        color: #333;
        border: none;
        border-radius: 0 0 16px 16px;
        width: 100%;
        padding: 12px 0;
        font-size: 1em;
        cursor: pointer;
        border-top: 1px solid #eee;
        transition: background 0.2s;
    }
    .new-chat-button:hover {
        background: #e0e0e0;
    }
    .smartbot-typing {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 8px 0 0 8px;
    }
    .smartbot-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${settings.primaryColor};
        opacity: 0.7;
        animation: smartbot-dot-bounce 1.2s infinite;
    }
    .smartbot-dot:nth-child(2) { animation-delay: 0.2s; }
    .smartbot-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes smartbot-dot-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
    }
    ${settings.customCSS || ''}
    `;
}

// Initialization: fetch settings, then render widget
(async function initializeJarvisWidget() {
    console.log('🚀 Initializing Jarvis Widget...');
    
    // Wait for shop domain to be available
    let attempts = 0;
    const maxAttempts = 10;
    while ((!window.SHOP_DOMAIN && !window.SHOPIFY_CHATBOT_CONFIG?.shop_domain) && attempts < maxAttempts) {
        console.log(`⏳ Waiting for shop domain... (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
    }
    
    // Fetch custom settings from backend
    const customSettings = await fetchWidgetSettings();
    
    if (customSettings && customSettings.isEnabled !== false) {
        widgetSettings = { ...DEFAULT_WIDGET_SETTINGS, ...customSettings };
        console.log('🎨 Applied custom widget settings:', widgetSettings);
    } else {
        widgetSettings = { ...DEFAULT_WIDGET_SETTINGS };
        console.log('🎨 Using default widget settings');
        
        // If settings exist but widget is disabled, don't render
        if (customSettings && customSettings.isEnabled === false) {
            console.log('🚫 Widget is disabled for this shop');
            return;
        }
    }
    
    // Apply the styles first
    applyWidgetStyles(widgetSettings);

    // Render widget container if not present
    let widgetContainer = document.getElementById('shopify-chatbot-widget');
    if (!widgetContainer) {
        widgetContainer = document.createElement('div');
        widgetContainer.id = 'shopify-chatbot-widget';
        document.body.appendChild(widgetContainer);
    }
    
    // Render the widget HTML with dynamic settings
    widgetContainer.innerHTML = `
        <button id="chat-toggle-button" class="chat-button">${widgetSettings.buttonIcon}</button>
        <div id="chat-window" class="chat-window chat-window-hidden">
            <div class="chat-header">
                <span style="display:flex;align-items:center;gap:10px;">
                    <span id="smartbot-avatar">${getRobotAvatarSVG()}</span>
                    <span>${widgetSettings.headerText}</span>
                </span>
                <button id="chat-close-button" class="chat-close-button">&times;</button>
            </div>
            <div id="chat-messages" class="chat-messages"></div>
            <div class="chat-input-area">
                <input id="chat-input" class="chat-input" type="text" placeholder="${widgetSettings.placeholderText}" autocomplete="off" />
                <button id="chat-send-button" class="send-button">&#9658;</button>
            </div>
            <button id="new-chat-button" class="new-chat-button">New Chat</button>
        </div>
    `;

    // DOM Elements (re-query after rendering)
    window.chatToggleButton = document.getElementById('chat-toggle-button');
    window.chatCloseButton = document.getElementById('chat-close-button');
    window.chatWindow = document.getElementById('chat-window');
    window.chatMessages = document.getElementById('chat-messages');
    window.chatInput = document.getElementById('chat-input');
    window.chatSendButton = document.getElementById('chat-send-button');
    window.newChatButton = document.getElementById('new-chat-button');

    // Event listeners (re-bind)
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
            sessionId = null;
            customerName = null;
            window.chatMessages.innerHTML = '';
            loadChatHistory();
            console.log('New chat started. Session cleared.');
        });
    }

    // Auto open if enabled in settings
    if (widgetSettings.autoOpen) {
        console.log('🎯 Auto-opening chat widget');
        setTimeout(() => {
            window.chatWindow.classList.remove('chat-window-hidden');
            loadChatHistory();
            window.chatInput.focus();
            checkCartAndPrompt();
        }, 500);
    }
    
    console.log('✅ Jarvis Widget initialization complete');
})();

// Add floating welcome popup
(function addWelcomePopup() {
    if (!document.getElementById('smartbot-welcome-popup')) {
        const popup = document.createElement('div');
        popup.id = 'smartbot-welcome-popup';
        popup.style.position = 'fixed';
        popup.style.zIndex = '10001';
        popup.style.maxWidth = '260px';
        popup.style.bottom = '100px';
        popup.style.right = '36px';
        popup.style.background = 'rgba(255,255,255,0.95)';
        popup.style.borderRadius = '18px';
        popup.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
        popup.style.padding = '18px 22px';
        popup.style.fontSize = '1.08em';
        popup.style.color = '#222';
        popup.style.display = 'flex';
        popup.style.alignItems = 'center';
        popup.style.gap = '14px';
        popup.style.cursor = 'pointer';
        popup.style.transition = 'opacity 0.3s';
        popup.innerHTML = `
            <span style="font-size:2em;">🤖</span>
            <span>How can I help you?</span>
        `;
        popup.onclick = function() {
            document.getElementById('chat-toggle-button').click();
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 300);
        };
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.style.opacity = '1';
        }, 400);
        // Auto-hide after 8 seconds if not clicked
        setTimeout(() => {
            if (document.body.contains(popup)) {
                popup.style.opacity = '0';
                setTimeout(() => popup.remove(), 300);
            }
        }, 8000);
    }
})();

// --- BEGIN JARVIS 2.0 MULTI-TENANT INIT PATCH ---
/*
 * Dynamic shop domain detection and config initialization
 */
(function() {
    // Detect shop domain from multiple sources
    const detectShopDomain = () => {
        if (window.SHOPIFY_CHATBOT_CONFIG?.shop_domain) return window.SHOPIFY_CHATBOT_CONFIG.shop_domain;
        if (window.SHOP_DOMAIN) return window.SHOP_DOMAIN;
        if (window.Shopify?.shop) return window.Shopify.shop;
        if (window.shop?.permanent_domain) return window.shop.permanent_domain;
        const hostname = window.location.hostname;
        if (hostname.includes('.myshopify.com')) return hostname;
        const metaShopDomain = document.querySelector('meta[name="shopify-shop-domain"]');
        if (metaShopDomain) return metaShopDomain.content;
        return null;
    };
    window.SHOP_DOMAIN = detectShopDomain();
    // Dynamic config fetch
    window.initializeJarvisConfig = async function() {
        if (!window.SHOP_DOMAIN) return false;
        try {
            const configEndpoint = window.SHOPIFY_CHATBOT_CONFIG?.config_endpoint || `https://jarvis2-0-djg1.onrender.com/api/widget-config?shop=${window.SHOP_DOMAIN}`;
            const response = await fetch(configEndpoint);
            const configData = await response.json();
            if (configData.success && configData.config) {
                window.API_BASE_URL = configData.config.api_endpoints.chat;
                window.HISTORY_API_URL = configData.config.api_endpoints.session;
                window.CUSTOMER_UPDATE_URL = configData.config.api_endpoints.customer_update;
                window.RECOMMENDATIONS_API_URL = configData.config.api_endpoints.recommendations;
                window.DISCOUNT_API_URL = configData.config.api_endpoints.abandoned_cart_discount;
                return true;
            }
        } catch (error) {
            // Fallbacks
            const fallbackEndpoints = window.SHOPIFY_CHATBOT_CONFIG?.api_endpoints || {
                chat: "https://cartrecover-bot.onrender.com/api/chat",
                recommendations: "https://cartrecover-bot.onrender.com/api/recommendations",
                abandoned_cart_discount: "https://cartrecover-bot.onrender.com/api/abandoned-cart-discount",
                session: "https://cartrecover-bot.onrender.com/api/session",
                customer_update: "https://cartrecover-bot.onrender.com/api/customer/update"
            };
            window.API_BASE_URL = fallbackEndpoints.chat;
            window.HISTORY_API_URL = fallbackEndpoints.session;
            window.CUSTOMER_UPDATE_URL = fallbackEndpoints.customer_update;
            window.RECOMMENDATIONS_API_URL = fallbackEndpoints.recommendations;
            window.DISCOUNT_API_URL = fallbackEndpoints.abandoned_cart_discount;
            return true;
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            await window.initializeJarvisConfig();
        });
    } else {
        window.initializeJarvisConfig();
    }
})();
// --- END PATCH ---

// Configuration - Dynamic API URLs
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
let sessionId = localStorage.getItem('shopifyChatbotSessionId') || null;
let customerName = localStorage.getItem('shopifyChatbotCustomerName') || null;
let analyticsSessionId = null; // For tracking conversation sessions

console.log('🔧 Widget using API URLs:', API_URLS);
console.log('🏪 Shop Domain:', window.SHOP_DOMAIN);
console.log('📡 CORS Proxy Mode:', window.SHOPIFY_CHATBOT_CONFIG?.use_proxy ? 'ENABLED' : 'DISABLED');

// Analytics tracking helper
async function trackAnalyticsEvent(eventType, data = {}) {
    if (!window.SHOP_DOMAIN && !SHOP_DOMAIN) {
        console.warn('⚠️ Analytics: Shop domain not available for tracking');
        return;
    }

    const shopDomain = window.SHOP_DOMAIN || SHOP_DOMAIN;
    
    // Debug: Log session state
    if (!analyticsSessionId) {
        console.warn('⚠️ Analytics: No session ID available, creating one...');
        analyticsSessionId = generateAnalyticsSessionId();
        console.log('📊 Generated new analytics session:', analyticsSessionId);
    }
    
    try {
        const payload = {
            type: eventType,
            shopDomain: shopDomain,
            sessionId: analyticsSessionId,
            timestamp: new Date().toISOString(),
            ...data
        };

        console.log('📊 Analytics Event:', eventType, payload);

        // Try to send to analytics endpoint
        const analyticsUrl = `${JARVIS_API_URL}/api/analytics`;
        const response = await fetch(analyticsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });



        if (!response.ok) {
            // If analytics endpoint fails, log locally for now
            console.warn(`⚠️ Analytics tracking failed (${response.status}):`, response.statusText);
            console.log('📊 Analytics Event stored locally:', payload);
            
            // Store in localStorage as fallback
            const localAnalytics = JSON.parse(localStorage.getItem('jarvis_analytics_events') || '[]');
            localAnalytics.push(payload);
            // Keep only last 50 events
            if (localAnalytics.length > 50) {
                localAnalytics.splice(0, localAnalytics.length - 50);
            }
            localStorage.setItem('jarvis_analytics_events', JSON.stringify(localAnalytics));
        } else {
            console.log('✅ Analytics event sent successfully');
        }
    } catch (error) {
        console.warn('⚠️ Analytics tracking error:', {
            message: error.message,
            stack: error.stack,
            eventType: eventType,
            shopDomain: shopDomain
        });
        
        // Fallback: store locally
        try {
            const payload = {
                type: eventType,
                shopDomain: shopDomain,
                sessionId: analyticsSessionId,
                timestamp: new Date().toISOString(),
                ...data
            };
            const localAnalytics = JSON.parse(localStorage.getItem('jarvis_analytics_events') || '[]');
            localAnalytics.push(payload);
            localStorage.setItem('jarvis_analytics_events', JSON.stringify(localAnalytics));
            console.log('📊 Analytics event stored locally (fallback):', payload);
        } catch (localError) {
            console.error('❌ Analytics local storage failed:', localError);
        }
    }
}

// Generate unique session ID for analytics
function generateAnalyticsSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Get locally stored analytics events (for debugging/fallback)
function getLocalAnalyticsEvents() {
    try {
        return JSON.parse(localStorage.getItem('jarvis_analytics_events') || '[]');
    } catch (error) {
        console.error('Error reading local analytics events:', error);
        return [];
    }
}

// Clear locally stored analytics events
function clearLocalAnalyticsEvents() {
    localStorage.removeItem('jarvis_analytics_events');
    console.log('🧹 Local analytics events cleared');
}

// Hesitation phrases for discount trigger
const HESITATION_PHRASES = [
  "not sure",
  "maybe later",
  "too expensive",
  "let me think",
  "i'll come back",
  "not now",
  "have to check",
  "need to think",
  "don't know",
  "can't decide"
];

console.log('Script loaded. Initial sessionId:', sessionId);
console.log('Initial customerName:', customerName);

// Helper to check if user is logged into Shopify
async function checkShopifyCustomer() {
    try {
        // Placeholder for Shopify customer check
        // Implement your logic here if needed
        return null;
    } catch (error) {
        console.error('Error checking Shopify customer:', error);
        return null;
    }
}

// Helper to update customer info
async function updateCustomerInfo(name) {
    if (!sessionId || !SHOP_DOMAIN) {
        console.error('Cannot update customer info: missing sessionId or shop domain.');
        return;
    }
    try {
        const response = await fetch(API_URLS.customer_update, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: sessionId,
                name: name,
                shop_domain: window.SHOP_DOMAIN || SHOP_DOMAIN
            }),
        });
        const data = await response.json();
        if (data.success) {
            customerName = name;
            localStorage.setItem('shopifyChatbotCustomerName', customerName);
        }
    } catch (error) {
        console.error('Error updating customer info:', error);
    }
}

// Check cart and prompt for recovery   
function checkCartAndPrompt() {
    if (!SHOP_DOMAIN) {
        showBotMessage("Error: Shop domain not found. Cannot check cart or fetch recommendations.");
        return;
    }
    fetch('/cart.js')
      .then(res => res.json())
      .then(cart => {
        if (cart.items && cart.items.length > 0) {
          // Show a recovery message in the chat
          showBotMessage("You have items in your cart! Need help checking out or have questions?");
          // Optionally, list the items
          cart.items.forEach(item => {
            showBotMessage(`- ${item.quantity} x ${item.product_title}`);
          });
          // Example upsell
          showBotMessage("Customers who bought these items also loved our accessories! Would you like a recommendation?");
          // Fetch and show recommendations
          const productIds = cart.items.map(item => item.product_id);
          fetchAndShowRecommendations(productIds);

          // --- Discount logic ---
          if (!localStorage.getItem('shopifyChatbotDiscountOffered')) {
            setTimeout(() => {
              offerAbandonedCartDiscount();
              localStorage.setItem('shopifyChatbotDiscountOffered', 'true');
            }, 10000); // 10 seconds delay before offering discount
          }
        }
      });
}

// Helper to render all messages in the chat UI
function renderMessages(messages) {
    chatMessages.innerHTML = ''; // Clear existing messages
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        if (msg.role === 'user') {
            messageDiv.classList.add('user-message');
            messageDiv.textContent = msg.content;
        } else {
            messageDiv.classList.add('bot-message');
            messageDiv.innerHTML = msg.content; // Use innerHTML for bot messages
        }
        chatMessages.appendChild(messageDiv);
    });
    scrollToBottom();
}

// Helper to scroll messages to the bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Load history when chat window opens
async function loadChatHistory() {
    console.log('loadChatHistory called. Current sessionId:', sessionId);
    if (sessionId) {
        try {
            const response = await fetch(`${API_URLS.session}/${sessionId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            // Check if the history array exists and is not empty
            if (data && data.history && data.history.length > 0) {
                renderMessages(data.history);
            } else {
                // If no history, check for customer name and prompt if needed
                if (!customerName) {
                    addInitialBotMessage("Hi! I'd like to personalize our chat. What's your name?");
                } else {
                    addInitialBotMessage(`Hello ${customerName}! How can I assist you today?`);
                }
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
            addInitialBotMessage("Hello! How can I assist you today?");
        }
    } else {
        // No session ID, so this is a new visitor
        if (!customerName) {
            addInitialBotMessage("Hi! I'd like to personalize our chat. What's your name?");
        } else {
            addInitialBotMessage(`Hello ${customerName}! How can I assist you today?`);
        }
    }
}

function addInitialBotMessage(message) {
    renderMessages([{
role: 'bot',
        content: message
    }]);
}
// ...existing code...

// Send message function
async function sendMessage() {
    const message = document.getElementById('chat-input')?.value?.trim();
    const chatMessages = document.getElementById('chat-messages');
    if (!message) return;
    if (!window.SHOP_DOMAIN) {
        console.error('❌ Shop domain not available');
        if (chatMessages) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message bot-message';
            errorDiv.innerHTML = '❌ Error: Shop domain not found. Please reload the page.';
            chatMessages.appendChild(errorDiv);
        }
        return;
    }

    // Clear input immediately
    document.getElementById('chat-input').value = '';
    // Add user message to UI
    if (chatMessages) {
        const userDiv = document.createElement('div');
        userDiv.className = 'message user-message';
        userDiv.textContent = message;
        chatMessages.appendChild(userDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    // Show typing indicator
    if (window.showTypingIndicator) {
        window.showTypingIndicator();
    }
    
    const messageStartTime = Date.now();
    
    try {
        // Only send session_id if it was previously returned by backend
        let payload = {
            message: message,
            shop_domain: window.SHOP_DOMAIN || SHOP_DOMAIN
        };
        // Only include session_id if it was set from a previous backend response
        if (window.sessionId) {
            payload.session_id = window.sessionId;
        }
        console.log('🚀 Sending message with shop domain:', window.SHOP_DOMAIN);
        console.log('📡 API endpoint:', API_URLS.chat);
        console.log('📝 Request payload:', payload);
        console.log('📝 Request payload:', payload);
        const response = await fetch(API_URLS.chat, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        const responseTime = Date.now() - messageStartTime;
        console.log('📡 API response:', data);
        
        // Track message sent with response time
        trackAnalyticsEvent('message_sent', {
            message: message,
            responseTime: responseTime,
            customerName: customerName || 'Anonymous',
            sessionId: sessionId,
            botResponse: data.data?.response || data.response
        });
        // Hide typing indicator
        if (window.hideTypingIndicator) {
            window.hideTypingIndicator();
        }
        // Handle response
        const payload_data = data.data || data;
        if (payload_data.response) {
            // Update session ID if provided
            if (payload_data.session_id) {
                window.sessionId = payload_data.session_id;
                localStorage.setItem('shopifyChatbotSessionId', payload_data.session_id);
            }
            // Add bot response to UI
            if (chatMessages) {
                const botDiv = document.createElement('div');
                botDiv.className = 'message bot-message';
                botDiv.innerHTML = payload_data.response;
                chatMessages.appendChild(botDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        } else {
            throw new Error('No response content received');
        }
    } catch (error) {
        console.error('❌ Send message error:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            apiUrl: API_URLS.chat,
            shopDomain: window.SHOP_DOMAIN || SHOP_DOMAIN
        });
        // Hide typing indicator
        if (window.hideTypingIndicator) {
            window.hideTypingIndicator();
        }
        // Show error message
        if (chatMessages) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message bot-message';
            errorDiv.innerHTML = `❌ Connection error: ${error.message}. Please check your internet connection and try again.`;
            chatMessages.appendChild(errorDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
}

// Event listeners for sending messages

// Optionally, load history or show initial message when the script loads
// window.addEventListener('load', () => {
//     // If the widget is meant to be closed initially, load history only on toggle button click
//     // If you want it open by default and history loaded on page load, uncomment this.
// });

function showBotMessage(message) {
  const chatMessages = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot-message';
  messageDiv.innerHTML = message; // Use innerHTML to render HTML
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function fetchAndShowRecommendations(productIds = [], customerId = null) {
    if (!SHOP_DOMAIN) {
        showBotMessage("Error: Shop domain not found. Cannot fetch recommendations.");
        return;
    }
    try {
        const response = await fetch(API_URLS.recommendations, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_ids: productIds,
                customer_id: customerId,
                shop_domain: window.SHOP_DOMAIN || SHOP_DOMAIN
            })
        });
        const data = await response.json();
        console.log('Recommendations API response:', data); // Debug log
        if (data.recommendations && data.recommendations.length > 0) {
            showBotMessage("You may also like:");
            data.recommendations.forEach(product => {
                showProductRecommendation(product);
            });
        } else {
            showBotMessage("Sorry, I couldn't find any recommendations right now.");
        }
    } catch (error) {
        showBotMessage("Sorry, there was an error fetching recommendations.");
        console.error(error);
    }
}

function showProductRecommendation(product) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';

    // Build product card with image, title, price, and link
    messageDiv.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
            <a href="/products/${product.handle}" target="_blank" style="display:inline-block;">
                <img src="${product.images && product.images[0] ? product.images[0].src : (product.image ? product.image.src : '')}" alt="${product.title}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;">
            </a>
            <div>
                <a href="/products/${product.handle}" target="_blank" style="font-weight:bold;color:#007bff;text-decoration:none;">${product.title}</a>
                <div style="color:#333;font-size:14px;">
                    ${product.variants && product.variants[0] ? '$' + product.variants[0].price : ''}
                </div>
            </div>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function extractNameFromInput(input) {
    input = input.trim();
    // Try to match "my name is X", "I am X", "I'm X"
    let match = input.match(/(?:my name is|i am|i'm)\s+([a-zA-Z]+)/i);
    if (match) {
        return match[1];
    }
    // If input is a single word, assume it's a name
    if (/^[a-zA-Z]+$/.test(input)) {
        return input;
    }
    // Otherwise, return null (no name detected)
    return null;
}

const SHOPIFY_STORE_DOMAIN = '4ja0wp-y1.myshopify.com';
async function offerAbandonedCartDiscount() {
    if (!sessionId || !SHOP_DOMAIN) {
        showBotMessage("Error: Shop domain or session not found. Cannot offer discount.");
        return;
    }
    const response = await fetch(API_URLS.abandoned_cart_discount, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            discount_percentage: 10,
            session_id: sessionId,
            shop_domain: window.SHOP_DOMAIN || SHOP_DOMAIN
        })
    });
    const data = await response.json();
    if (data.discount_code) {
        showBotMessage(
          `🎉 <b>Special Offer!</b><br>
          Use code <span style="background:#f4f4f4;padding:4px 8px;border-radius:4px;font-weight:bold;font-size:1.1em;">${data.discount_code}</span> at checkout.<br>
          <a href="https://${SHOPIFY_STORE_DOMAIN}/cart" target="_blank" style="color:#007bff;text-decoration:underline;">Click here to complete your purchase</a>!<br>
          <span style="color:#d9534f;font-size:0.95em;">⏰ Hurry! This code is valid for the next 1 hour or until you complete your purchase.</span>`
        );
        // Optionally, add tracking here
    } else {
        showBotMessage("Sorry, there was an issue generating your discount code.");
    }
}

// Typing indicator functions
function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    let typingDiv = document.getElementById('smartbot-typing-indicator');
    if (!typingDiv) {
        typingDiv = document.createElement('div');
        typingDiv.id = 'smartbot-typing-indicator';
        typingDiv.className = 'smartbot-typing';
        typingDiv.innerHTML = '<span class="smartbot-dot"></span><span class="smartbot-dot"></span><span class="smartbot-dot"></span>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}
function hideTypingIndicator() {
    const typingDiv = document.getElementById('smartbot-typing-indicator');
    if (typingDiv) typingDiv.remove();
}

// Add 3D robot avatar to chat header
// You can use a simple SVG for now, or replace with a 3D model viewer (e.g. <model-viewer> for glTF/GLB)
function getRobotAvatarSVG() {
    return `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="18" cy="20" rx="14" ry="12" fill="#e9f3ff" stroke="#007bff" stroke-width="2"/>
        <ellipse cx="18" cy="16" rx="10" ry="8" fill="#fff" stroke="#0056b3" stroke-width="2"/>
        <circle cx="14" cy="16" r="2" fill="#007bff"/>
        <circle cx="22" cy="16" r="2" fill="#007bff"/>
        <rect x="15" y="22" width="6" height="2" rx="1" fill="#0056b3"/>
        <rect x="16" y="10" width="4" height="2" rx="1" fill="#ffd700"/>
    </svg>`;
}

// Optional Analytics Functions
// Track conversions when a sale is detected
function trackConversion(orderValue = 0) {
    trackAnalyticsEvent('conversion_completed', {
        customerName: customerName || 'Anonymous',
        orderValue: orderValue,
        conversionSource: 'chatbot_assistance'
    });
}

// Track customer satisfaction rating
function trackSatisfactionRating(rating) {
    trackAnalyticsEvent('satisfaction_rated', {
        customerName: customerName || 'Anonymous',
        rating: rating, // 1-5 scale
        sessionId: sessionId
    });
}