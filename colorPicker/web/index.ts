import express from "express";
import morgan from "morgan";
import cors from "cors";
import { rateLimit } from "express-rate-limit";

import { connect } from "./src/services/databaseService";
import routes from "./src/routes";

const app = express();
const port = parseInt(process.env.EXPRESS_PORT ?? "") || "3000";
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(morgan("dev"));
app.use(routes);

connect().then(() => {
  app.listen(port, () => {
    console.log(`Express server listening on port ${port}.`);
  });
});
