import * as fs from "fs";
import Anthropic from "@anthropic-ai/sdk";
import { AutoTokenizer } from "@huggingface/transformers";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
const systemPrompt = fs.readFileSync("assets/generatePhrasePrompt.txt", "utf8");

async function generatePhrase(): Promise<string> {
  let response;
  try {
    response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 8192,
      temperature: 1.0,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Generate a diverse phrase following these patterns. Return only the phrase.",
            },
          ],
        },
      ],
    });
  } catch (e) {
    console.error(
      `Could not generate phrase using Anthropic Claude: ${(e as Error).message}`,
    );
  }

  const phrase = response?.content?.[0]?.text;
  console.debug(`Generated phrase: ${phrase}`);
  return phrase;
}

async function tokenizePhrase(phrase: string): Promise<string[]> {
  const tokenizer = await AutoTokenizer.from_pretrained(
    "distilbert-base-uncased",
  );
  return tokenizer.tokenize(phrase);
}

export { generatePhrase, tokenizePhrase };
