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
    if (!SHOP_DOMAIN) return null;
    try {
        const response = await fetch(`${JARVIS_API_URL}/api/widget-settings?shop=${SHOP_DOMAIN}`);
        const data = await response.json();
        return data.settings || null;
    } catch (error) {
        console.error('Widget settings fetch failed:', error);
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
        background: ${settings.primaryColor};
        color: #fff;
        width: ${settings.buttonSize};
        height: ${settings.buttonSize};
        border-radius: 50%;
        border: none;
        font-size: 2em;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        position: fixed;
        z-index: 9999;
        cursor: pointer;
        ${posStyles}
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    }
    #chat-toggle-button:hover {
        background: ${settings.secondaryColor};
    }
    #chat-window {
        width: ${settings.windowWidth};
        height: ${settings.windowHeight};
        position: fixed;
        ${posStyles}
        z-index: 10000;
        background: #fff;
        border-radius: 16px 16px 8px 8px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    .chat-header {
        background: ${settings.primaryColor};
        color: #fff;
        font-weight: bold;
        padding: 12px 16px;
        font-size: 1.1em;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .chat-close-button {
        background: transparent;
        color: #fff;
        border: none;
        font-size: 1.5em;
        cursor: pointer;
    }
    .chat-messages {
        flex: 1;
        padding: 12px;
        overflow-y: auto;
        background: #f8f9fa;
    }
    .chat-input-area {
        display: flex;
        padding: 8px;
        background: #f1f1f1;
    }
    .chat-input {
        flex: 1;
        border: 1px solid #ccc;
        border-radius: 6px;
        padding: 8px;
        font-size: 1em;
    }
    .send-button {
        background: ${settings.primaryColor};
        color: #fff;
        border: none;
        border-radius: 6px;
        margin-left: 8px;
        padding: 0 16px;
        font-size: 1.2em;
        cursor: pointer;
        transition: background 0.2s;
    }
    .send-button:hover {
        background: ${settings.secondaryColor};
    }
    .message.bot-message {
        background: #e9f3ff;
        color: #222;
        border-radius: 8px 8px 8px 0;
        margin-bottom: 8px;
        padding: 8px 12px;
        max-width: 85%;
        align-self: flex-start;
    }
    .message.user-message {
        background: ${settings.primaryColor}22;
        color: #222;
        border-radius: 8px 8px 0 8px;
        margin-bottom: 8px;
        padding: 8px 12px;
        max-width: 85%;
        align-self: flex-end;
    }
    .new-chat-button {
        background: #f1f1f1;
        color: #333;
        border: none;
        border-radius: 0 0 8px 8px;
        width: 100%;
        padding: 10px 0;
        font-size: 1em;
        cursor: pointer;
        border-top: 1px solid #eee;
    }
    ${settings.customCSS || ''}
    `;
}

// Initialization: fetch settings, then render widget
(async function initializeJarvisWidget() {
    const settings = await fetchWidgetSettings();
    if (settings && settings.isEnabled !== false) {
        widgetSettings = { ...DEFAULT_WIDGET_SETTINGS, ...settings };
    } else {
        widgetSettings = { ...DEFAULT_WIDGET_SETTINGS };
        if (settings && settings.isEnabled === false) {
            // Widget is disabled, do not render
            return;
        }
    }
    applyWidgetStyles(widgetSettings);

    // Render widget container if not present
    let widgetContainer = document.getElementById('shopify-chatbot-widget');
    if (!widgetContainer) {
        widgetContainer = document.createElement('div');
        widgetContainer.id = 'shopify-chatbot-widget';
        document.body.appendChild(widgetContainer);
    }
    widgetContainer.innerHTML = `
        <button id="chat-toggle-button" class="chat-button">${widgetSettings.buttonIcon}</button>
        <div id="chat-window" class="chat-window chat-window-hidden">
            <div class="chat-header">
                <span>${widgetSettings.headerText}</span>
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

    // Auto open if enabled
    if (widgetSettings.autoOpen) {
        setTimeout(() => {
            window.chatWindow.classList.remove('chat-window-hidden');
            loadChatHistory();
            window.chatInput.focus();
            checkCartAndPrompt();
        }, 500);
    }
})();

// Configuration
const API_BASE_URL = 'https://cartrecover-bot.onrender.com/api/chat';
const HISTORY_API_URL = 'https://cartrecover-bot.onrender.com/api/session';
const CUSTOMER_UPDATE_URL = 'https://cartrecover-bot.onrender.com/api/customer/update';
const RECOMMENDATIONS_API_URL = 'https://cartrecover-bot.onrender.com/api/recommendations'; // <-- Replace with your actual backend URL
const DISCOUNT_API_URL = 'https://cartrecover-bot.onrender.com/api/abandoned-cart-discount';
let sessionId = localStorage.getItem('shopifyChatbotSessionId') || null;
let customerName = localStorage.getItem('shopifyChatbotCustomerName') || null;

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
        const response = await fetch(CUSTOMER_UPDATE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, session_id: sessionId, shop: SHOP_DOMAIN }),
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
            const response = await fetch(`${HISTORY_API_URL}/${sessionId}`);
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

