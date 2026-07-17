
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { initiateCardTransaction } from '../services/jazzcash.service';

async function testCardPayment() {
    console.log('🧪 Testing JazzCash Card Payment Payload Generation...');

    // Dummy data matching user's sample as closely as possible
    const amount = 200; // 20000 paisa
    const customerInfo = {
        name: 'Guest Customer',
        email: 'abc@abc.com',
        phone: '03331234567',
        cnic: '1234567890123',
        cardNumber: '5123456789012346',
        cardCvv: '123',
        cardExpiry: '12/22'
    };
    const description = 'Description of transaction';
    const billReference = 'billRef';

    try {
        // We are mocking the fetch since we just want to see the construction logic logs
        // But since initiateCardTransaction calls fetch, it might fail if we don't mock it or if the URL is unreachable.
        // However, the service logs the request data BEFORE calling fetch.
        // So even if fetch fails, we should see the logs.
        
        // To be safe, we can mock global fetch if needed, but let's try running it. 
        // If it fails on network, we still check the console output.
        
        // We are mocking the fetch since we just want to see the construction logic logs
        // But since initiateCardTransaction calls fetch, it might fail if we don't mock it or if the URL is unreachable.
        // However, the service logs the request data BEFORE calling fetch.
        // So even if fetch fails, we should see the logs.
        
        // Monkey Patch fetch with a simple function
        // @ts-ignore
        global.fetch = async () => ({
            json: async () => ({ pp_ResponseCode: '000', pp_ResponseMessage: 'Mock Success' }),
            ok: true
        });

        const result = await initiateCardTransaction(
            amount,
            customerInfo,
            description,
            billReference
        );

        console.log('✅ Result:', result);

    } catch (error) {
        console.error('❌ Error during test:', error);
    }
}

// Simple mock for Jest fn if not available in this env
if (typeof global.fetch === 'undefined') {
     // @ts-ignore
     global.fetch = async (url, options) => {
         console.log('Mock Fetch Called with URL:', url);
         console.log('Mock Fetch Body:', options?.body);
         return {
             json: async () => ({ pp_ResponseCode: '000', pp_ResponseMessage: 'Mock Success' }),
             ok: true
         };
     }
}

testCardPayment();
