import { env } from "./config/env";
import app from "./app";
import { recoverPending } from "./services/refund.service";

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

// Refund messages stuck in "pending": once at startup, then every minute
recoverPending().catch(console.error);
setInterval(() => recoverPending().catch(console.error), 60 * 1000);