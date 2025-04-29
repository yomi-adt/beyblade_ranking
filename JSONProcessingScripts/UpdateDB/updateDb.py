import json

# Open the JSON file and load its content
with open('input.json', 'r') as file:
    input = json.load(file)

# Open db json file and update
with open('db.json', 'r') as file:
    db = json.load(file)


for player in input:
    print(player)
    print(player.name)
# Write JSON input to a file
with open('db.json', 'w') as file:
    json.dump(db, file, indent=4)  # 'indent' makes the output more readable