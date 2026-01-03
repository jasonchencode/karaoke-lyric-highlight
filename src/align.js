import stringSimilarity from "string-similarity"
import { normalizeTranscription } from "./normalize.js";

export function alignLyrics(lyrics, whisperWords, threshold = 0.85) {
    const aligned = [];
    let l = 0; // lyric pointer (actual lyrics)
    let w = 0; // whisper pointer

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