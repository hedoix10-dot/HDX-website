import { createApp } from './app.js';
const port = Number(process.env.PORT || 3001);
const server = createApp().listen(port, '0.0.0.0', () => console.log(`HeDoiX server listening on port ${port}`));
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)));
