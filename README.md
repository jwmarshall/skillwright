# skillwright

**skillwright** authors, reviews, and statically checks portable [Agent Skills](https://agentskills.io/) for Claude Code, Pi, Codex, Gemini CLI, OpenCode, Cursor, and compatible harnesses.

It is deliberately separate from [scopewright](https://github.com/jwmarshall/scopewright): scopewright creates read-only SCOPED reviewers; skillwright manages the broader lifecycle of skills that may inspect, create, modify, validate, or package artifacts.

## Install and use

### Pi

```bash
pi install git:github.com/jwmarshall/skillwright
```

- `/skill:author-agent-skill [capability]` interviews, scaffolds, and writes a portable skill.
- `/skill:review-agent-skill <path>` audits an existing skill against the bundled rubric.

### Claude Code

Install as a plugin, then invoke `author-agent-skill` or `review-agent-skill`.

### Other Agent Skills harnesses

Make this repository's `.agents/skills/` directory available to the project, then invoke `author-agent-skill` or `review-agent-skill`. The resulting portable skill is written to `.agents/skills/<name>/SKILL.md` unless the user selects another supported skill directory.

## Static checker

```bash
npx skillwright .agents/skills/my-skill/SKILL.md
# or from this repository:
npm run lint -- path/to/SKILL.md
```

The checker validates portable metadata and high-confidence structural safety rules. It does not claim to prove behavioral correctness; use `review-agent-skill` and real harness trials for that.

## Design

- `reference/AGENT_SKILL_DESIGN_RUBRIC.md` is the portable, severity-based standard.
- `author-agent-skill` is a write-capable authoring skill. It confirms paths before replacing files and scopes authority to the requested artifact.
- `review-agent-skill` is read-only and returns blockers, compatibility findings, and recommendations.
- `reference/HARNESS_COMPATIBILITY.md` separates portable Agent Skills requirements from adapter-specific capabilities.

## Development

```bash
npm test
npm run lint -- test/fixtures/valid-skill/SKILL.md
```

## License

MIT © Jonathon W. Marshall
