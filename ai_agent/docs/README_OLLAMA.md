## Ollama Local API Integration (Llama 3.1 8B/70B)

This integration connects to a local Ollama server to analyze extracted PDF text using `Llama 3.1` models (8B or 70B) without sending data to external servers.

### Requirements
- Install Ollama: see `https://ollama.com/download`
- Start the server: `ollama serve`
- (Optional) Pull a model ahead of time:
  - `ollama pull llama3.1:8b`
  - `ollama pull llama3.1:70b` (requires strong GPU/large RAM)

### Privacy
- Processing happens locally via `http://127.0.0.1:11434`.
- No business plan text leaves your machine.

### Endpoints Used
- `GET /api/tags` — list local models
- `POST /api/pull` — pull a model
- `POST /api/generate` — text generation

### Usage
Run analysis on a text file (extracted PDF content):

```bash
cd phase1/objectif1.2
python3 ollama_integration.py --model llama3.1:8b --file /path/to/extracted_text.txt --deterministic --max-new-tokens 512
```

Options:
- `--model`: `llama3.1:8b` or `llama3.1:70b`
- `--deterministic`: set temperature 0.0
- `--max-new-tokens`: limit output size
- `--num-ctx`: context window (default 8192)

### Limits and Cost
- Local inference; no token costs. Performance depends on your hardware.
- Context window and output length affect memory and latency.

### Error Handling
- Network/server down → informative error to start `ollama serve`.
- Model missing → auto-pull with progress and retries.
- Timeouts → configurable via `timeout_s` in client.

### Example (end-to-end)
1. Extract text from PDF with your extractor to `out.txt`.
2. Analyze with Ollama:
```bash
python3 ollama_integration.py --model llama3.1:8b --file out.txt --deterministic --max-new-tokens 400
```


