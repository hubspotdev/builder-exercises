# Adding an exercise

1. Copy `templates/exercise/` to `exercises/exNN-short-name/`, using the next free number.
2. In `exercise.json`, set the `id` (`exNN`), a unique `tag` (`EXNN`), the title, time and interfaces. Leave `status` as `draft`.
3. Write the README. Write in second person, keep sentences short, and make every prompt and command copy-paste ready. Keep it to three to six steps; if it needs more, split it into two exercises.
4. Tag every record you create with the exercise tag, and make sure `cleanup.mjs` deletes all of them. Delete dependent objects, such as tasks and notes, before their parents.
5. Mark anything unfinished with `TODO`. Drafts can contain TODOs; published exercises can't.
6. Run `npm run check`, then open a pull request and work through the review checklist in the template.

## Publishing

An exercise can move from `draft` to `published` once every item in the review checklist is ticked. Set `lastVerified` to the date it was last run end to end, and update it whenever the exercise is re-tested. Mark beta interfaces in the `beta` list so the label shows up in the README.

## Keep internal details out

This repo is public. Internal notes, such as personas, launch plans, open questions and verification lists, belong in the team's tracking issue and planning doc, not here.
