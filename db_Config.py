################################################
#            DATABASE Configuration            #
################################################


import csv
import random
import os
import re
from chatbot_csv_handler import load_short_forms, normalize_user_input

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(_BASE_DIR, 'data')
DB_FILE = os.path.join(DATA_DIR, 'chatbot_dataset.csv')
SHORT_QA_FILE = os.path.join(DATA_DIR, 'short_qa.csv')
_dataset = []
_short_forms = {}

def clean_text(text: str) -> str:
    """Cleans text for uniform matching."""
    text = text.lower().strip()
    return re.sub(r'[^\w\s]', '', text)

def init_database():
    """Loads CSV dataset into memory."""
    global _dataset, _short_forms
    _dataset = []
    _short_forms = load_short_forms(SHORT_QA_FILE)
    
    if not os.path.exists(DB_FILE):
        # Create a default dataset file if it doesn't exist
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(DB_FILE, mode='w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['inputs', 'responses'])
            writer.writerow(['hello|hi|good morning', 'hello sir|hi master|good night bro'])
            writer.writerow(['i want to|work|to do', "you can work like|boss let's kill this work|you can start by"])
        print(f"[Database] Created default dataset at {DB_FILE}")

    try:
        with open(DB_FILE, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                inputs = [inp.strip() for inp in row['inputs'].split('|') if inp.strip()]
                responses = [resp.strip() for resp in row['responses'].split('|') if resp.strip()]
                if inputs and responses:
                    _dataset.append({
                        'inputs': inputs,
                        'responses': responses
                    })
        print(f"[Database] Loaded {len(_dataset)} conversation rules from {DB_FILE}")
    except Exception as e:
        print(f"[Database Error] Failed to load dataset: {e}")

def query_local_db(user_input: str) -> str:
    """
    Checks if cleaned user_input matches any trigger phrase in the CSV dataset.
    If matched, returns a random choice from the response list.
    """
    cleaned_input = normalize_user_input(user_input, _short_forms)
    if not cleaned_input:
        return None

    # Try Exact Match first
    for rule in _dataset:
        for pattern in rule['inputs']:
            if cleaned_input == normalize_user_input(pattern, _short_forms):
                return random.choice(rule['responses'])

    # Try Keyword/Phrase boundary match next
    for rule in _dataset:
        for pattern in rule['inputs']:
            cleaned_pattern = normalize_user_input(pattern, _short_forms)
            pattern_regex = r'\b' + re.escape(cleaned_pattern) + r'\b'
            if re.search(pattern_regex, cleaned_input):
                return random.choice(rule['responses'])

    return None
