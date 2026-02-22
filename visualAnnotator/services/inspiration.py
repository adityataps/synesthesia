"""Generates random phrase inspiration for the LLM."""

import random

_COLORS = [
    "red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "black", "white",
    "teal", "magenta", "cyan", "crimson", "navy", "olive", "maroon", "lime", "indigo", "violet",
    "azure", "turquoise", "aquamarine", "cerulean", "sapphire", "emerald", "jade", "amber",
    "gold", "silver", "bronze", "copper", "platinum", "ivory", "ebony", "charcoal", "obsidian",
    "scarlet", "ruby", "coral", "peach", "lavender", "lilac", "mauve", "periwinkle", "ochre",
]

_MODIFIERS = [
    "bright", "dark", "deep", "light", "pale", "vivid", "muted", "rich", "soft", "harsh",
    "brilliant", "dull", "faded", "glowing", "radiant", "shimmering", "iridescent", "luminous",
    "fluorescent", "neon", "pastel", "saturated", "desaturated", "vibrant", "subtle", "bold",
    "electric", "metallic", "translucent", "opaque", "transparent", "shadowy", "smoky", "hazy",
]

_MATERIALS = [
    "velvet", "silk", "cotton", "leather", "metal", "glass", "wood", "stone", "paper", "plastic",
    "crystal", "ceramic", "marble", "granite", "steel", "iron", "gold", "silver", "bronze",
    "copper", "diamond", "ruby", "emerald", "sapphire", "pearl", "amber", "jade", "obsidian",
    "satin", "linen", "wool", "denim", "lace", "fur", "feather", "sand", "water", "ice", "fire",
]

_ASSOCIATIONS = [
    "ocean", "sky", "forest", "sunset", "dawn", "dusk", "night", "day", "fire", "ice",
    "blood", "grass", "leaf", "flower", "rose", "tulip", "daisy", "sunflower", "tree", "mountain",
    "river", "lake", "desert", "cloud", "rain", "snow", "storm", "lightning", "thunder", "rainbow",
    "star", "moon", "sun", "planet", "galaxy", "universe", "cosmos", "nebula", "comet", "asteroid",
    "butterfly", "bird", "fish", "coral", "seashell", "pearl", "diamond", "ruby", "emerald", "sapphire",
]

_CONCEPTS = [
    "dream", "memory", "thought", "idea", "hope", "fear", "love", "hate", "joy", "sorrow",
    "peace", "chaos", "harmony", "discord", "balance", "imbalance", "life", "death", "birth", "rebirth",
    "beginning", "end", "eternity", "moment", "time", "space", "infinity", "void", "abyss", "heaven",
    "hell", "paradise", "utopia", "dystopia", "reality", "fantasy", "truth", "lie", "wisdom", "folly",
]

_ACTIONS = [
    "dance", "sing", "whisper", "shout", "flow", "freeze", "burn", "melt", "grow", "shrink",
    "rise", "fall", "float", "sink", "fly", "crawl", "run", "walk", "jump", "dive",
    "twist", "turn", "spin", "rotate", "vibrate", "pulse", "beat", "breathe", "live", "die",
    "create", "destroy", "build", "break", "open", "close", "begin", "end", "transform", "evolve",
]


def generate_inspiration() -> str:
    """Return a short random phrase to seed the LLM phrase generator."""
    word_count = random.randint(2, 8)

    # Colour or modified colour is always first
    color_choices = [
        random.choice(_COLORS),
        f"{random.choice(_MODIFIERS)} {random.choice(_COLORS)}",
    ]
    words = [random.choice(color_choices)]

    pools = [_MATERIALS, _ASSOCIATIONS, _CONCEPTS, _ACTIONS]
    while len(words) < word_count:
        pool = random.choice(pools)
        word = random.choice(pool)
        if word not in words:
            words.append(word)

    return " ".join(words)
