# Karaoke Lyric Highlighter

Automatically aligns song lyrics with audio timestamps for karaoke-style word-by-word highlighting. Uses Whisper by OpenAI to transcribe audio and intelligently matches it to your lyrics.

## Files

**Input files:**
- `data/audio.wav` – Song audio in 16 kHz mono 16-bit PCM WAV format (convert with: `ffmpeg -y -i input.mp3 -vn -acodec pcm_s16le -ar 16000 -ac 1 data/audio.wav`)
- `data/lyrics.txt` – The actual lyrics of the song copy and pasted in there

**Output files:**
- `output/aligned_words.json` - Your aligned lyrics with timestamps
- `output/whisper_words.json` - Raw Whisper transcription with timestamps

## Alignment Algorithms

The project includes three alignment algorithms. Switch between them by changing the import in `src/index.js`:

- **`align.js`** - Simple 1:1 matching (baseline)
- **`accurate_align.js`** - Handles word combinations. Theoretically the most accurate, about 27% more accurate than align.js
- **`enhanced_align.js`** - Smart matching with first/last letter priority. Worked the best for me, about 42% more accurate than align.js

## How It Works

The tool transcribes your audio with Whisper, normalizes both the lyrics and transcription, then uses fuzzy matching to align them. It's smart enough to handle cases where Whisper merges words or your lyrics split them differently.

## Tips

- Use `accurate_align.js` in `index.js` for safest results
- If you're getting weird matches, try adjusting the similarity threshold (default 0.85)
- Run `node src/index.js` to start: the script will transcribe your audio and align the lyrics automatically

## Limitations

Accuracy depends on Whisper's transcription quality and string-similarity matching. Mismatches can occur due to transcription errors, merged/split words, or imperfect similarity scoring.

## Requirements

- Node.js (v14+)
- Python 3 with `whisper-timestamped`
- ffmpeg
