
const axios = require('d:/Hacktimus/chaser-agent/server/node_modules/axios');

async function testManualChase() {
    try {
        // 1. Get Tasks to find a valid ID
        console.log("Fetching tasks...");
        const tasksRes = await axios.get('http://localhost:3001/tasks');
        const tasks = tasksRes.data;
        
        if (!Array.isArray(tasks) || tasks.length === 0) {
            console.log("No tasks found to chase.");
            return;
        }

        const task = tasks[0];
        console.log(`Chasing task ID: ${task.id} (${task.title})`);

        // 2. Call Chase Endpoint
        const chaseRes = await axios.post(`http://localhost:3001/tasks/${task.id}/chase`);
        
        console.log("Chase Response Status:", chaseRes.status);
        console.log("Chase Response Data:", chaseRes.data);
        
        if (chaseRes.data.success) {
            console.log("SUCCESS: Manual chase endpoint executed correctly.");
        } else {
            console.error("FAILURE: Chase endpoint returned success: false");
        }

    } catch (err) {
        console.error("FAILURE: Request failed.");
        if (err.response) {
             console.error("Status:", err.response.status);
             console.error("Data:", err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

testManualChase();
