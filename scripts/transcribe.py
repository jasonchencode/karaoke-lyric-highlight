import sys
import json
import whisper_timestamped as whisper

def main():
    # User must list 2 arguments
    if len(sys.argv) != 3:
        print("Need 2 arguments: audio file and output file")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    output_path = sys.argv[2]

    print("Loading Whisper model...")
    # Using Whisper's 'small' model
    model = whisper.load_model("small")

    print(f"Transcribing {audio_path}...")
    # Whisper transcribe returns a dictionary with all data consisting of word-by-word timestamps
    result = whisper.transcribe(model, audio_path)

    # Extract timestamps
    words = []
    for segment in result["segments"]:
        for word in segment["words"]:
            # Add a new dictionary each iteration that stores the cleaned word 
            # (removed whitespace and converted to lowercase), the start time, and end time
            words.append({
                "word": word["text"].strip().lower(),
                "start": word["start"],
                "end": word["end"]
            })

    with open(output_path, "w") as f:
        # Save results as a nicely formatted JSON
        json.dump(words, f, indent=2)

    print(f"Saved {len(words)} words to {output_path}")


if __name__ == "__main__":
    main()
