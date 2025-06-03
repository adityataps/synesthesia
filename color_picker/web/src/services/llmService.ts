import * as fs from "fs";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
const systemPrompt = fs.readFileSync("assets/generatePhrasePrompt.txt", "utf8");
const answerRegex = /<output>(.*?)<\/output>/;

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
              text: "Generate a random colorful phrase.",
            },
          ],
        },
      ],
    });
  } catch (e) {
    console.error(
      `Could not generate phrase using Anthropic Claude: ${(e as Error).message}`,
    );
    throw e;
  }

  const resp = response?.content?.[0];
  if (resp.type !== "text") {
    throw new Error("Unexpected response type from Anthropic Claude");
  }

  const answer = resp.text;
  console.debug(`Generated LLM response: ${JSON.stringify(answer)}`);
  return answer.match(answerRegex)?.[1] ?? "";
}

export { generatePhrase };
