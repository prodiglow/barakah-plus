import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { initiateCardTransaction } from '../services/jazzcash.service';

async function showCardPayload() {
    console.log('🧪 Showing Card Payment Payload Structure...\n');

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

    // Mock fetch to intercept the actual payload being sent
    let capturedPayload: any = null;
    
    // @ts-ignore
    global.fetch = async (url: string, options: any) => {
        console.log('📡 URL:', url);
        console.log('📦 Actual Payload Being Sent to JazzCash:\n');
        
        // Parse and display the actual payload
        capturedPayload = JSON.parse(options.body);
        console.log(JSON.stringify(capturedPayload, null, 2));
        
        console.log('\n✅ Field Count:', Object.keys(capturedPayload).length);
        console.log('✅ pp_SecureHash present:', !!capturedPayload.pp_SecureHash);
        console.log('✅ pp_SecureHash value length:', capturedPayload.pp_SecureHash?.length || 0);
        
        return {
            json: async () => ({ pp_ResponseCode: '000', pp_ResponseMessage: 'Mock Success' }),
            ok: true
        };
    };

    try {
        await initiateCardTransaction(
            amount,
            customerInfo,
            'Description of transaction',
            'billRef'
        );
    } catch (error) {
        console.error('Error:', error);
    }
}

showCardPayload();
