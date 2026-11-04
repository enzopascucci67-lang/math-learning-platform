# Math Impact supervisor

Run from the Math Impact repository root with Node.js 22 or later. The demo runs offline with Node's standard library. It needs no installation, credentials, or API credits.

```powershell
node tools/supervisor/run.mjs --objective "Produce a demo objective receipt and checklist."
node tools/supervisor/run.mjs --scenario blocker
node tools/supervisor/run.mjs --max-turns 1
```

Enter your objective after `--objective`. The simulated worker records that text verbatim in a fixture receipt. Its actions and verifier are scripted, so arbitrary objectives demonstrate prompt handoff and do not implement real project changes. The default turn limit is three. The supervisor prints each prompt and result and cleans up the temporary workspace at the end.

| Run | Expected behavior | Exit code |
| --- | --- | --- |
| Default | Turn 1 writes a receipt. The supervisor sees the missing checklist and sends a follow-up. Turn 2 writes it, and the supervisor checks both files. | 0 |
| Blocker | Turn 1 requests a checklist-format decision. The supervisor stops and prints the question. | 2 |
| One turn | Turn 1 leaves the checklist missing. The supervisor stops and reports the remaining work. | 3 |
| Error | Invalid arguments, worker failure or timeout, or verifier failure stops the run. | 1 |

## Connecting a real worker

- **Codex Cloud**. The experimental CLI can submit a new task with `codex cloud exec` and read task metadata with `codex cloud list --json`. The installed CLI also exposes `status` and `diff`. These commands lack a documented same-task follow-up and full completed-turn result interface for this loop. A Cloud adapter needs both controls and authenticated access to the repository's Cloud environment. [CLI command reference](https://learn.chatgpt.com/docs/developer-commands?surface=cli#codex-cloud)
- **Managed cloud worker**. OpenAI's Agents API offers a separate hosted Codex harness. With an API project key, a configured isolated sandbox containing the repository, and approval for metered usage, an adapter can create a session, submit input, wait for a terminal turn event, read the output, and reuse the session ID. [Agents API](https://developers.openai.com/api/docs/guides/agents-api/overview) · [API pricing](https://developers.openai.com/api/docs/pricing)
- **Local worker**. The Codex SDK can start a thread, await `thread.run()`, and resume the same thread by ID. This requires an authenticated Codex setup and model access, with usage governed by the account. Run it against an isolated checkout. [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk)

The exported `supervise` function accepts an asynchronous `runTurn(prompt)` adapter and an independent `verify()` callback. The adapter owns the session ID and returns only after the requested turn completes. Normalize approval requests or user decisions to a result with a nonempty `decision` field. Reject failed or interrupted turns and enforce a timeout. Treat worker output as untrusted data and keep actual write, network, and approval controls outside the prompt.

For a real objective, replace the fixture verifier with objective-specific checks of the worker's artifacts, diff, or test results. Return an array of remaining checks, with an empty array only after the objective is verified. Use repository guidance from the chosen checkout and keep the lesson-resume change outside the worker's scope.