// Toggle chat window visibility
chatToggleButton.addEventListener('click', () => {
    chatWindow.classList.toggle('chat-window-hidden');
    if (!chatWindow.classList.contains('chat-window-hidden')) {
        loadChatHistory();
        chatInput.focus();
        checkCartAndPrompt();
    }
});

// New chat button event listener
if (newChatButton) {
    newChatButton.addEventListener('click', () => {
        // Clear session and customer info from local storage
        localStorage.removeItem('shopifyChatbotSessionId');
        localStorage.removeItem('shopifyChatbotCustomerName');
        localStorage.removeItem('shopifyChatbotDiscountOffered');
        
        // Reset in-memory variables
        sessionId = null;
        customerName = null;
        
        // Clear the chat messages and load the initial prompt
        chatMessages.innerHTML = '';
        loadChatHistory();
        
        console.log('New chat started. Session cleared.');
    });
}

chatCloseButton.addEventListener('click', () => {
    chatWindow.classList.add('chat-window-hidden');
});

// Send message function
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || !SHOP_DOMAIN) {
        if (!SHOP_DOMAIN) {
            renderMessages([
                { role: 'bot', content: "Error: Shop domain not found. Please reload the page or contact support." }
            ]);
        }
        return;
    }

    // Handle the case where the user is providing their name
    const isNameSubmission = !customerName && chatMessages.textContent.includes("What's your name?");
    if (isNameSubmission) {
        const extractedName = extractNameFromInput(message);
        if (extractedName) {
            customerName = extractedName;
            localStorage.setItem('shopifyChatbotCustomerName', customerName);
            await updateCustomerInfo(customerName);
            addInitialBotMessage(`Nice to meet you, ${customerName}! How can I help you?`);
        } else {
            addInitialBotMessage("Sorry, I didn't catch your name. Could you please tell me your first name?");
        }
        chatInput.value = '';
        return;
    }

    // Add user message to UI
    const currentMessages = Array.from(chatMessages.children).map(div => ({
        role: div.classList.contains('user-message') ? 'user' : 'bot',
        content: div.textContent
    }));
    renderMessages([...currentMessages, { role: 'user', content: message }]);
    chatInput.value = '';
    scrollToBottom();

    try {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, session_id: sessionId, shop: SHOP_DOMAIN }),
        });
        const data = await response.json();
        console.log('Raw API response:', data);

        // Use data.data for the actual response
        const payload = data.data || {};
        if (payload.response && payload.session_id) {
            console.log('Entering SUCCESS block');
            sessionId = payload.session_id;
            localStorage.setItem('shopifyChatbotSessionId', sessionId);
            console.log('Session ID confirmed from backend:', sessionId);

            // Update customer info if it's in the response
            if (payload.customer_info && payload.customer_info.name) {
                customerName = payload.customer_info.name;
                localStorage.setItem('shopifyChatbotCustomerName', customerName);
                console.log('Customer name updated from backend:', customerName);
            }

            // Render the messages
            renderMessages(payload.history);

            // Hesitation-triggered discount logic
            if (!localStorage.getItem('shopifyChatbotDiscountOffered')) {
                const lowerMsg = message.toLowerCase();
                if (HESITATION_PHRASES.some(phrase => lowerMsg.includes(phrase))) {
                    offerAbandonedCartDiscount();
                    localStorage.setItem('shopifyChatbotDiscountOffered', 'true');
                }
            }
        } else {
            console.log('Entering ERROR block');
            const errorMessage = data.message || 'Unknown error occurred';
            renderMessages([
                ...(chatMessages.children ? Array.from(chatMessages.children).map(div => ({
                    role: div.classList.contains('user-message') ? 'user' : 'bot',
                    content: div.textContent
                })) : []),
                { role: 'bot', content: `Error from chatbot: ${errorMessage}` }
            ]);
            console.error('API Error:', data);
        }
    } catch (error) {
        renderMessages([
            ...(chatMessages.children ? Array.from(chatMessages.children).map(div => ({
                role: div.classList.contains('user-message') ? 'user' : 'bot',
                content: div.textContent
            })) : []),
            { role: 'bot', content: "Error contacting chatbot." }
        ]);
        console.error('Fetch error:', error);
    }
}

// Event listeners for sending messages
if (chatSendButton) {
    chatSendButton.addEventListener('click', sendMessage);
}
if (chatInput) {
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
}

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
        const response = await fetch(RECOMMENDATIONS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_ids: productIds, customer_id: customerId, shop: SHOP_DOMAIN })
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
    const response = await fetch(DISCOUNT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount_percentage: 10, session_id: sessionId, shop: SHOP_DOMAIN })
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