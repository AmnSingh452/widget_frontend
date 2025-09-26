// test_chat.js
// Usage: node test_chat.js

import fetch from 'node-fetch';




const payload = {
  message: "Hello from test script!",
  shop_domain: "aman-chatbot-test.myshopify.com",
  session_id: null
};

const API_URL = "http://localhost:51942/api/chat"; // Change to your local backend URL if needed

async function testChatApi() {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

testChatApi();