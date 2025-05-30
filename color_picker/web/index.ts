// import * as dotenv from "dotenv";
// dotenv.config();
import express from "express";
import morgan from "morgan";

import routes from "./src/routes";


const app = express();
const port = parseInt(process.env.EXPRESS_PORT ?? "") || "3000";

app.use(morgan("dev"));
app.use(routes);

app.listen(port, () => {
  console.log(`Express server listening on port ${port}.`);
});
