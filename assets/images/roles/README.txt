Put each role's final artwork here as: {role-id}.webp
(the exact ids are the "id" fields in /data/roles.json — e.g. doctor.webp, boss.webp)

Then set that role's "image" field in /data/roles.json to the relative path,
e.g. "image": "assets/images/roles/doctor.webp"

Nothing else needs to change. The card component (css/components/card.css)
renders every role image inside a fixed 4:3 box with cover positioning, so
any real photo — whatever its actual pixel size — drops in without affecting
layout, grid spacing, or any other card.

See the locked Master Artwork Direction for the required look: cinematic
realism, dark noir + modern Italian crime, warm key light + burgundy rim
light, deep but readable shadow, natural texture, subtle grain — no gold,
silver, neon, cyberpunk, fantasy, cartoon, anime, or CGI-plastic look.
