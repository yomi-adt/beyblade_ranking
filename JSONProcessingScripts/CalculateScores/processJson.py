import json

# Open the JSON file and load its content
with open('C:\\Users\\nbarl\\Desktop\\bbx\\beyblade_ranking\\JSONProcessingScripts\\CalculateScores\\input.json', 'r') as file:
    data = json.load(file)

# Match types
swiss = []
de = []

# Players
players = []
idToIndex = {}
currIndex = 0
def getPlayerById(id):
    return players[idToIndex[str(id)]]

# Get player data from JSON obj
playerData = data['included']
for item in playerData:
    # Add player to players array
    # Note: 10 points for entry
    raw_name = item['attributes'].get('name', '')
    #'player_tag': tag if tag is not None else "Not Applicable ERR:679",
    
    players.append(
        {
            'id': item['id'],
            'name': raw_name,
            'swissWins': 0,
            'swissLosses': 0,
            'top16': False,
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

    # Add id to index to dictionary
    idToIndex[item['id']] = currIndex
    currIndex = currIndex+1

# Get match from JSON obj
matchesData = data['data']
isSwiss = True
prevRound = 0
for item in matchesData:
    currMatchData = item['attributes']
    currRound = currMatchData['round']

    # Get firstPlacer id, cast to string, find player by that id
    firstPlacer = getPlayerById(str(item['attributes']['winners']))

    # Get the two participants
    participant1 = getPlayerById(str(item['attributes']['pointsByParticipant'][0]['participantId']))
    participant2 = getPlayerById(str(item['attributes']['pointsByParticipant'][1]['participantId']))

    # Set both winner and loser to make top 16 if not a swiss round
    if not isSwiss:
        participant1 = getPlayerById(str(item['attributes']['pointsByParticipant'][0]['participantId']))
        participant2 = getPlayerById(str(item['attributes']['pointsByParticipant'][1]['participantId']))
        participant1['top16'] = True
        participant2['top16'] = True
    

    if (currRound < prevRound) and (isSwiss):
        isSwiss = False

    if isSwiss:
        swiss.append(item)
        firstPlacer['swissWins'] = firstPlacer['swissWins'] + 1 
        if(participant1 == firstPlacer):
            # print(firstPlacer['name'] + " Won. Adding swiss loss to " + participant2['name'])
            participant2['swissLosses'] = participant2['swissLosses'] + 1
        else:
            # print(firstPlacer['name'] + " Won. Adding swiss loss to " + participant1['name'])
            participant1['swissLosses'] = participant1['swissLosses'] + 1
    elif currRound < 0: # If negative means secondPlacer bracket
        de.append(item)
        firstPlacer['top16'] = True
        firstPlacer['losersWins'] = firstPlacer['losersWins'] + 1
    else:
        de.append(item)
        firstPlacer['top16'] = True
        firstPlacer['winnersWins'] = firstPlacer['winnersWins'] + 1

    prevRound = currRound

# Determine first and second place
finalsGame = de[-1]
winnersParticipants = {
    'player1': getPlayerById(finalsGame['attributes']['pointsByParticipant'][0]['participantId']),
    'player2': getPlayerById(finalsGame['attributes']['pointsByParticipant'][1]['participantId']),
}
firstPlacer = winnersParticipants['player1']
secondPlacer = winnersParticipants['player2']
if(int(finalsGame['attributes']['winners']) != int(firstPlacer['id'])):
    firstPlacer = winnersParticipants['player2']
    secondPlacer = winnersParticipants['player1']

# Determine third place
finalsGame = de[-2]
if(len(de)==31):
    finalsGame = de[-3]
winnersParticipants = {
    'player1': getPlayerById(finalsGame['attributes']['pointsByParticipant'][0]['participantId']),
    'player2': getPlayerById(finalsGame['attributes']['pointsByParticipant'][1]['participantId']),
}
thirdPlacer = winnersParticipants['player1']
if(int(finalsGame['attributes']['winners']) == int(thirdPlacer['id'])):
    thirdPlacer = winnersParticipants['player2']

getPlayerById(firstPlacer['id'])['first'] = True
getPlayerById(secondPlacer['id'])['second'] = True
getPlayerById(thirdPlacer['id'])['third'] = True

# Combine by name, since there's two participant entries for first stage/second stage
aggregated_players = {}
for player in players:
    tag = player['name']
    if tag not in aggregated_players:
        aggregated_players[tag] = player
    else:
        player['points'] -= 10 # Account for double dipping entry points

        aggregated = aggregated_players[tag]
        aggregated['swissWins'] += player['swissWins']
        aggregated['swissLosses'] += player['swissLosses']
        aggregated['winnersWins'] += player['winnersWins']
        aggregated['losersWins'] += player['losersWins']
        aggregated['points'] += player['points']
        aggregated['top16'] = aggregated['top16'] or player['top16']
        aggregated['swissChamp'] = aggregated['swissChamp'] or player['swissChamp']
        aggregated['first'] = aggregated['first'] or player['first']
        aggregated['second'] = aggregated['second'] or player['second']
        aggregated['third'] = aggregated['third'] or player['third']

   # Update first/second/third placer id so that it can be found
    # with getById
    if(player['first'] == True or player['second'] == True or player['third'] == True):
        aggregated['id'] = player['id']

players = list(aggregated_players.values())

for player in players:
    data = player

    # Made top 16
    if(data['top16']):
        data['points'] = data['points'] + 10
    # Swiss king
    if(int(data['swissLosses'])==0):
        data['swissChamp'] = True
        data['points'] = data['points'] + 20
    # First place
    if(data['first']):
        data['points'] = data['points'] + 50
    # Second place
    if(data['second']):
        data['points'] = data['points'] + 30
    # Third place
    if(data['third']):
        data['points'] = data['points'] + 20

    data['points'] = data['points'] + (data['swissWins']*5)
    data['points'] = data['points'] + (data['winnersWins']*10)
    data['points'] = data['points'] + (data['losersWins']*5)

# Write JSON data to a file
with open('C:\\Users\\nbarl\\Desktop\\bbx\\beyblade_ranking\\JSONProcessingScripts\\CalculateScores\\output.json', 'w') as file:
    json.dump(players, file, indent=4)  # 'indent' makes the output more readable