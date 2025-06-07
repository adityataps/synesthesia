import { Router } from "express";
import { generatePhrase } from "./services/llmService";
import { tokenizePhrase } from "./services/transformerService";
import { saveSampleToDatabase } from "./services/databaseService";
import { generateInspiration } from "./services/inspirationGeneratorService";
import { IDataSample } from "./types";

const router = Router();

router.get("/", (req: any, res: any) => res.send("Server is running."));

router.get("/tokenized_phrase", async (req: any, res: any) => {
  let phrase;
  let tokens;
  const inspiration = generateInspiration();

  try {
    phrase = await generatePhrase(inspiration);
    tokens = await tokenizePhrase(phrase);
  } catch (e) {
    console.error(`Could not generate phrase: ${(e as Error).message}`);
    return res.sendStatus(500);
  }

  return res.send({ phrase, tokens });
});

router.post("/save_sample", async (req: any, res: any) => {
  const { phrase, tokens, colors } = req.body as IDataSample;
  console.debug(`Saving sample: ${phrase}`);
  tokens.map((token, idx) => {
    console.debug(`Token: '${token}'; Color: ${JSON.stringify(colors[idx])}`);
  });

  try {
    await saveSampleToDatabase({ phrase, tokens, colors });
  } catch (e) {
    console.error(`Could not save sample to database: ${(e as Error).message}`);
    return res.sendStatus(500);
  }

  return res.sendStatus(200);
});

export default router;
