import json

# Open the JSON file and load its content
#with open('input.json', 'r') as file:
#    input = json.load(file)


# Open db json file and update
with open('db.json', 'r', encoding="utf-8") as file:
    db = json.load(file)


for player in db:
    player['points'] = 0

# Write JSON input to a file
with open('newDB.json', 'w') as file:
   json.dump(db, file, indent=4)  # 'indent' makes the output more readable

