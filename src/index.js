/**
 * Main entry point for the lyric alignment pipeline
 * 
 * This script orchestrates the entire lyric alignment process:
 * 1. Runs Whisper transcription on the audio file to get word-level timestamps
 * 2. Normalizes the actual lyrics text
 * 3. Aligns the lyrics to the transcribed audio timestamps
 * 4. Saves the aligned results to a JSON file
 * 
 * Input files:
 * - data/audio.wav: Audio file to transcribe
 * - data/lyrics.txt: Text file containing the actual lyrics
 * 
 * Output files:
 * - output/whisper_words.json: Whisper transcription with timestamps
 * - output/aligned_words.json: Aligned lyrics with timing information
 * 
 */

import { execSync } from "child_process";
import fs from "fs";

import { normalizeLyrics } from "./normalize.js";
import { alignLyrics } from "./accurate_align.js"; // edit this to use the different alignment algorithms

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