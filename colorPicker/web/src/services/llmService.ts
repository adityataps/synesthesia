import * as fs from "fs";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
const prompt = fs.readFileSync("assets/generatePhrasePrompt.txt", "utf8");
const answerRegex = /<output>(.*?)<\/output>/;

/**
 * Class to manage a history of previously generated phrases
 * Note: This is an in-memory solution. If the server restarts, the history will be lost.
 * For persistence across restarts, consider using a database or file storage.
 */
class PhraseHistory {
  private phrases: string[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  /**
   * Add a new phrase to the history
   * @param phrase The phrase to add
   */
  addPhrase(phrase: string): void {
    // Add to the beginning of the array (newest first)
    this.phrases.unshift(phrase);

    // Keep only the most recent phrases up to maxSize
    if (this.phrases.length > this.maxSize) {
      this.phrases.pop();
    }
  }

  // /**
  //  * Get all phrases in the history
  //  * @returns Array of phrases
  //  */
  // getPhrases(): string[] {
  //   return [...this.phrases];
  // }

  /**
   * Get the number of phrases in the history
   * @returns Number of phrases
   */
  getCount(): number {
    return this.phrases.length;
  }

  /**
   * Format the phrases for inclusion in the system prompt
   * @returns Formatted string of phrases
   */
  formatForPrompt(): string {
    if (this.phrases.length === 0) {
      return '';
    }

    return `\nAvoid repeating similar phrases, words, or color descriptors from these recently generated phrases:\n${
      this.phrases.map((phrase, index) => `${index + 1}. "${phrase}"`).join('\n')
    }`;
  }
}

// Create a history manager with a capacity of 10 phrases
const phraseHistory = new PhraseHistory(10);

// TODO: query for list of phrases and store in external cache to prevent increased costs
async function generatePhrase(): Promise<string> {
  let response;

  // Create a system prompt that includes previous phrases to avoid repetition
  const systemPrompt = `You are a creative AI tasked with generating short, colorful phrases for training a "synesthetic" AI model that maps text to colors. Your goal is to create unique and evocative phrases that blend visual elements with other sensory experiences. ${phraseHistory.formatForPrompt()}`;

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
              text: prompt,
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
  const phrase = answer.match(answerRegex)?.[1] ?? "";

  // Add the new phrase to the history
  if (phrase) {
    phraseHistory.addPhrase(phrase);
    console.debug(`Updated phrase history. Now tracking ${phraseHistory.getCount()} phrases.`);
  }

  return phrase;
}

export { generatePhrase, PhraseHistory };
