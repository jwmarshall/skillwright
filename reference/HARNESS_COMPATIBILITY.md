# Harness compatibility contract

Skillwright authors a portable Agent Skills baseline first. A generated `SKILL.md` uses only `name`, `description`, and optional portable metadata such as `license`. It must not depend on a proprietary permission field to describe its safety boundaries.

| Harness | Portable skill surface | Native extension concern |
| --- | --- | --- |
| Claude Code | Plugin/project skills | Plugin install location and optional tool controls |
| Pi | Package `skills/pi/` and Agent Skills | No native subagent format; authority is prompt/tool-session dependent |
| Codex | `.agents/skills/<name>/SKILL.md` | Subagents and sandbox controls are separate from skill metadata |
| Gemini CLI | `.agents/skills/<name>/SKILL.md` | Subagents/tool allowlists are separate native configuration |
| OpenCode | `.agents/skills/<name>/SKILL.md` | Agents and permissions are separate native configuration |
| Cursor | `.agents/skills/<name>/SKILL.md` | Subagents and `readonly` are separate native configuration |

## Authoring rule

A portable skill states the least authority it needs in prose: what it may read, write, execute, or send; the path or system boundary; and when confirmation is required. Add harness-specific controls only in a separately selected adapter, and never represent them as portable frontmatter.

## Invocation rule

A skill may be explicitly invoked by a user, selected by an agent from its description, or used as part of a supported harness workflow. Do not rely on autonomous selection for safety-critical or destructive work: require an explicit confirmation checkpoint in the body.
