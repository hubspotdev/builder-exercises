# HubSpot builder exercises

Hands-on exercises that take you from zero to a working result on HubSpot in about 10 minutes. Each one does a real job, leaves you with something you can reuse, and cleans up after itself.

## Exercises

| Exercise | Time | Interfaces | Status |
| --- | --- | --- | --- |
| [One job, three tools: following up on stalled deals](exercises/ex01-one-job-three-tools) | 10–12 min | MCP, Agent CLI, APIs, Cowork | Draft |

## Before you start

Every exercise runs against a free [HubSpot developer test account](https://developers.hubspot.com/). Never use a production account: exercises create and delete records.

Each exercise's README lists exactly what it needs. Depending on the exercise, that might include Claude with the HubSpot connector, Agent CLI, Node.js with a service key, or a Cowork plan. The scripts use Node's built-in `fetch`, so there's nothing extra to install beyond what each exercise specifies.

To clone the repo:

```
git clone https://github.com/hubspotdev/builder-exercises.git
```

## How exercises are organized

```
exercises/
  ex01-one-job-three-tools/
    README.md       the exercise itself: setup, steps, clean up, keep going
    exercise.json   title, time, interfaces, status and last-verified date
    seed.mjs        creates the sample records
    cleanup.mjs     deletes everything the exercise created
    ...             any other scripts the steps use
shared/
  hubspot.mjs       small API helper every exercise uses
templates/
  exercise/         copy this to start a new exercise
```

Every record an exercise creates starts with that exercise's tag (for example `EX01`), so `cleanup.mjs` removes only what the exercise made.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
