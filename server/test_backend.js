const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  //console.log('--- Testing Backend API ---');

  // 1. Get Users
  //console.log('\n1. GET /users');
  const usersRes = await request({
    hostname: 'localhost', port: 3001, path: '/users', method: 'GET'
  });
  //console.log('Status:', usersRes.status);
  //console.log('Users:', usersRes.body.length);

  // 2. Create Task
  //console.log('\n2. POST /tasks');
  const taskData = {
    title: 'Test Task',
    description: 'A task to test the chaser',
    assignee_id: 1,
    due_date: new Date(Date.now() - 86400000).toISOString() // Yesterday (Overdue)
  };
  const createRes = await request({
    hostname: 'localhost', port: 3001, path: '/tasks', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, taskData);
  //console.log('Status:', createRes.status);
  //console.log('Task ID:', createRes.body.id);
  const taskId = createRes.body.id;

  // 3. Manual Chase
  //console.log(`\n3. POST /tasks/${taskId}/chase`);
  const chaseRes = await request({
    hostname: 'localhost', port: 3001, path: `/tasks/${taskId}/chase`, method: 'POST'
  });
  //console.log('Status:', chaseRes.status);
  //console.log('Message:', chaseRes.body.sent_message);

  // 4. Check Overdue (Auto)
  //console.log('\n4. GET /tasks/check-overdue');
  // Note: We just chased it manually, so last_chased_at is today. It might NOT chase again depending on logic.
  // Logic: "last_chased_at IS NULL OR substr(tasks.last_chased_at, 1, 10) != today"
  // So it should NOT chase again.
  const checkRes = await request({
    hostname: 'localhost', port: 3001, path: '/tasks/check-overdue', method: 'GET'
  });
  //console.log('Status:', checkRes.status);
  //console.log('Chased Count (expect 0 for this task):', checkRes.body.chased_count);

  // 5. Create fresh overdue task for Auto Check
  //console.log('\n5. Create another overdue task');
  const task2Res = await request({
    hostname: 'localhost', port: 3001, path: '/tasks', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { ...taskData, title: 'Auto Chase Task' });
  
  //console.log('\n6. GET /tasks/check-overdue (Should chase new task)');
  const check2Res = await request({
    hostname: 'localhost', port: 3001, path: '/tasks/check-overdue', method: 'GET'
  });
  //console.log('Status:', check2Res.status);
  //console.log('Chased Count:', check2Res.body.chased_count);
}

runTests().catch(console.error);
