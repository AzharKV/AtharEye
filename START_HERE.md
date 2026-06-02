# Athar Eye — Claude Code handoff

You're holding everything Claude Code needs to build the production PWA.

## Steps
1. Create a folder `athar-eye/` and copy these into it:
   - `SPEC.md`              (product/data/design source of truth)
   - `CLAUDE_CODE_BUILD.md` (stack + acceptance criteria + kickoff prompt)
   - `design-source/`       (the approved Claude Design React export — the reference)
2. Open that folder in Claude Code.
3. Paste the kickoff prompt from `CLAUDE_CODE_BUILD.md` §8.
4. Let it scaffold, review its plan, then iterate. Commit per step.
5. Test on the real iPhone (Add to Home Screen + Airplane-mode relaunch) before deploying.

Hosting: Netlify / Vercel / Cloudflare Pages — build `npm run build`, publish `dist/`.
