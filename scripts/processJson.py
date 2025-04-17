import json

# Open the JSON file and load its content
with open('matches.json', 'r') as file:
    data = json.load(file)

# Match types
swiss = []
de = []

# Get data from JSON obj
matchesData = data['data']
isSwiss = True
prevRound = 0
for item in matchesData:
    currMatchData = item['attributes']
    currRound = currMatchData['round']

    print(currRound, " vs prev: ", prevRound)
    if (currRound < prevRound) and (isSwiss):
        isSwiss = False
        print('Switching to de')

    if isSwiss:
        swiss.append(item)
    else:
        de.append(item)

    prevRound = currRound

# print("Swiss")
# print(swiss)
# print("DE")
# print(de)



