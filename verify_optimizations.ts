import { OpenHabClient } from './src/openhab-client.js';

async function verify() {
  console.log('--- Verifying OpenHAB MCP Optimizations ---');

  const client = new OpenHabClient('http://localhost:8080', 'fake', {
    enableSSE: false,
    debug: true,
  });

  // Wait for the background pre-warm to initiate (timeout 100ms in code)
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('\n--- Checking Log Folder Detection ---');
  const clientAny = client as unknown as { logFolderPath: string | null; eventLogBuffer: string[] };
  console.log(`Detected Log Folder: ${clientAny.logFolderPath}`);

  if (clientAny.logFolderPath) {
    console.log('✅ Log folder detection working');
  } else {
    console.log('❌ Log folder detection failed (check if GVFS is mounted)');
  }

  console.log('\n--- Checking Log Buffer Pre-warming ---');
  console.log(`Current Buffer Size: ${clientAny.eventLogBuffer.length}`);
  if (clientAny.eventLogBuffer.length > 0) {
    console.log('✅ Log buffer pre-warming working');
    console.log('Sample from buffer:', clientAny.eventLogBuffer.slice(-2));
  } else {
    console.log('⚠️ Log buffer pre-warming empty (normal if file is empty or missing)');
  }

  console.log('\n--- Testing searchLogs Tool Logic ---');
  try {
    const results = await client.searchLogs('Laundry');
    console.log(`Search 'Laundry' results: ${results.length}`);
    if (results.length > 0) {
      console.log('✅ searchLogs logic working');
      console.log('Result sample:', results[0]);
    }
  } catch (e: unknown) {
    console.log(`❌ searchLogs failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  console.log('\n--- Result of Optimized Health Check ---');
  const health = client.getMcpHealth();
  console.log(JSON.stringify(health, null, 2));
}

verify().catch(console.error);
