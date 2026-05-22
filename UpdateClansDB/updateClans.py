import json
import os

# Update clans DB from input.json and write updated results to output.json
# Use script directory as base so outputs always land in UpdateClansDB
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'db_clans.json')
INPUT_PATH = os.path.join(BASE_DIR, 'input.json')
OUTPUT_PATH = os.path.join(BASE_DIR, 'output.json')
CLANS_TO_ADD = os.path.join(BASE_DIR, 'clansToAdd.json')
CLANS_TO_ADD_READABLE = os.path.join(BASE_DIR, 'clansToAddReadable.json')
NEW_DB_PATH = os.path.join(BASE_DIR, 'newClansDB.json')

# Load existing DB if present
if os.path.exists(DB_PATH):
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        try:
            db = json.load(f)
        except json.decoder.JSONDecodeError:
            db = []
else:
    db = []

# Load input points per clan from input.json
input_data = []
if os.path.exists(INPUT_PATH):
    with open(INPUT_PATH, 'r', encoding='utf-8') as f:
        input_data = json.load(f)
else:
    print('No input file found. Expected:', INPUT_PATH)

if not isinstance(input_data, list):
    raise ValueError(f'Expected {INPUT_PATH} to contain a JSON array of clan objects')

# Helper: find clan in db by clan_tag (primary key)
def find_clan_in_db_by_tag(tag):
    for clan in db:
        # some db entries may use 'clan_tag' or 'tag'
        if 'clan_tag' in clan and clan['clan_tag'] == tag:
            return clan
        if 'tag' in clan and clan['tag'] == tag:
            return clan
    return None

new_clans = []
new_clans_readable = []

for clan_input in input_data:
    tag = clan_input.get('clan_tag') or clan_input.get('tag') or clan_input.get('id')
    if tag is None:
        # fallback: try parsing from name like "[TAG] name"
        raw = clan_input.get('name', '')
        if raw.startswith('['):
            end = raw.find(']')
            if end != -1:
                tag = raw[1:end]

    matched = find_clan_in_db_by_tag(tag) if tag is not None else None
    if matched:
        # Update numeric fields by summing where appropriate
        # Preserve existing fields; add new if missing
        for key in ['swissWins', 'swissLosses', 'winnersWins', 'losersWins', 'points']:
            if key in clan_input:
                matched[key] = matched.get(key, 0) + clan_input.get(key, 0)
        # Update boolean/topCut flags
        if 'topCut' in clan_input and clan_input['topCut']:
            matched['topCut'] = True
        # Update place flags if present
        for fld in ['first', 'second', 'third', 'swissChamp']:
            if clan_input.get(fld):
                matched[fld] = True
    else:
        new_clans.append(clan_input)
        readable = f"[{clan_input.get('clan_tag', tag)}] {clan_input.get('name','') }"
        new_clans_readable.append(readable)

# Write out new clans to add (for manual review)
with open(CLANS_TO_ADD, 'w', encoding='utf-8') as f:
    json.dump(new_clans, f, indent=4)

with open(CLANS_TO_ADD_READABLE, 'w', encoding='utf-8') as f:
    json.dump(new_clans_readable, f, indent=4)

# Write updated DB to output.json in UpdateClansDB
with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=4)

# Keep an optional snapshot if you still want a second DB file
with open(NEW_DB_PATH, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=4)

print('Processed', len(input_data), 'clans —', len(new_clans), 'new clans detected')
print('Wrote updated clan scores to', OUTPUT_PATH)
print('Wrote unmatched clans to', CLANS_TO_ADD, 'and', CLANS_TO_ADD_READABLE)
