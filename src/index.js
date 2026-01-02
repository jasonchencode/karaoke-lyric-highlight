import { execSync } from "child_process";
import fs from "fs";

console.log("Running Whisper transcription...");

// Call the Python script with two arguments: audio file and new output json file
execSync(
    "python3 scripts/transcribe.py data/audio.wav output/whisper_words.json",
    { stdio: "inherit" }
);

const raw = fs.readFileSync("output/whisper_words.json", "utf8");
const whisperWords = JSON.parse(raw);

console.log("Here are the first 10 words:");
console.log(whisperWords.slice(0, 10));