# Deviations from submitted documents (SRS / SAD / Test Plan)

Add one row whenever the implementation differs from what the documents say. These are explained during the final demo.

| Date | Issue / Requirement | Document & section | Planned | Actual | Reason | Added by |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-22 | Setup | SAD 3.5 (Repository layer) | Separate repository layer per entity | Folders created; modules may call Mongoose models directly from services where a repository adds nothing | Keeps the codebase small for a 2-sprint project | Nishant |
