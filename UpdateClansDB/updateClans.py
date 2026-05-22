import json
import os

# Update clans DB from input.json (preferred) or fallback to output.json
# Use script directory as base so outputs always land in UpdateClansDB
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'db_clans.json')
INPUT_PATHS = [os.path.join(BASE_DIR, 'input.json'), os.path.join(BASE_DIR, 'output.json')]
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

# Load input (added clans) from first available path
input_data = None
for p in INPUT_PATHS:
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            input_data = json.load(f)
        break

if input_data is None:
    print('No input file found. Expected one of:', INPUT_PATHS)
    input_data = []

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

# Write updated DB to new file in UpdateClansDB
with open(NEW_DB_PATH, 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=4)

print('Processed', len(input_data), 'clans —', len(new_clans), 'new clans detected')
print('All outputs written to', BASE_DIR)
