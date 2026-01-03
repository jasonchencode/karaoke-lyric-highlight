/**
 * Normalizes a lyrics text string by converting to lowercase, removing punctuation, and splitting into an array of words
 * 
 * @param {string} text - The raw lyrics text to normalize
 * @returns {string[]} Array of normalized words (lowercase, alphanumeric + spaces + apostrophes only)
 * 
 * @example
 * normalizeLyrics("Hello, World!") // Returns: ["hello", "world"]
 */
export function normalizeLyrics(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s']/g, "") // only keeps alphanumeric, whitespace, and single quote characters
        .split(/\s+/) // splits at whitespace characters
        .filter(Boolean);
}
 

/**
 * Normalizes a single transcribed word by converting to lowercase and removing punctuation
 * Keeps only alphanumeric characters, spaces, and single quotations
 * 
 * @param {string} word - The word to normalize (may contain punctuation)
 * @returns {string} Normalized word (lowercase, no punctuation)
 * 
 * @example
 * normalizeTranscription("Hello,") // Returns: "hello"
 * normalizeTranscription("don't") // Returns: "don't"
 */
export function normalizeTranscription(word) {
    return word
        .toLowerCase()
        .replace(/[^a-z0-9\s']/g, "")
}