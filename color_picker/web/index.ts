import express from "express";
import * as dotenv from "dotenv";
import morgan from "morgan";

import routes from "./src/routes";

dotenv.config();

const app = express();
const port = parseInt(process.env.EXPRESS_PORT ?? "") || "3000";

app.use(morgan("dev"));
app.use(routes);

app.listen(port, () => {
  console.log(`Express server listening on port ${port}.`);
});
