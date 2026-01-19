# Norm AI Command Center - Project Objectives

## Primary Goals

### 1. Decision Tree Visualization
Design an interface for a compliance analyst that visualizes the results of an AI-created compliance analysis on a document. The compliance analysis data is in the form of a **decision tree** that represents the reasoning path the AI used in the analysis.

### 2. Override Functionality
Compliance analysts will sometimes want to override the result of a compliance check based on their own judgment. The interface must incorporate functionality that allows a compliance analyst to:
- Request an override with justification
- Track override status (submitted, pending review)
- Maintain audit trail integrity

### 3. Marketing Team Instruction
Compliance analysts may need to instruct the marketing team on the results of a compliance check. The interface must enable a compliance analyst to:
- Generate actionable instructions for the marketing team
- Communicate specific required changes
- Provide regulatory context for revisions

---

## Design Principles

- Focus on what a **compliance analyst** needs to review
- Visualize AI reasoning as a **decision tree** structure
- Enable **actionable workflows** (override, instruct marketing)
- Maintain **audit trail** for compliance records

---

## Workflow Improvements

### 4. Automated Context Ingestion
Upload with auto-detection eliminates manual PDF download and policy hunting.
- Document type classification
- Matched regulation lookup
- Policy reference linking

### 5. Direct Feedback Bridge
Comments push directly to marketer's view, eliminating double-entry.
- AI-suggested comments (light grey, overwritable)
- Unified handoff modal
- No email summaries needed

### 6. Smart Diff Verification
Compare versions to verify only changes, eliminating full re-read anxiety.
- Version selector (V1 ↔ V2)
- Unchanged text grayed out
- Changes highlighted (green/red)
- Quick approve action

### 7. Document Search
⌘F search with highlighting and navigation.
