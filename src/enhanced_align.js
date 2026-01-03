import stringSimilarity from "string-similarity"
import { normalizeTranscription } from "./normalize.js";

export function alignLyrics(lyrics, whisperWords, threshold = 0.85) {
    const aligned = [];
    let l = 0; // lyric pointer (actual lyrics)
    let w = 0; // whisper pointer
    const maxLookahead = 3; // Maximum number of words to combine

    while (l < lyrics.length && w < whisperWords.length) {
        const lyricWord = lyrics[l];
        // Since whisperWords is a list of objects, extract just the word text
        const spokenWord = normalizeTranscription(whisperWords[w].word);

        // Function to check if first and last letters match
        const firstLastMatch = (str1, str2) => {
            if (str1.length === 0 || str2.length === 0) return false;
            return str1[0] === str2[0] && str1[str1.length - 1] === str2[str2.length - 1];
        };

        // PRIORITY 1: Check 1:1 match with first/last letter matching
        // If first and last letters match, prioritize this match
        let similarity = stringSimilarity.compareTwoStrings(lyricWord, spokenWord);
        let hasFirstLastMatch = firstLastMatch(lyricWord, spokenWord);
        let bestMatch = {
            type: '1:1',
            similarity: similarity,
            lyricEnd: l + 1,
            whisperEnd: w + 1,
            start: whisperWords[w].start,
            end: whisperWords[w].end,
            hasFirstLastMatch: hasFirstLastMatch
        };

        // Only try word combinations if first/last letters don't match
        if (!hasFirstLastMatch) {
            // Try combining multiple lyric words to match a single whisper word
            // e.g., ["mini", "bar"] -> "minibar"
            for (let numLyricWords = 2; numLyricWords <= maxLookahead && l + numLyricWords <= lyrics.length; numLyricWords++) {
                const combinedLyric = lyrics.slice(l, l + numLyricWords).join('');
                const combinedSimilarity = stringSimilarity.compareTwoStrings(combinedLyric, spokenWord);
                const combinedHasFirstLastMatch = firstLastMatch(combinedLyric, spokenWord);
                
                // Prioritize matches with first/last letter match, or higher similarity
                const isBetter = combinedHasFirstLastMatch || 
                    (!bestMatch.hasFirstLastMatch && combinedSimilarity > bestMatch.similarity);
                
                if (isBetter) {
                    bestMatch = {
                        type: 'N:1',
                        similarity: combinedSimilarity,
                        lyricEnd: l + numLyricWords,
                        whisperEnd: w + 1,
                        start: whisperWords[w].start,
                        end: whisperWords[w].end,
                        combinedWords: lyrics.slice(l, l + numLyricWords),
                        hasFirstLastMatch: combinedHasFirstLastMatch
                    };
                }
            }

            // Try combining multiple whisper words to match a single lyric word
            // e.g., "minibar" -> ["mini", "bar"]
            for (let numWhisperWords = 2; numWhisperWords <= maxLookahead && w + numWhisperWords <= whisperWords.length; numWhisperWords++) {
                const combinedWhisper = whisperWords
                    .slice(w, w + numWhisperWords)
                    .map(w => normalizeTranscription(w.word))
                    .join('');
                const combinedSimilarity = stringSimilarity.compareTwoStrings(lyricWord, combinedWhisper);
                const combinedHasFirstLastMatch = firstLastMatch(lyricWord, combinedWhisper);
                
                // Prioritize matches with first/last letter match, or higher similarity
                const isBetter = combinedHasFirstLastMatch || 
                    (!bestMatch.hasFirstLastMatch && combinedSimilarity > bestMatch.similarity);
                
                if (isBetter) {
                    bestMatch = {
                        type: '1:N',
                        similarity: combinedSimilarity,
                        lyricEnd: l + 1,
                        whisperEnd: w + numWhisperWords,
                        start: whisperWords[w].start,
                        end: whisperWords[w + numWhisperWords - 1].end,
                        hasFirstLastMatch: combinedHasFirstLastMatch
                    };
                }
            }
        }

        // If a good match is found, add it to aligned results
        // Accept if: similarity meets threshold, exact match, OR first/last letters match (no similarity requirement)
        if (bestMatch.similarity >= threshold || lyricWord === spokenWord || bestMatch.hasFirstLastMatch) {
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
            // No match found, skip this whisper word
            w++;
        }
    }

    return aligned;
}

