import { execSync } from "child_process";
import fs from "fs";

import { normalizeLyrics } from "./normalize.js";
import { alignLyrics } from "./accurate_align.js";

console.log("Running Whisper transcription...");

// Call the Python script with two arguments: audio file and new output json file
execSync(
    "python3 scripts/transcribe.py data/audio.wav output/whisper_words.json",
    { stdio: "inherit" }
);

// Whisper output json file
const whisperWords = JSON.parse(fs.readFileSync("output/whisper_words.json", "utf8"));

console.log("Here are the first 5 transcribed words:");
console.log(whisperWords.slice(0, 5));

// Normalize actual lyrics
const lyricsText = fs.readFileSync("data/lyrics.txt", "utf8");
const lyricWords = normalizeLyrics(lyricsText);

console.log(`Loaded ${lyricWords.length} actual lyric words`);
console.log("Here are the first 5 lyrics:");
console.log(lyricWords.slice(0, 5));

// Align lyrics to audio
const aligned = alignLyrics(lyricWords, whisperWords);

fs.writeFileSync("output/aligned_words.json", JSON.stringify(aligned, null, 2));

console.log(`Aligned ${aligned.length} lyric words`);