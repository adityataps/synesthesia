import express from "express";
import morgan from "morgan";
import { connect } from "./src/services/databaseService";

import routes from "./src/routes";

const app = express();
const port = parseInt(process.env.EXPRESS_PORT ?? "") || "3000";

app.use(express.json());
app.use(morgan("dev"));
app.use(routes);

connect().then(() => {
  app.listen(port, () => {
    console.log(`Express server listening on port ${port}.`);
  });
});
