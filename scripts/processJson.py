import json

# Open the JSON file and load its content
with open('matches.json', 'r') as file:
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
    players.append(
        {
            'id': item['id'],
            'data': {
                'name': item['attributes']['name'],
                'swissWins': 0,
                'top16': False,
                'winnersWins': 0,
                'losersWins': 0,
                'first': False,
                'second': False,
                'third': False

            },
        }
    )

    # Add id to index to dictionary
    idToIndex[item['id']] = currIndex
    currIndex = currIndex+1

# print(idToIndex)
# print(idToIndex['259854977'])
# print(getPlayerById('259854977'))

# Get match from JSON obj
matchesData = data['data']
isSwiss = True
prevRound = 0
for item in matchesData:
    currMatchData = item['attributes']
    currRound = currMatchData['round']

    # Get firstPlacer id, cast to string, find player by that id
    firstPlacer = getPlayerById(str(item['attributes']['winner_id']))

    if (currRound < prevRound) and (isSwiss):
        isSwiss = False

    if isSwiss:
        swiss.append(item)
        firstPlacer['data']['swissWins'] = firstPlacer['data']['swissWins'] + 1 
    elif currRound < 0: # If negative means secondPlacer bracket
        de.append(item)
        firstPlacer['data']['top16'] = True
        firstPlacer['data']['losersWins'] = firstPlacer['data']['losersWins'] + 1
    else:
        de.append(item)
        firstPlacer['data']['top16'] = True
        firstPlacer['data']['winnersWins'] = firstPlacer['data']['winnersWins'] + 1

    prevRound = currRound

# print("Swiss")
# print(swiss)
# print("DE")
# print(de)

# print(getPlayerById(de[-1]['attributes']['points_by_participant'][0]['participant_id']), " vs ", getPlayerById(de[-1]['attributes']['points_by_participant'][1]['participant_id']))
# print(getPlayerById(de[-2]['attributes']['points_by_participant'][0]['participant_id']), " vs ", getPlayerById(de[-2]['attributes']['points_by_participant'][1]['participant_id']))

# Determine first and second place
finalsGame = de[-1]
winnersParticipants = {
    'player1': getPlayerById(finalsGame['attributes']['points_by_participant'][0]['participant_id']),
    'player2': getPlayerById(finalsGame['attributes']['points_by_participant'][1]['participant_id']),
}
firstPlacer = winnersParticipants['player1']
secondPlacer = winnersParticipants['player2']
if(int(finalsGame['attributes']['winner_id']) != int(firstPlacer['id'])):
    firstPlacer = winnersParticipants['player2']
    secondPlacer = winnersParticipants['player1']

# Determine third place
finalsGame = de[-2]
winnersParticipants = {
    'player1': getPlayerById(finalsGame['attributes']['points_by_participant'][0]['participant_id']),
    'player2': getPlayerById(finalsGame['attributes']['points_by_participant'][1]['participant_id']),
}
thirdPlacer = winnersParticipants['player1']
if(int(finalsGame['attributes']['winner_id']) == int(thirdPlacer['id'])):
    thirdPlacer = winnersParticipants['player2']

getPlayerById(firstPlacer['id'])['data']['first'] = True
getPlayerById(secondPlacer['id'])['data']['second'] = True
getPlayerById(thirdPlacer['id'])['data']['third'] = True
for player in players:
    print(player)
