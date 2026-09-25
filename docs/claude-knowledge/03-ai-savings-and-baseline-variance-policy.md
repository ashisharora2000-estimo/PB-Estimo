# AI Acceleration & Baseline Variance Policy

## 1. Context & Purpose
Modern Oracle Cloud proposals are increasingly evaluated against:
1. **Traditional Leadership / Industry Baselines** (Historical SI estimates without generative AI).
2. **AI-Accelerated Target Hours** (Effort estimates that leverage modern GenAI, automated test synthesis, code generation, and OIC recipe accelerators).

The tool accepts user-uploaded baseline spreadsheets (`.xlsx` or `.csv`) and computes deterministic variance across hours, person-days, and financials.

---

## 2. Phase-Wise AI Productivity Savings Standard

| Phase | Standard AI Saving % | Key AI Acceleration Levers |
| :--- | :---: | :--- |
| **Enterprise Design / Discovery** | **15% – 20%** | Automated 20-Question scoping synthesis, business requirement parsing, accelerated BPML mapping. |
| **Build & Configuration** | **30% – 35%** | Synthetic configuration scripts, OIC integration recipe generation, automated BIP/OTBI SQL formulation, FBDI pre-validation. |
| **System Integration Testing (SIT)** | **20% – 25%** | Automated test script generation, synthetic test data generation, defect pattern recognition and root cause tagging. |
| **User Acceptance Testing (UAT)** | **5% – 10%** *(Quality Floor)* | Business scenario compilation, test execution logging. **Quality Floor: Never compress UAT by >10%**—business users must validate and sign off manually. |
| **Cutover & Hypercare** | **5% – 10%** *(Quality Floor)* | Automated reconciliation checks, pre-cutover checklist verification. **Cutover requires human-in-the-loop validation.** |

---

## 3. Variance Metrics & Formulas
* **Raw Delta**:
  $$\text{Raw Delta} = \text{PB-Estimo Engine Hours} - \text{Client Baseline Hours}$$
* **Net AI Delta**:
  $$\text{Net AI Delta} = \text{PB-Estimo Engine Hours} - \text{Net AI Baseline Target Hours}$$
* **Variance Classification**:
  * **Favorable (Savings / Optimization)**: Engine is lower than Baseline.
  * **On Track ($\pm 5\%$)**: Engine matches within normal Monte Carlo variance.
  * **Expansion / Scope Risk**: Engine exceeds Baseline due to complex CEMLI, punchout catalogs, or multi-entity topology.

---

## 4. Leadership & SteerCo Defense Briefing Guide
When defending baseline variances to leadership:
* **In Build & SIT**: Emphasize how GenAI accelerators, pre-built OIC recipes, and synthetic testing compress traditional SI delivery effort without sacrificing technical rigor.
* **In UAT & Cutover**: Defend realistic delivery floors. Explain that compressing UAT or cutover below standard thresholds introduces critical operational risk during Go-Live.
