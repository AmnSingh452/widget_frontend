# 🤖 Jarvis Widget Deployment Testing Checklist

## Pre-Deployment Verification

### ✅ File Structure Check
- [ ] `shopify_chatbot_widget.js` exists and is properly formatted
- [ ] `shopify_chatbot_widget.css` exists and is accessible
- [ ] `shopify_chatbot_widget.html` exists (if used separately)
- [ ] All files are uploaded to hosting service (widget-frontend-6mo6.onrender.com)

### ✅ Configuration Validation
- [ ] `JARVIS_API_URL` points to correct backend (https://jarvis2-0-djg1.onrender.com)
- [ ] `DEFAULT_WIDGET_SETTINGS` contains all required properties
- [ ] API endpoints are correctly configured in `getApiUrls()` function
- [ ] Shop domain detection logic is present and functional

## Deployment Testing

### 🌐 **1. Basic Loading Test**
Open browser console and check for:
- [ ] No JavaScript errors on page load
- [ ] Widget initialization logs appear: "🚀 Initializing Jarvis Widget..."
- [ ] Shop domain detection: "🏪 Shop Domain: [domain]"
- [ ] API configuration logs: "🔧 Widget using API URLs: [urls]"
- [ ] Widget completion: "✅ Jarvis Widget initialization complete"

### 🎨 **2. Visual Appearance Test**
- [ ] Chat toggle button appears in correct position (bottom-right by default)
- [ ] Button has proper styling and hover effects
- [ ] Floating animation is working (smartbot-float)
- [ ] Welcome popup appears and disappears correctly
- [ ] Colors match the configured theme

### 🔧 **3. Functionality Test**
- [ ] Click toggle button opens chat window
- [ ] Chat window has proper dimensions and positioning
- [ ] Header displays correct text and robot avatar
- [ ] Input field accepts text
- [ ] Send button is clickable
- [ ] Close button works
- [ ] "New Chat" button clears session

### 📡 **4. API Integration Test**
- [ ] Widget settings fetch successfully (check console for "✅ Widget settings fetched successfully")
- [ ] Shop domain is detected and sent with API calls
- [ ] Chat messages send and receive responses
- [ ] Session ID is generated and stored
- [ ] Chat history loads correctly on widget reopen

### 🛒 **5. Shopify Integration Test**
- [ ] Shop domain detection works: `window.Shopify.shop` or `window.SHOP_DOMAIN`
- [ ] Cart detection functionality works (if cart has items)
- [ ] Product recommendations appear when relevant
- [ ] Discount codes generate correctly for abandoned carts
- [ ] Links to Shopify store work properly

### ⚙️ **6. Multi-Tenant Test**
- [ ] Different shop domains get different configurations
- [ ] Widget can be disabled per shop via backend settings
- [ ] Custom styling applies correctly per shop
- [ ] API calls include correct shop domain parameter

### 🔄 **7. Error Handling Test**
- [ ] Widget handles API failures gracefully
- [ ] Fallback settings load when backend is unavailable
- [ ] Network errors display user-friendly messages
- [ ] Invalid shop domains don't break the widget

## Testing Commands

### Browser Console Commands:
```javascript
// Check widget status
console.log('Widget loaded:', !!document.getElementById('shopify-chatbot-widget'));
console.log('Toggle button:', !!document.getElementById('chat-toggle-button'));
console.log('Shop domain:', window.SHOP_DOMAIN);

// Test settings fetch
fetchWidgetSettings().then(settings => console.log('Settings:', settings));

// Test API connectivity
fetch('https://jarvis2-0-djg1.onrender.com/api/widget-settings?shop=test.myshopify.com')
  .then(r => r.json())
  .then(data => console.log('API Test:', data));

// Check widget configuration
console.log('Widget settings:', widgetSettings);
console.log('API URLs:', API_URLS);
```

### Network Tab Checks:
- [ ] Widget CSS loads successfully (200 status)
- [ ] Widget JS loads successfully (200 status)
- [ ] Settings API call returns 200 or expected error
- [ ] Chat API calls work properly
- [ ] No CORS errors in network requests

## Production Environment Tests

### 🏪 **Real Shopify Store Test**
1. Install widget on actual Shopify store
2. Test from different pages (home, product, cart, checkout)
3. Test on mobile and desktop
4. Test with different browsers (Chrome, Firefox, Safari, Edge)
5. Test with different customer states (logged in/out)

### 📱 **Mobile Responsiveness**
- [ ] Widget appears correctly on mobile devices
- [ ] Touch interactions work properly
- [ ] Chat window fits mobile screen
- [ ] Text is readable and buttons are tappable

### 🚀 **Performance Test**
- [ ] Widget loads quickly (< 2 seconds)
- [ ] No memory leaks after extended use
- [ ] Smooth animations and transitions
- [ ] Minimal impact on page load speed

## Debugging Tools

### Console Debugging:
```javascript
// Enable verbose logging
localStorage.setItem('jarvis-debug', 'true');

// Check local storage
console.log('Session ID:', localStorage.getItem('shopifyChatbotSessionId'));
console.log('Customer Name:', localStorage.getItem('shopifyChatbotCustomerName'));

// Force widget reload
location.reload();
```

### Common Issues & Solutions:

| Issue | Solution |
|-------|----------|
| Widget not appearing | Check CSS loading, inspect DOM for widget elements |
| Shop domain not detected | Verify Shopify object exists, check meta tags |
| API calls failing | Check CORS settings, verify endpoints, check network tab |
| Styling not applied | Check CSS file loading, inspect dynamic styles |
| Chat not working | Check API configuration, verify session handling |

## Sign-off Checklist

### 🎯 **Ready for Production**
- [ ] All tests pass on staging environment
- [ ] No console errors or warnings
- [ ] Performance is acceptable
- [ ] Mobile experience is smooth
- [ ] API integration is stable
- [ ] Error handling works correctly
- [ ] Documentation is updated
- [ ] Monitoring/logging is in place

### 📋 **Final Verification**
- [ ] Test with real customer data
- [ ] Verify analytics/tracking works
- [ ] Confirm backup/rollback plan
- [ ] Stakeholder approval obtained
- [ ] Support team trained on troubleshooting

---

**Testing Date:** ___________  
**Tested By:** ___________  
**Environment:** ___________  
**Status:** ⭕ Pass / ❌ Fail  
**Notes:** ___________
