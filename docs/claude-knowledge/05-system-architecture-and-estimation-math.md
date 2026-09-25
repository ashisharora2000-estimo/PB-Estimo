# System Architecture, Estimation Math & Heuristics

## 1. Estimation Mathematical Model
The PB-Estimo engine calculates effort using a combination of parametric scoping questions, scale topology drivers, and Monte Carlo-inspired P50/P80 confidence models.

### Step 1: Base Module Effort
Each Oracle Fusion module begins with an established industry baseline:
$$\text{Base Hours} = \text{Module Benchmark Hours} \times \text{20-Q Scoping Multiplier}$$

* The **20-Question Functional Scoping Matrix** evaluates 20 key parameters for each module (such as multi-currency, intercompany, approval tiers, subledger accounting rules, compliance requirements).
* Sizing categories:
  * **XS (Extra Small)**: ~60–120 hours
  * **S (Small)**: ~150–250 hours
  * **M (Medium)**: ~300–450 hours
  * **L (Large)**: ~500–750 hours
  * **XL (Extra Large)**: ~800–1,200 hours
  * **XXL (Complex Global Enterprise)**: >1,200 hours

### Step 2: Scale Topology & Technical Drivers
Technical effort is added deterministically based on scale drivers:
* **Integrations (OIC / Web Services)**:
  * Simple Interface: ~40 hours
  * Medium Interface (bi-directional with transformation): ~90 hours
  * Complex Interface (orchestration, ERP adapter, real-time): ~160 hours
* **Reports (OTBI / BI Publisher)**:
  * Standard OTBI Analysis: ~16 hours
  * Complex BIP Financial / Operational Layout: ~48 hours
* **Data Conversions (FBDI / HDL)**:
  * Standard Object (Customers, Vendors, Items): ~60 hours per object
  * Complex Transactional Object (Open AP, Open AR, GL Balances): ~110 hours per object
  * Mock conversion multiplier: Scales linearly across Mocks 1, 2, 3, and Cutover.

### Step 3: Program Modifiers & Environmental Friction
The aggregated functional and technical effort is adjusted by 7 enterprise modifiers:
1. `Client Decision Velocity`: Measures SLA speed for design approvals ($0.9\times - 1.3\times$).
2. `Legacy Landscape Complexity`: Modern SaaS vs. heavily customized legacy mainframe/on-prem ERP ($1.0\times - 1.25\times$).
3. `Data Quality & Hygiene`: Clean source data vs. dirty/unreconciled data requiring cleansing ($1.0\times - 1.3\times$).
4. `Testing Automation Readiness`: Manual vs. automated regression testing tooling ($0.85\times - 1.1\times$).
5. `Security & Compliance Rigor`: Standard vs. SOX/ITAR/FedRAMP requirements ($1.0\times - 1.2\times$).
6. `Skill Level of Client Core Team`: Experienced Oracle team vs. first-time cloud adoption ($0.9\times - 1.2\times$).
7. `Geographic & Multi-Entity Dispersion`: Single country vs. multi-national global template rollout ($1.0\times - 1.35\times$).

---

## 2. Statistical Confidence Levels (P50 vs. P80)
* **P50 (Median Baseline)**: Represents expected delivery effort under nominal conditions (50% probability of delivery within budget).
* **P80 (Target Commercial Commitment)**: Represents the 80th percentile risk-weighted effort, incorporating Monte Carlo contingency for unforeseen delivery friction, design churn, and integration latency.
* **Management Reserve / Contingency**:
  $$\text{Contingency} = \text{P80 Target Hours} - \text{P50 Base Hours}$$
