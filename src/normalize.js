export function normalizeLyrics(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s']/g, "") // only keeps alphanumeric, whitespace, and single quote characters
        .split(/\s+/) // splits at whitespace characters
        .filter(Boolean);
}
 