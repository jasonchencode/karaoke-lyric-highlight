/**
 * Accurate lyric alignment algorithm with word combination support (similarity-based only).
 * 
 * This algorithm handles multiple alignment scenarios without first/last letter priority:
 * - 1:1 matching: Single lyric word to single whisper word
 * - N:1 matching: Multiple lyric words combined to match a single whisper word (e.g., ["mini", "bar"] -> "minibar")
 * - 1:N matching: Single lyric word matched to multiple combined whisper words (e.g., "minibar" -> ["mini", "bar"])
 * 
 * All matches are based on similarity scores only 
 * The algorithm tries all combinations and selects the one with the highest similarity score
 * 
 * @param {string[]} lyrics - Array of normalized lyric words
 * @param {Array<{word: string, start: number, end: number}>} whisperWords - Array of transcribed words with timestamps
 * @param {number} [threshold=0.85] - Minimum similarity score (0-1) to accept a match
 * @returns {Array<{word: string, start: number, end: number}>} Array of aligned words with timing information
 * 
 * @example
 * const lyrics = ["mini", "bar"];
 * const whisperWords = [
 *   { word: "minibar", start: 0.0, end: 0.8 }
 * ];
 * alignLyrics(lyrics, whisperWords); // Returns: [{ word: "mini bar", start: 0.0, end: 0.8 }]
 */
import stringSimilarity from "string-similarity"
import { normalizeTranscription } from "./normalize.js";

export function alignLyrics(lyrics, whisperWords, threshold = 0.85) {
    const aligned = [];
    let l = 0; // lyric pointer (actual lyrics)
    let w = 0; // Whisper pointer
    const maxLookahead = 3; // Maximum number of words to combine

    while (l < lyrics.length && w < whisperWords.length) {
        const lyricWord = lyrics[l];
        // Since whisperWords is a list of objects, extract just the word text
        const spokenWord = normalizeTranscription(whisperWords[w].word);

        // Try 1:1 match first (single lyric word to single Whisper word)
        let similarity = stringSimilarity.compareTwoStrings(lyricWord, spokenWord);
        let bestMatch = {
            type: '1:1',
            similarity: similarity,
            lyricEnd: l + 1,
            whisperEnd: w + 1,
            start: whisperWords[w].start,
            end: whisperWords[w].end
        };

        // Try combining multiple lyric words to match a single Whisper word
        // e.g., ["mini", "bar"] -> "minibar"
        for (let numLyricWords = 2; numLyricWords <= maxLookahead && l + numLyricWords <= lyrics.length; numLyricWords++) {
            const combinedLyric = lyrics.slice(l, l + numLyricWords).join('');
            const combinedSimilarity = stringSimilarity.compareTwoStrings(combinedLyric, spokenWord);
            
            if (combinedSimilarity > bestMatch.similarity) {
                bestMatch = {
                    type: 'N:1',
                    similarity: combinedSimilarity,
                    lyricEnd: l + numLyricWords,
                    whisperEnd: w + 1,
                    start: whisperWords[w].start,
                    end: whisperWords[w].end,
                    combinedWords: lyrics.slice(l, l + numLyricWords)
                };
            }
        }

        // Try combining multiple Whisper words to match a single lyric word
        // e.g., "minibar" -> ["mini", "bar"]
        for (let numWhisperWords = 2; numWhisperWords <= maxLookahead && w + numWhisperWords <= whisperWords.length; numWhisperWords++) {
            const combinedWhisper = whisperWords
                .slice(w, w + numWhisperWords)
                // Transform each Whisper word object into its normalized text string 
                .map(w => normalizeTranscription(w.word))
                .join('');
            const combinedSimilarity = stringSimilarity.compareTwoStrings(lyricWord, combinedWhisper);
            
            if (combinedSimilarity > bestMatch.similarity) {
                bestMatch = {
                    type: '1:N',
                    similarity: combinedSimilarity,
                    lyricEnd: l + 1,
                    whisperEnd: w + numWhisperWords,
                    start: whisperWords[w].start,
                    end: whisperWords[w + numWhisperWords - 1].end
                };
            }
        }

        // If we found a good match, add it to aligned results
        if (bestMatch.similarity >= threshold || lyricWord === spokenWord) {
            // For N:1 matches, use the combined words as the display text
            const displayWord = bestMatch.combinedWords ? bestMatch.combinedWords.join(' ') : lyricWord;
            
            aligned.push({
                word: displayWord,
                start: bestMatch.start,
                end: bestMatch.end
            });
            
            l = bestMatch.lyricEnd;
            w = bestMatch.whisperEnd;
        } else {
            // No match found, skip this Whisper word
            w++;
        }
    }

    return aligned;
}

