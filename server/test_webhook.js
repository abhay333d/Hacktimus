const axios = require('axios');

const BOLTIC_WEBHOOK_URL = "https://asia-south1.api.boltic.io/service/webhook/temporal/v1.0/f1538e24-b148-451f-bebc-317b3d530547/workflows/execute/bd426dd3-5b96-46b2-8aa3-c4202ded98f8";

async function testWebhook() {
    //console.log("Testing Bolt Webhook...");
    try {
        const payload = {
            email: "test_user@example.com", // Replace with a real email if needed
            message: "This is a test message from the Chaser Agent debugger.",
            user_name: "Test User",
            task_id: 999
        };

        //console.log("Sending payload:", payload);
        const res = await axios.post(BOLTIC_WEBHOOK_URL, payload);
        
        //console.log("Status:", res.status);
        //console.log("Data:", res.data);
        //console.log("SUCCESS: Webhook accepted the request.");
    } catch (err) {
        console.error("FAILURE: Webhook request failed.");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

testWebhook();
