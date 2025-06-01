import json

# Open the JSON file and load its content
#with open('input.json', 'r') as file:
#    input = json.load(file)


# Open db json file and update
with open('db.json', 'r', encoding="utf-8") as file:
    db = json.load(file)


#for player in db:
    #print(player)

##print(db[1]['swissWins'] += d)
# for player in input:
#     print(player)
#     print(player.name)

with open('input.json', 'r', encoding="utf-8") as file:
    input = json.load(file)



newPlayers = [] # List of new players not in db
for playerInput in input:
    inDB = False
    for playerDB in db:
        if (playerInput['name'] == playerDB['name']):   # in the future check by id instead of name
            playerDB['swissWins'] = playerDB['swissWins'] + playerInput['swissWins'] # Add swissWins and points to db listing
            playerDB['points'] = playerDB['points'] + playerInput['points']
            inDB = True
        elif ('blader_name' in playerDB and playerInput['name'] == playerDB['blader_name']):
            playerDB['swissWins'] = playerDB['swissWins'] + playerInput['swissWins'] # Add swissWins and points to db listing
            playerDB['points'] = playerDB['points'] + playerInput['points']
            inDB = True  
    if (inDB == False):
        newPlayers.append(playerInput)

with open('playersToAdd.json', 'w') as file:
    json.dump(newPlayers, file, indent=4)  # 'indent' makes the output more readable



# Write JSON input to a file
with open('newDB.json', 'w') as file:
   json.dump(db, file, indent=4)  # 'indent' makes the output more readable

