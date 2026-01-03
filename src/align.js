/**
 * Simple lyric alignment algorithm that performs 1:1 word matching.
 * 
 * This is the basic alignment algorithm that matches one lyric word to one whisper word.
 * It does not handle cases where multiple words need to be combined (e.g., "mini bar" vs "minibar").
 * 
 * @param {string[]} lyrics - Array of normalized lyric words
 * @param {Array<{word: string, start: number, end: number}>} whisperWords - Array of transcribed words with timestamps
 * @param {number} [threshold=0.85] - Minimum similarity score (0-1) to accept a match
 * @returns {Array<{word: string, start: number, end: number}>} Array of aligned words with timing information
 * 
 * @example
 * const lyrics = ["hello", "world"];
 * const whisperWords = [
 *   { word: "hello", start: 0.0, end: 0.5 },
 *   { word: "world", start: 0.5, end: 1.0 }
 * ];
 * alignLyrics(lyrics, whisperWords); // Returns aligned array with timestamps
 */
import stringSimilarity from "string-similarity"
import { normalizeTranscription } from "./normalize.js";

export function alignLyrics(lyrics, whisperWords, threshold = 0.85) {
    const aligned = [];
    let l = 0; // lyric pointer (actual lyrics)
    let w = 0; // Whisper pointer

    while (l < lyrics.length && w < whisperWords.length) {
        const lyricWord = lyrics[l];
        // Since whisperWords is a list of objects, extract just the word text
        const spokenWord = normalizeTranscription(whisperWords[w].word);

        const  similarity = stringSimilarity.compareTwoStrings(
            lyricWord,
            spokenWord
        );

        if (lyricWord === spokenWord || similarity >= threshold) {
            aligned.push({
                word: lyricWord,
                start: whisperWords[w].start,
                end: whisperWords[w].end
            });
            w++;
            l++;
        } else {
            w++;
        }
    }

    return aligned;
}