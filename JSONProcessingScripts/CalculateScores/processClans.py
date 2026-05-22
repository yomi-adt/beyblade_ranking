import json

# Open the JSON file and load its content
with open('input.json', 'r') as file:
    data = json.load(file)

# Match types
swiss = []
de = []

# Clans
clans = []
idToIndex = {}
currIndex = 0

def getClanById(id):
    return clans[idToIndex[str(id)]]

def parse_clan_name(raw_name):
    # Expected format: "[CLAN_TAG] clan_name"
    if not raw_name:
        return (None, raw_name)
    raw_name = raw_name.strip()
    if raw_name.startswith('['):
        end = raw_name.find(']')
        if end != -1:
            tag = raw_name[1:end]
            name = raw_name[end+1:].strip()
            return (tag, name)
    return (None, raw_name)

# Get clan data from JSON obj
clanData = data.get('included', [])
for item in clanData:
    raw_name = item['attributes'].get('name', '')
    tag, clan_name = parse_clan_name(raw_name)

    clans.append(
        {
            'id': item['id'],
            'clan_tag': tag if tag is not None else str(item['id']),
            'name': clan_name,
            'swissWins': 0,
            'swissLosses': 0,
            'topCut': False,
            'winnersWins': 0,
            'losersWins': 0,
            'swissChamp': False,
            'first': False,
            'second': False,
            'third': False,
            'points': 10,
            'rank': -1,
        }
    )

    # Add id to index map
    idToIndex[item['id']] = currIndex
    currIndex += 1

# Process matches
matchesData = data.get('data', [])
isSwiss = True
prevRound = 0
for item in matchesData:
    currMatchData = item['attributes']
    currRound = currMatchData.get('round', 0)

    # Get winner
    firstPlacer = getClanById(str(item['attributes']['winner_id']))

    # Get participants
    participant1 = getClanById(str(item['attributes']['points_by_participant'][0]['participant_id']))
    participant2 = getClanById(str(item['attributes']['points_by_participant'][1]['participant_id']))

    # Set top cut flag when leaving swiss
    if not isSwiss:
        participant1['topCut'] = True
        participant2['topCut'] = True

    if (currRound < prevRound) and (isSwiss):
        isSwiss = False

    if isSwiss:
        swiss.append(item)
        firstPlacer['swissWins'] += 1
        if participant1 == firstPlacer:
            participant2['swissLosses'] += 1
        else:
            participant1['swissLosses'] += 1
    elif currRound < 0:  # losers bracket
        de.append(item)
        firstPlacer['topCut'] = True
        firstPlacer['losersWins'] += 1
    else:
        de.append(item)
        firstPlacer['topCut'] = True
        firstPlacer['winnersWins'] += 1

    prevRound = currRound

# Determine first and second place
if de:
    finalsGame = de[-1]
    winnersParticipants = {
        'player1': getClanById(finalsGame['attributes']['points_by_participant'][0]['participant_id']),
        'player2': getClanById(finalsGame['attributes']['points_by_participant'][1]['participant_id']),
    }
    firstPlacer = winnersParticipants['player1']
    secondPlacer = winnersParticipants['player2']
    if int(finalsGame['attributes']['winner_id']) != int(firstPlacer['id']):
        firstPlacer = winnersParticipants['player2']
        secondPlacer = winnersParticipants['player1']

    # Determine third place
    finalsGame = de[-2]
    if len(de) == 31:
        finalsGame = de[-3]
    winnersParticipants = {
        'player1': getClanById(finalsGame['attributes']['points_by_participant'][0]['participant_id']),
        'player2': getClanById(finalsGame['attributes']['points_by_participant'][1]['participant_id']),
    }
    thirdPlacer = winnersParticipants['player1']
    if int(finalsGame['attributes']['winner_id']) == int(thirdPlacer['id']):
        thirdPlacer = winnersParticipants['player2']

    getClanById(firstPlacer['id'])['first'] = True
    getClanById(secondPlacer['id'])['second'] = True
    getClanById(thirdPlacer['id'])['third'] = True

# Apply scoring rules for clans
for clan in clans:
    data = clan

    # Made top cut
    if data['topCut']:
        data['points'] += 10
    # Swiss king (no swiss losses)
    if int(data['swissLosses']) == 0:
        data['swissChamp'] = True
        data['points'] += 20
    # First place
    if data['first']:
        data['points'] += 50
    # Second place
    if data['second']:
        data['points'] += 30
    # Third place
    if data['third']:
        data['points'] += 20

    # Group stage wins: 10 points each
    data['points'] += (data['swissWins'] * 10)
    # Top cut wins: 10 points each (winners and losers bracket wins)
    data['points'] += (data['winnersWins'] * 10)
    data['points'] += (data['losersWins'] * 10)

# Write JSON data to a file
with open('output_clans.json', 'w') as file:
    json.dump(clans, file, indent=4)

# Also emit an "added" file to mirror the players workflow so the
# updater can prioritize a reviewed-added feed. By default this is
# a copy of the scoring output; the DB updater can still detect
# truly new clans and write `clansToAdd.json` for manual review.
with open('addedClans.json', 'w') as file:
    json.dump(clans, file, indent=4)

print('Wrote output_clans.json and addedClans.json with', len(clans), 'clans')
