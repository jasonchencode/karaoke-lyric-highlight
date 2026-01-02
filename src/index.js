import { execSync } from "child_process";
import fs from "fs";
import { normalizeLyrics } from "./normalize.js";

console.log("Running Whisper transcription...");

// Call the Python script with two arguments: audio file and new output json file
execSync(
    "python3 scripts/transcribe.py data/audio.wav output/whisper_words.json",
    { stdio: "inherit" }
);

const lyricsText = fs.readFileSync("data/lyrics.txt", "utf8");
const lyricWords = normalizeLyrics(lyricsText);

console.log(`Loaded ${lyricWords.length} actual lyric words`);
console.log("Here are the first 10 words:");
console.log(lyricWords.slice(0, 10));