import app from './app.js';
import { env } from './config/env.js';

const startServer = () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`🚀 LeadFlow AI Server is running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
