const URL = 'https://elite-fawn-nu.vercel.app/api/auth/login';
const TOTAL_TEAMS = 400;
const BATCH_SIZE = 20;
const PASSWORD = 'teampassword123';

const runStressTest = async () => {
    console.log(`Starting stress test: ${TOTAL_TEAMS} logins to ${URL} (Batch size: ${BATCH_SIZE})...`);
    const startTime = Date.now();
    let results = [];

    for (let i = 1; i <= TOTAL_TEAMS; i += BATCH_SIZE) {
        const batchTasks = [];
        for (let j = 0; j < BATCH_SIZE && (i + j) <= TOTAL_TEAMS; j++) {
            const teamId = i + j;
            batchTasks.push(
                fetch(URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: `team${teamId}`,
                        password: PASSWORD
                    })
                }).then(async (res) => {
                    const data = await res.json();
                    return { status: res.status, ok: res.ok, data };
                }).catch(err => ({ error: err.message }))
            );
        }
        console.log(`Sending batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
        const batchResults = await Promise.all(batchTasks);
        results = results.concat(batchResults);
        // Small delay between batches to allow the server to recover
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    const successful = results.filter(r => r && r.ok).length;
    const failed = results.filter(r => r && !r.ok).length;
    const errors = results.filter(r => r && r.error).length;

    console.log('\n--- Stress Test Results ---');
    console.log(`Total Requests: ${TOTAL_TEAMS}`);
    console.log(`Successful Logins: ${successful}`);
    console.log(`Failed Logins: ${failed}`);
    console.log(`Network/SSL Errors: ${errors}`);
    console.log(`Total Duration: ${duration.toFixed(2)}s`);
    
    if (failed > 0 || errors > 0) {
        const firstFailure = results.find(r => r && (!r.ok || r.error));
        console.log('Sample failure:', firstFailure?.data || firstFailure?.error || 'Unknown error');
    }
};

runStressTest();
