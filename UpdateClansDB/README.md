# UpdateClansDB

## Purpose

Small README describing how to update the flat-file clan DB from the scoring output.

## Files

- `updateClans.py` — merges `input.json` (preferred) or `output.json` into `db_clans.json` and writes review files (`clansToAdd.json`, `clansToAddReadable.json`, `newClansDB.json`).
- `db_clans.json` — current clan DB (flat JSON array).

## Typical workflow

1. Generate clan scores (scoring script lives in JSONProcessingScripts/CalculateScores):

   Windows (PowerShell/CMD):

   ```powershell
   cd JSONProcessingScripts/CalculateScores
   python processClans.py
   ```

2. Manually copy the scorer output into this folder before running the updater.
   - Run `processClans.py` in `JSONProcessingScripts/CalculateScores`; it should write `input.json` and `output.json` in that folder.
   - Manually copy `input.json` into this folder before running the updater.

   Example (Windows PowerShell):

   ```powershell
   copy ..\JSONProcessingScripts\CalculateScores\input.json .\input.json
   ```

3. Run the updater (runs inside `UpdateClansDB` and writes outputs here):

   ```powershell
   cd UpdateClansDB
   python updateClans.py
   ```

## Outputs produced in this folder

- `clansToAdd.json` — list of unmatched/new clans (for manual review).
- `clansToAddReadable.json` — readable list of `[{TAG}] name` strings for quick review.
- `newClansDB.json` — snapshot of the DB after processing (same format as `db_clans.json`).

## Notes

- `updateClans.py` looks for `input.json` first, then `output.json`.
- If you prefer the updater to consume files from the scoring folder directly, I can change the scripts to write/read from a shared path instead of copying files.

If you want, I can also merge the current `clansToAdd.json` entries into `db_clans.json` automatically.
