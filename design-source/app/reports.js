/* OptiSync — report prose. Faithful summaries for current states (Reports A–E),
   stage templates for scrubbed intermediate points. */
(function () {
  var O = window.OPTISYNC;

  // Per-project current-state prose (from OPTISYNC_DEEP_REPORTS.md)
  var CURRENT = {
    'proj-stirling': {
      summary: "28% of the BIM model verified against site. Strip-out and structural / ceiling repairs are complete; first-fix electrical and plumbing are live. The flat is a shell — this report establishes the baseline and the early risk register before plastering. The value here is catching structural issues while they're cheap to fix.",
      next: ['Renew lintel (ST-03) before plastering can proceed.', 'Treat gable damp and re-scan bathroom (ST-01).', 'Upgrade consumer unit to suit new circuit count (ST-02).', 'Book plastering once first fix signed off; target next scan ~45%.']
    },
    'proj-morningside': {
      summary: "62% verified. First fix and plastering are complete across all eight zones; the project is now in second fix, kitchen and bathroom fit, and early decoration. Coverage is climbing steadily and on programme for a September handover. Three live issues need attention before they reach the decoration stage — one is a regs-critical flue clearance.",
      next: ['Resolve flue clearance (MO-01) — regs hold before sign-off.', 'Re-set kitchen socket bank to BIM position and re-scan (MO-03).', 'Strip and re-lay lippage tiles in en-suite (MO-02).', 'Second coat to Bedroom 3, then proceed to flooring; target next scan ~72%.']
    },
    'proj-leith': {
      summary: "100% verified against the as-built model. All trades complete, all snags closed, flat handed over to Shoreline Lettings on 30 May 2026. This report is the handover artifact: full coverage, a cleared snag list, and the as-built BIM delivered alongside.",
      next: ['Project closed. As-built model + report issued to client.', 'Retain scan set as the baseline for any future works or warranty claims.']
    },
    'proj-hyndland': {
      summary: "74% verified. Second fix is largely complete and decoration is underway, but the latest scan flags a partition wall built 220 mm off the BIM position on the kitchen / hall line — a real deviation under review before it is built around. Status is held at Needs review until the partition is resolved.",
      next: ['Confirm partition position vs BIM and agree remedial (HY-01).', 'Re-route extract duct to clear the BIM clash (HY-02).', 'Make good skirting mitre in living room (HY-03).', 'Re-scan kitchen / hall once partition resolved.']
    },
    'proj-marischal': {
      summary: "91% verified. The Cat-B fit-out is substantially complete — open-plan furniture is in and commissioning is under way. Reception joinery and HVAC commissioning are the remaining items before sign-off.",
      next: ['Complete HVAC commissioning (MA-01).', 'Fit reception counter on delivery (MA-02).', 'Final scan to 100% for handover.']
    },
    'proj-cityquay': {
      summary: "82% verified. The warehouse conversion is well advanced — slab, cladding and roller doors are in. A fire-stopping gap at a mezzanine service penetration and an office-pod partition deviation hold the status at Needs review.",
      next: ['Close fire-stopping gap at mezzanine penetration (CQ-01).', 'Resolve office-pod partition deviation vs BIM (CQ-02).', 'Complete welfare-block second fix; re-scan affected zones.']
    }
  };

  // Stage templates for scrubbed intermediate snapshots
  function template(project, cov, stageLabel) {
    var n = project.short;
    if (cov === 0) return { summary: "Baseline scan logged against the BIM model — 0% built. This is the as-found / pre-start reference every future scan is measured against.", next: ['Begin works; first progress scan after strip-out.'] };
    if (cov < 15) return { summary: cov + "% verified. Strip-out is essentially complete — " + n + " is back to a shell. The baseline is locked against the BIM and the early risk register is set before any new work goes back in.", next: ['Confirm structural scope before first fix.', 'Begin first-fix electrical + plumbing; target next scan ~28%.'] };
    if (cov < 40) return { summary: cov + "% verified. First fix is progressing and the structural picture is confirmed against the model. Coverage is intentionally low; the value at this stage is catching what's behind the walls before plastering.", next: ['Complete first fix and sign off.', 'Book plastering; target next scan ~50%.'] };
    if (cov < 80) return { summary: cov + "% verified. First fix and plastering are done; the project is into second fix and early fit. Coverage is climbing steadily on programme — live issues are flagged before they reach decoration.", next: ['Clear open issues ahead of decoration.', 'Proceed to flooring; book next scan.'] };
    if (cov < 100) return { summary: cov + "% verified. The site is visually finished and in the snagging window. A short defect list is open and clearing ahead of handover — this report proves the last stretch is controlled, not guesswork.", next: ['Clear the open snags.', 'Final as-built scan to 100%; issue handover report.'] };
    return { summary: "100% verified against the as-built model. All trades complete, all snags closed. This is the handover artifact: full coverage, a cleared snag list, and the as-built BIM delivered alongside.", next: ['Project closed. As-built model + report issued to client.', 'Retain scan set as baseline for warranty / future works.'] };
  }

  O.reportProse = function (project, cov, isCurrent) {
    var stageLabel = O.stageFor(cov);
    if (isCurrent && CURRENT[project.id]) {
      var c = CURRENT[project.id];
      return { stageLabel: project.stage, summary: c.summary, next: c.next };
    }
    var t = template(project, cov, stageLabel);
    return { stageLabel: stageLabel, summary: t.summary, next: t.next };
  };

  // Compute a full report-state for a project at a given coverage (for scrubber + report)
  O.stateAt = function (project, cov) {
    var ratio = project.coverage ? cov / project.coverage : 0;
    var zones = project.zones.map(function (z) {
      return { name: z.name, area: z.area, note: z.note, coverage: Math.max(0, Math.min(100, Math.round(z.coverage * ratio))) };
    });
    // issues open at this coverage
    var open = project.issues.filter(function (it) {
      return it.appearAt <= cov && (it.clearAt == null || cov < it.clearAt);
    });
    var closedCount = project.issues.filter(function (it) {
      return it.clearAt != null && cov >= it.clearAt;
    }).length;
    // captures by stage band (unless commercial)
    var captures = [];
    if (!project.noPhotos) {
      var isCurrent = cov === project.coverage;
      if (isCurrent && project.lightShots) captures = project.lightShots;
      else captures = O.pool(O.bandFor(cov));
    }
    return { coverage: cov, zones: zones, open: open, closedCount: closedCount, captures: captures };
  };
})();
