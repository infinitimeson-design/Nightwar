Put each scenario's cover artwork here as: {scenario-id}/cover.webp
(the id is the "id" field in /data/scenarios.json — e.g. night-war/cover.webp)

Then set that scenario's "cover" field in /data/scenarios.json to the
relative path, e.g. "cover": "assets/images/scenarios/night-war/cover.webp"

Same rule as roles: the card renders inside a fixed-aspect-ratio box with
cover positioning, so dropping in a real photo never touches layout code.
