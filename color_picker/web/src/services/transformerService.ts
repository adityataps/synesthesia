import { AutoTokenizer } from "@huggingface/transformers";

async function tokenizePhrase(phrase: string): Promise<string[]> {
  try {
    const tokenizer = await AutoTokenizer.from_pretrained(
      "distilbert-base-uncased",
    );
    return tokenizer.tokenize(phrase);
  } catch (e) {
    console.error(`Could not tokenize phrase: ${(e as Error).message}`);
    throw e;
  }
}

export { tokenizePhrase };
