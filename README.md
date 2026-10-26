# HubSpot builder exercises

Hands-on exercises that take you from zero to a working result on HubSpot in about 10 minutes. Each one does a real job, leaves you with something you can reuse, and cleans up after itself.

## Exercises

| Exercise | Time | Interfaces | Status |
| --- | --- | --- | --- |
| [Same job, three interfaces: follow up on stalled deals](exercises/ex01-same-job-three-interfaces) | 10 min | MCP, Agent CLI (beta), APIs | Draft |

## Before you start

Every exercise runs against a free [HubSpot developer test account](https://developers.hubspot.com/). Never use a production account: exercises create and delete records.

Exercises that run scripts need Node.js 18 or later and a service key for your test account:

```
git clone https://github.com/hubspotdev/builder-exercises.git
cd builder-exercises
export HUBSPOT_TOKEN=your-service-key
```

There's nothing to install: the scripts use Node's built-in `fetch`. Each exercise's README lists the exact tools and scopes it needs.

## How exercises are organized

```
exercises/
  ex01-same-job-three-interfaces/
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
