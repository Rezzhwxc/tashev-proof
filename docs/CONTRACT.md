# Proof Contract Reference

The contract lives at .proof/contract.json.

## Root fields

- schemaVersion: currently 1
- project: display name
- task: the human task being proven
- policy: reserved verification policy configuration
- criteria: ordered evidence criteria

## Common criterion fields

- id: unique stable identifier
- title: human-readable statement that should become true
- type: command, file_exists, file_contains, http or manual
- required: defaults to true
- files: optional glob patterns used by proof run --since
- tags: optional metadata

## command

Runs a project command. Exit code 0 is PROVEN; non-zero or timeout is FAILED.

## file_exists

PROVEN when path exists relative to project root.

## file_contains

PROVEN when a file contains the requested string or regular expression.

## http

Checks response status and optionally body contains / regex.

Headers may reference environment variables with {{env.NAME}}.

## manual

PARTIAL until an attestation exists.

Use:

~~~bash
proof attest criterion-id --note "What was checked" --by "Reviewer"
~~~

The attestation is local runtime evidence and can be revoked.
