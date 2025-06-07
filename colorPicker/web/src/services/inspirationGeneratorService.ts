/**
 * Generates phrase inspiration
 */
class PhraseGenerator {
    // Explicit colors
    private colors: string[] = [
        "red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "black", "white",
        "teal", "magenta", "cyan", "crimson", "navy", "olive", "maroon", "lime", "indigo", "violet",
        "azure", "turquoise", "aquamarine", "cerulean", "sapphire", "emerald", "jade", "amber",
        "gold", "silver", "bronze", "copper", "platinum", "ivory", "ebony", "charcoal", "obsidian",
        "scarlet", "ruby", "coral", "peach", "lavender", "lilac", "mauve", "periwinkle", "ochre"
    ];

    // Color modifiers and intensities
    private modifiers: string[] = [
        "bright", "dark", "deep", "light", "pale", "vivid", "muted", "rich", "soft", "harsh",
        "brilliant", "dull", "faded", "glowing", "radiant", "shimmering", "iridescent", "luminous",
        "fluorescent", "neon", "pastel", "saturated", "desaturated", "vibrant", "subtle", "bold",
        "electric", "metallic", "translucent", "opaque", "transparent", "shadowy", "smoky", "hazy"
    ];

    // Materials and textures
    private materials: string[] = [
        "velvet", "silk", "cotton", "leather", "metal", "glass", "wood", "stone", "paper", "plastic",
        "crystal", "ceramic", "marble", "granite", "steel", "iron", "gold", "silver", "bronze",
        "copper", "diamond", "ruby", "emerald", "sapphire", "pearl", "amber", "jade", "obsidian",
        "satin", "linen", "wool", "denim", "lace", "fur", "feather", "sand", "water", "ice", "fire"
    ];

    // Semantic color associations (objects, elements, nature)
    private associations: string[] = [
        "ocean", "sky", "forest", "sunset", "dawn", "dusk", "night", "day", "fire", "ice",
        "blood", "grass", "leaf", "flower", "rose", "tulip", "daisy", "sunflower", "tree", "mountain",
        "river", "lake", "desert", "cloud", "rain", "snow", "storm", "lightning", "thunder", "rainbow",
        "star", "moon", "sun", "planet", "galaxy", "universe", "cosmos", "nebula", "comet", "asteroid",
        "butterfly", "bird", "fish", "coral", "seashell", "pearl", "diamond", "ruby", "emerald", "sapphire"
    ];

    // Abstract concepts and emotions
    private concepts: string[] = [
        "dream", "memory", "thought", "idea", "hope", "fear", "love", "hate", "joy", "sorrow",
        "peace", "chaos", "harmony", "discord", "balance", "imbalance", "life", "death", "birth", "rebirth",
        "beginning", "end", "eternity", "moment", "time", "space", "infinity", "void", "abyss", "heaven",
        "hell", "paradise", "utopia", "dystopia", "reality", "fantasy", "truth", "lie", "wisdom", "folly"
    ];

    // Verbs and actions
    private actions: string[] = [
        "dance", "sing", "whisper", "shout", "flow", "freeze", "burn", "melt", "grow", "shrink",
        "rise", "fall", "float", "sink", "fly", "crawl", "run", "walk", "jump", "dive",
        "twist", "turn", "spin", "rotate", "vibrate", "pulse", "beat", "breathe", "live", "die",
        "create", "destroy", "build", "break", "open", "close", "begin", "end", "transform", "evolve"
    ];

    /**
     * Generate a random phrase by combining elements from the different categories
     * @returns A randomly generated phrase
     */
    generatePhrase(): string {
        // Determine the structure of the phrase (2-8 words)
        const wordCount = Math.floor(Math.random() * 7) + 2; // 2-8 words

        // Create arrays of the different elements we might include
        const elements: string[][] = [];

        // Always include at least one color
        elements.push([
            this.getRandomElement(this.colors),
            `${this.getRandomElement(this.modifiers)} ${this.getRandomElement(this.colors)}`,
        ]);

        // Add other elements
        elements.push(this.materials);
        elements.push(this.associations);
        elements.push(this.concepts);
        elements.push(this.actions);

        // Generate the phrase
        const phrase: string[] = [];

        // First word is always a color or modified color
        phrase.push(this.getRandomElement(elements[0]));

        // Add remaining words
        while (phrase.length < wordCount) {
            // Pick a random category
            const categoryIndex = Math.floor(Math.random() * (elements.length - 1)) + 1;
            const word = this.getRandomElement(elements[categoryIndex]);

            // Avoid duplicates
            if (!phrase.includes(word)) {
                phrase.push(word);
            }
        }

        return phrase.join(' ');
    }

    /**
     * Get a random element from an array
     * @param array The array to pick from
     * @returns A random element
     */
    private getRandomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }
}

// Create a phrase generator
const phraseGenerator = new PhraseGenerator();

/**
 * Generate a random colorful phrase using the PhraseGenerator
 * @returns A randomly generated phrase
 */
function generateInspiration(): string {
    const phrase = phraseGenerator.generatePhrase();
    console.debug(`Generated random phrase: ${phrase}`);
    return phrase;
}

export { generateInspiration, PhraseGenerator };
