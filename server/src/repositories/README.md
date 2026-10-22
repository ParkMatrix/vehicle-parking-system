# repositories

SAD 3.5 layering: Routes -> **Controllers** (HTTP in/out) -> **Services** (business rules) -> **Repositories** (MongoDB access) -> Models.

Name files after your module so nobody edits the same file:
`auth.repository.js` (Nishant), `vehicle.*.js` (Preksha), `slot.*.js` (Siddesh), `parking.*.js` (Salasha).
