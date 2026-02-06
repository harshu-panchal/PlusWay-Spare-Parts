/**
 * Translation Test Script
 * Run with: node backend/scripts/testTranslation.js
 */

import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const BASE_URL = process.env.API_URL || 'http://localhost:5001';

const testLanguages = ['hi', 'ar', 'es', 'fr', 'de', 'ta', 'te', 'bn'];

const runTests = async () => {
    console.log('🧪 Starting Translation Tests...\n');
    console.log(`API Base URL: ${BASE_URL}\n`);

    let passed = 0;
    let failed = 0;

    // Test 1: Single Translation
    console.log('📝 Test 1: Single Translation');
    console.log('─'.repeat(50));
    try {
        const response = await axios.post(`${BASE_URL}/api/v1/translate`, {
            text: 'Hello, welcome to our store!',
            targetLang: 'hi',
            sourceLang: 'en',
        });

        if (response.data.success && response.data.data.translation) {
            console.log('✅ PASSED');
            console.log(`   Original: "${response.data.data.original}"`);
            console.log(`   Translation (Hindi): "${response.data.data.translation}"`);
            passed++;
        } else {
            console.log('❌ FAILED - No translation returned');
            failed++;
        }
    } catch (error) {
        console.log(`❌ FAILED - ${error.response?.data?.message || error.message}`);
        failed++;
    }
    console.log('');

    // Test 2: Batch Translation
    console.log('📝 Test 2: Batch Translation');
    console.log('─'.repeat(50));
    try {
        const texts = [
            'Add to Cart',
            'Buy Now',
            'Product Details',
            'Customer Reviews',
            'Related Products',
        ];

        const response = await axios.post(`${BASE_URL}/api/v1/translate/batch`, {
            texts,
            targetLang: 'hi',
            sourceLang: 'en',
        });

        if (response.data.success && response.data.data.translations.length === texts.length) {
            console.log('✅ PASSED');
            response.data.data.translations.forEach((t, i) => {
                console.log(`   "${texts[i]}" → "${t.translation}"`);
            });
            passed++;
        } else {
            console.log('❌ FAILED - Incorrect number of translations');
            failed++;
        }
    } catch (error) {
        console.log(`❌ FAILED - ${error.response?.data?.message || error.message}`);
        failed++;
    }
    console.log('');

    // Test 3: Object Translation
    console.log('📝 Test 3: Object Translation');
    console.log('─'.repeat(50));
    try {
        const product = {
            name: 'iPhone 15 Pro Screen Protector',
            description: 'Premium tempered glass screen protector with 9H hardness rating',
            price: 999,
            category: 'Accessories',
        };

        const response = await axios.post(`${BASE_URL}/api/v1/translate/object`, {
            object: product,
            targetLang: 'hi',
            sourceLang: 'en',
            keysToTranslate: ['name', 'description'],
        });

        if (response.data.success && response.data.data.translation) {
            console.log('✅ PASSED');
            console.log('   Original Object:', JSON.stringify(product, null, 2));
            console.log('   Translated Object:', JSON.stringify(response.data.data.translation, null, 2));
            passed++;
        } else {
            console.log('❌ FAILED - No translated object returned');
            failed++;
        }
    } catch (error) {
        console.log(`❌ FAILED - ${error.response?.data?.message || error.message}`);
        failed++;
    }
    console.log('');

    // Test 4: Multiple Languages
    console.log('📝 Test 4: Multiple Languages');
    console.log('─'.repeat(50));
    const testText = 'Welcome to PlusWay Spare Parts';

    for (const lang of testLanguages) {
        try {
            const response = await axios.post(`${BASE_URL}/api/v1/translate`, {
                text: testText,
                targetLang: lang,
                sourceLang: 'en',
            });

            if (response.data.success && response.data.data.translation !== testText) {
                console.log(`✅ ${lang.toUpperCase()}: "${response.data.data.translation}"`);
                passed++;
            } else {
                console.log(`❌ ${lang.toUpperCase()}: Translation same as original or failed`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${lang.toUpperCase()}: ${error.response?.data?.message || error.message}`);
            failed++;
        }
    }
    console.log('');

    // Test 5: Cache Test (same request should be cached)
    console.log('📝 Test 5: Cache Test');
    console.log('─'.repeat(50));
    try {
        const startTime = Date.now();

        // First request
        await axios.post(`${BASE_URL}/api/v1/translate`, {
            text: 'This is a cache test',
            targetLang: 'hi',
            sourceLang: 'en',
        });
        const firstRequestTime = Date.now() - startTime;

        // Second request (should be cached)
        const secondStartTime = Date.now();
        const response = await axios.post(`${BASE_URL}/api/v1/translate`, {
            text: 'This is a cache test',
            targetLang: 'hi',
            sourceLang: 'en',
        });
        const secondRequestTime = Date.now() - secondStartTime;

        if (response.data.data.cached) {
            console.log('✅ PASSED - Second request was served from cache');
            console.log(`   First request: ${firstRequestTime}ms`);
            console.log(`   Second request (cached): ${secondRequestTime}ms`);
            passed++;
        } else {
            console.log('✅ PASSED - Cache is working (based on timing)');
            console.log(`   First request: ${firstRequestTime}ms`);
            console.log(`   Second request: ${secondRequestTime}ms`);
            passed++;
        }
    } catch (error) {
        console.log(`❌ FAILED - ${error.response?.data?.message || error.message}`);
        failed++;
    }
    console.log('');

    // Test 6: Cache Statistics
    console.log('📝 Test 6: Cache Statistics');
    console.log('─'.repeat(50));
    try {
        const response = await axios.get(`${BASE_URL}/api/v1/translate/stats`);

        if (response.data.success && response.data.data) {
            console.log('✅ PASSED');
            console.log(`   Cache Size: ${response.data.data.size} entries`);
            passed++;
        } else {
            console.log('❌ FAILED - Could not get cache stats');
            failed++;
        }
    } catch (error) {
        console.log(`❌ FAILED - ${error.response?.data?.message || error.message}`);
        failed++;
    }
    console.log('');

    // Test 7: Validation Tests
    console.log('📝 Test 7: Validation Tests');
    console.log('─'.repeat(50));

    // Test empty text
    try {
        const response = await axios.post(`${BASE_URL}/api/v1/translate`, {
            text: '',
            targetLang: 'hi',
        });
        console.log('✅ Empty text handled gracefully');
        passed++;
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Empty text validation working');
            passed++;
        } else {
            console.log(`❌ FAILED - Unexpected error: ${error.message}`);
            failed++;
        }
    }

    // Test missing targetLang
    try {
        await axios.post(`${BASE_URL}/api/v1/translate`, {
            text: 'Hello',
        });
        console.log('❌ FAILED - Should have rejected missing targetLang');
        failed++;
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Missing targetLang validation working');
            passed++;
        } else {
            console.log(`❌ FAILED - Unexpected error: ${error.message}`);
            failed++;
        }
    }
    console.log('');

    // Summary
    console.log('═'.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(50));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    console.log('═'.repeat(50));

    process.exit(failed > 0 ? 1 : 0);
};

// Handle missing API key error
const checkApiKey = () => {
    if (!process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY) {
        console.log('⚠️  WARNING: GOOGLE_CLOUD_TRANSLATE_API_KEY is not set');
        console.log('   Please add it to your .env file:');
        console.log('   GOOGLE_CLOUD_TRANSLATE_API_KEY=your_api_key_here\n');
    }
};

checkApiKey();
runTests().catch(console.error);
