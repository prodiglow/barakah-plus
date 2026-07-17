const http = require('http');

const data = JSON.stringify({
    amount: 10000, // 100 * 100 = 10000 paisa? No wait, input is amount in PKR. Controller expects amount in PKR.
    // Wait, controller expects amount in PKR? 
    // jazzcash.service.ts: initiateCardTransaction(amount...): const amountInSmallestUnit = Math.round(amount * 100).toString();
    // So if I send 100, it becomes 10000. Correct.
    amount: 100,
    customerName: 'Test User',
    customerEmail: 'test@example.com'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/payment/card',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Sending request to http://localhost:5000/api/payment/card');

const req = http.request(options, res => {
    console.log(`StatusCode: ${res.statusCode}`);

    let responseBody = '';

    res.on('data', chunk => {
        responseBody += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(responseBody);
            console.log('Response:', JSON.stringify(json, null, 2));

            if (json.success && json.postUrl && json.formFields) {
                console.log('\n✅ Verification Successful: Received postUrl and formFields');
                console.log(`Target URL: ${json.postUrl}`);
                console.log(`TxnType: ${json.formFields.pp_TxnType}`);
                console.log(`Version: ${json.formFields.pp_Version}`);
                console.log(`SecureHash: ${json.formFields.pp_SecureHash}`);
            } else {
                console.error('\n❌ Verification Failed: Invalid response structure');
            }
        } catch (e) {
            console.error('Error parsing response:', e);
            console.log('Raw Response:', responseBody);
        }
    });
});

req.on('error', error => {
    console.error('Request Error:', error);
});

req.write(data);
req.end();
