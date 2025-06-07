import * as fs from "fs";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
const prompt = fs.readFileSync("assets/generatePhrasePrompt.txt", "utf8");
const answerRegex = /<output>(.*?)<\/output>/;

// TODO: query for list of phrases and store in external cache to prevent increased costs
async function generatePhrase(inspiration?: string): Promise<string> {
  let response;

  // Create a system prompt that includes previous phrases to avoid repetition
  const systemPrompt =
    "You are a creative AI tasked with generating short, colorful phrases for training a 'synesthetic' AI model that maps text to colors. Your goal is to create unique and evocative phrases that blend visual elements with other sensory experiences.";

  // Modify the prompt to include inspiration if provided
  let userPrompt = prompt;
  if (inspiration && inspiration.trim()) {
    userPrompt = `${prompt}\n\nUse the following as inspiration for your phrase: "${inspiration.trim()}"`;
    console.debug(`Using inspiration for phrase generation: ${inspiration}`);
  }

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
              text: userPrompt,
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

  // Extract the phrase from the response
  return answer.match(answerRegex)?.[1] ?? "";
}

export { generatePhrase };
