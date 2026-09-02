# Oracle Cloud Project Planning Engine Instructions

## Standard Methodology & Execution Directives

The AI assistant and application engines MUST strictly follow the **Oracle Cloud Project Plan Generation Standard (v1.0)** specified in `/oracle-project-plan-standard.yaml` for all project plan generation, WBS expansion, and Smartsheet integrations.

### Operating Principles & Non-Negotiables:
1. **Methodology Determines Structure**:
   - **Wave 0 (Mandatory)**: Mobilize (`TEAM MOBILIZATION (CORE)`, `KICK-OFF ACTIVITIES`, `BUSINESS ONBOARDING`) & Enterprise Design (`FOUNDATION DESIGN`, `WORKSTREAM DESIGN`, `RE-BASELINE PROJECT`).
   - **Post-ED Waves (Waves 1–5)**: Detailed Design, Build, SIT, UAT, Deploy (Cutover, Hypercare, Transition to Run).
   - Never remove mandatory phases or stage gates.
2. **Deterministic Scheduling & Dates**:
   - Program start dates must always normalize to Monday.
   - Default sub-phase allocations: Wave 0 (Workstream Design ~50%), Post-ED Waves (Detailed Design 11%, Build 50%, SIT 21%, UAT 21%, Cutover/Deploy 7%, Hypercare 21%, Transition 9%).
   - Dates, durations, calendars, hierarchy, and predecessors MUST be calculated deterministically.
3. **Scope Expansion**:
   - **Functional Modules**: Expanded deterministically (`Module -> Process Area -> Epic -> Activity`).
   - **Technical Components**:
     - *Integrations*: Design, Build, Testing, Deployment
     - *Reports*: Design, Development, Testing, Deployment
     - *Conversions*: Mapping, Extraction, Transformation, Loading, Reconciliation
     - *Extensions*: Design, Development, Testing, Deployment
     - *Localizations*: Assessment, Design, Configuration, Testing, Deployment
4. **Smartsheet Output Specification**:
   - When generating or synchronizing Smartsheet sheets, generate all **30 columns in exact order**:
     1. `Task Name`
     2. `ASSIGNED TO ROLE`
     3. `Status`
     4. `Start Date`
     5. `End Date`
     6. `Task Progress`
     7. `Predecessors`
     8. `Duration`
     9. `Type`
     10. `Workstream`
     11. `Comments`
     12. `Allocation`
     13. `LEVEL-ID`
     14. `Complete`
     15. `TASK_NUMBER`
     16. `CATEGORY`
     17. `WBS-ID`
     18. `TEMPLATE-ID`
     19. `Parent WBS ID`
     20. `Wave`
     21. `Phase`
     22. `Sub-Phase`
     23. `Domain`
     24. `Module Code`
     25. `Module Name`
     26. `Component ID`
     27. `Component Name`
     28. `Schedule Method`
     29. `Anomaly Flag`
     30. `Anomaly Reason`
5. **No Invented Tasks**:
   - Do not invent non-standard activities outside the approved WBS library.
   - Do not omit mandatory cross-workstreams: `GOVERNANCE`, `PMO`, `ARCHITECTURE`, `SECURITY`, `TESTING`, `DATA`, `OCM`, `TRAINING`, `DEPLOYMENT`, `HYPERCARE`, `TRANSITION`.
