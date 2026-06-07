import json

with open(r'C:\Users\User\.gemini\antigravity-ide\brain\3293813d-5d46-475f-9d8d-ffbd920e68ba\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        obj = json.loads(line)
        if 'capture_browser_console_logs' in str(obj) or 'console' in str(obj):
            print("--- STEP ---")
            print(json.dumps(obj, indent=2)[:2000])
