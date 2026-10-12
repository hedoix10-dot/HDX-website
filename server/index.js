import { createApp } from './app.js';
import { startCatalogSync } from './catalog-sync.js';
import { startEmailWorker } from './email-worker.js';
const port = Number(process.env.PORT || 3001);
const server = createApp().listen(port, '0.0.0.0', () => console.log(`HeDoiX server listening on port ${port}`));
const stopSync = startCatalogSync({ env: process.env });
const stopEmail = startEmailWorker({ env: process.env });
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => { stopSync(); const emails = stopEmail(); server.close(async () => { await emails; process.exit(0); }); });
