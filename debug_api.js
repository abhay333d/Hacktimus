
const axios = require('d:/Hacktimus/chaser-agent/server/node_modules/axios');

async function checkApi() {
    try {
        const res = await axios.get('https://chaser-agent-hacktimus.onrender.com/tasks');
        console.log('Status:', res.status);
        console.log('Data type:', typeof res.data);
        console.log('Is Array:', Array.isArray(res.data));
        console.log('Data sample:', JSON.stringify(res.data).slice(0, 200));
    } catch (err) {
        console.error('Error fetching tasks:', err.message);
        if (err.response) {
            console.log('Response data:', err.response.data);
        }
    }
}

checkApi();
