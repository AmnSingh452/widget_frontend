#!/usr/bin/env node

/**
 * Jarvis Widget API Health Check Script
 * Tests all API endpoints and widget functionality
 */

const https = require('https');
const http = require('http');

class WidgetHealthChecker {
    constructor() {
        this.baseUrls = {
            widget: 'https://widget-frontend-6mo6.onrender.com',
            api: 'https://jarvis2-0-djg1.onrender.com'
        };
        this.testShop = 'test-store.myshopify.com';
        this.results = [];
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            const requestOptions = {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Jarvis-Widget-Health-Check/1.0',
                    ...options.headers
                }
            };

            const req = protocol.request(url, requestOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = data ? JSON.parse(data) : {};
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: parsed,
                            raw: data
                        });
                    } catch (e) {
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            data: null,
                            raw: data
                        });
                    }
                });
            });

            req.on('error', reject);
            
            if (options.body) {
                req.write(JSON.stringify(options.body));
            }
            
            req.end();
        });
    }

    log(test, status, message, details = null) {
        const timestamp = new Date().toISOString();
        const result = { timestamp, test, status, message, details };
        this.results.push(result);
        
        const statusEmoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${statusEmoji} [${test}] ${message}`);
        if (details && process.env.VERBOSE) {
            console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
        }
    }

    async testWidgetFileAccess() {
        console.log('\n🔍 Testing Widget File Access...');
        
        const files = [
            '/shopify_chatbot_widget.js',
            '/shopify_chatbot_widget.css',
            '/shopify_chatbot_widget.html'
        ];

        for (const file of files) {
            try {
                const response = await this.makeRequest(`${this.baseUrls.widget}${file}`, {
                    method: 'GET'
                });

                if (response.status === 200) {
                    this.log('FILE_ACCESS', 'PASS', `${file} accessible`, {
                        size: response.raw.length,
                        contentType: response.headers['content-type']
                    });
                } else {
                    this.log('FILE_ACCESS', 'FAIL', `${file} not accessible`, {
                        status: response.status,
                        headers: response.headers
                    });
                }
            } catch (error) {
                this.log('FILE_ACCESS', 'FAIL', `${file} request failed`, {
                    error: error.message
                });
            }
        }
    }

    async testWidgetSettingsAPI() {
        console.log('\n🎨 Testing Widget Settings API...');
        
        try {
            const url = `${this.baseUrls.api}/api/widget-settings?shop=${encodeURIComponent(this.testShop)}`;
            const response = await this.makeRequest(url, {
                method: 'GET'
            });

            if (response.status === 200 && response.data) {
                this.log('SETTINGS_API', 'PASS', 'Widget settings API working', {
                    hasSettings: !!response.data.settings,
                    isEnabled: response.data.settings?.isEnabled
                });
            } else if (response.status === 404) {
                this.log('SETTINGS_API', 'WARN', 'No settings found for test shop (expected)', {
                    status: response.status
                });
            } else {
                this.log('SETTINGS_API', 'FAIL', 'Settings API returned error', {
                    status: response.status,
                    data: response.data
                });
            }
        } catch (error) {
            this.log('SETTINGS_API', 'FAIL', 'Settings API request failed', {
                error: error.message
            });
        }
    }

    async testChatAPI() {
        console.log('\n💬 Testing Chat API...');
        
        try {
            // Test chat endpoint
            const chatResponse = await this.makeRequest(`${this.baseUrls.api}/api/chat`, {
                method: 'POST',
                body: {
                    message: 'Hello, this is a health check test',
                    shop_domain: this.testShop,
                    session_id: null
                }
            });

            if (chatResponse.status === 200 && chatResponse.data?.response) {
                this.log('CHAT_API', 'PASS', 'Chat API working', {
                    hasResponse: !!chatResponse.data.response,
                    sessionId: chatResponse.data.session_id
                });
                
                // Test session retrieval if we got a session ID
                if (chatResponse.data.session_id) {
                    await this.testSessionAPI(chatResponse.data.session_id);
                }
            } else {
                this.log('CHAT_API', 'FAIL', 'Chat API returned unexpected response', {
                    status: chatResponse.status,
                    data: chatResponse.data
                });
            }
        } catch (error) {
            this.log('CHAT_API', 'FAIL', 'Chat API request failed', {
                error: error.message
            });
        }
    }

    async testSessionAPI(sessionId) {
        console.log('\n📝 Testing Session API...');
        
        try {
            const sessionResponse = await this.makeRequest(`${this.baseUrls.api}/api/session/${sessionId}`, {
                method: 'GET'
            });

            if (sessionResponse.status === 200 && sessionResponse.data?.history) {
                this.log('SESSION_API', 'PASS', 'Session API working', {
                    historyLength: sessionResponse.data.history.length
                });
            } else {
                this.log('SESSION_API', 'FAIL', 'Session API returned unexpected response', {
                    status: sessionResponse.status,
                    data: sessionResponse.data
                });
            }
        } catch (error) {
            this.log('SESSION_API', 'FAIL', 'Session API request failed', {
                error: error.message
            });
        }
    }

    async testRecommendationsAPI() {
        console.log('\n🛍️ Testing Recommendations API...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrls.api}/api/recommendations`, {
                method: 'POST',
                body: {
                    product_ids: [1, 2, 3],
                    shop_domain: this.testShop
                }
            });

            if (response.status === 200) {
                this.log('RECOMMENDATIONS_API', 'PASS', 'Recommendations API working', {
                    hasRecommendations: !!response.data?.recommendations
                });
            } else {
                this.log('RECOMMENDATIONS_API', 'WARN', 'Recommendations API returned non-200', {
                    status: response.status,
                    data: response.data
                });
            }
        } catch (error) {
            this.log('RECOMMENDATIONS_API', 'FAIL', 'Recommendations API request failed', {
                error: error.message
            });
        }
    }

    async testDiscountAPI() {
        console.log('\n🎁 Testing Discount API...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrls.api}/api/abandoned-cart-discount`, {
                method: 'POST',
                body: {
                    discount_percentage: 10,
                    session_id: 'test-session',
                    shop_domain: this.testShop
                }
            });

            if (response.status === 200) {
                this.log('DISCOUNT_API', 'PASS', 'Discount API working', {
                    hasDiscountCode: !!response.data?.discount_code
                });
            } else {
                this.log('DISCOUNT_API', 'WARN', 'Discount API returned non-200', {
                    status: response.status,
                    data: response.data
                });
            }
        } catch (error) {
            this.log('DISCOUNT_API', 'FAIL', 'Discount API request failed', {
                error: error.message
            });
        }
    }

    async testCORSHeaders() {
        console.log('\n🌐 Testing CORS Headers...');
        
        try {
            const response = await this.makeRequest(`${this.baseUrls.api}/api/widget-settings?shop=${this.testShop}`, {
                method: 'OPTIONS'
            });

            const corsHeaders = {
                'access-control-allow-origin': response.headers['access-control-allow-origin'],
                'access-control-allow-methods': response.headers['access-control-allow-methods'],
                'access-control-allow-headers': response.headers['access-control-allow-headers']
            };

            if (corsHeaders['access-control-allow-origin']) {
                this.log('CORS', 'PASS', 'CORS headers present', corsHeaders);
            } else {
                this.log('CORS', 'WARN', 'CORS headers missing or incomplete', corsHeaders);
            }
        } catch (error) {
            this.log('CORS', 'FAIL', 'CORS preflight request failed', {
                error: error.message
            });
        }
    }

    generateReport() {
        console.log('\n📊 HEALTH CHECK REPORT');
        console.log('=' * 50);
        
        const summary = this.results.reduce((acc, result) => {
            acc[result.status] = (acc[result.status] || 0) + 1;
            return acc;
        }, {});

        console.log(`\n📈 Summary:`);
        console.log(`   ✅ PASS: ${summary.PASS || 0}`);
        console.log(`   ⚠️  WARN: ${summary.WARN || 0}`);
        console.log(`   ❌ FAIL: ${summary.FAIL || 0}`);
        console.log(`   📊 Total: ${this.results.length}`);

        const failedTests = this.results.filter(r => r.status === 'FAIL');
        if (failedTests.length > 0) {
            console.log(`\n❌ Failed Tests:`);
            failedTests.forEach(test => {
                console.log(`   - ${test.test}: ${test.message}`);
            });
        }

        const overallStatus = failedTests.length === 0 ? 'HEALTHY' : 'ISSUES_DETECTED';
        console.log(`\n🏥 Overall Status: ${overallStatus}`);
        
        // Export results
        const reportData = {
            timestamp: new Date().toISOString(),
            overallStatus,
            summary,
            results: this.results
        };

        require('fs').writeFileSync(
            'health-check-report.json',
            JSON.stringify(reportData, null, 2)
        );
        
        console.log(`\n💾 Report saved to: health-check-report.json`);
        
        return overallStatus === 'HEALTHY';
    }

    async runAllTests() {
        console.log('🚀 Starting Jarvis Widget Health Check...');
        console.log(`🌐 Widget URL: ${this.baseUrls.widget}`);
        console.log(`🔧 API URL: ${this.baseUrls.api}`);
        console.log(`🏪 Test Shop: ${this.testShop}\n`);

        await this.testWidgetFileAccess();
        await this.testWidgetSettingsAPI();
        await this.testChatAPI();
        await this.testRecommendationsAPI();
        await this.testDiscountAPI();
        await this.testCORSHeaders();

        return this.generateReport();
    }
}

// Run health check if called directly
if (require.main === module) {
    const checker = new WidgetHealthChecker();
    checker.runAllTests().then(isHealthy => {
        process.exit(isHealthy ? 0 : 1);
    }).catch(error => {
        console.error('❌ Health check failed:', error);
        process.exit(1);
    });
}

module.exports = WidgetHealthChecker;
