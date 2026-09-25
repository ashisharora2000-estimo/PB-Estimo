# Commercial Governance, Staffing Pyramids & Delegation of Authority (DoA)

## 1. Commercial Pricing Model
* **Standard Blended Cost Rate**: Default at **$145 / billable hour** (or ~$1,160 / 8-hour person-day).
* **Delivery Model**: Global Blended Delivery standard:
  * **Onsite (30%)**: Solution Architects, Lead Functional Consultants, PMO/Change leads, UAT coordinators. Focuses on client-facing workshops, executive alignment, and testing facilitation.
  * **Offshore (70%)**: Senior/Junior Developers, Configuration Specialists, Data Conversion engineers, Integration coders, Automation testers. Focuses on configuration, CEMLI development, and mock loads.

---

## 2. Resource Ramp-Down Engine Logic
Resource ramp-down is an automated delivery policy that ensures the commercial model reflects reality:
* **Build Phase**: Peak staffing (100% capacity). Full technical and functional footprint engaged in configuration, OIC interface development, and report build.
* **SIT Phase**: 15%–25% ramp-down from Build peak. Core functional and integration leads remain for defect triaging; configuration specialists roll off.
* **UAT Phase**: 40%–50% ramp-down from Build peak. Primarily business analysts, lead architects, and SME advisors to support business acceptance and defect verification.
* **Cutover / Deployment**: Specialized cutover strike-team (Data lead, Technical architect, PMO lead).
* **Hypercare / Transition**: Dedicated hypercare stabilization team (Lead functional, integration lead, support specialists).

---

## 3. Delegation of Authority (DoA) Tiers & Risk Triggers

| Tier | Approver | Conditions & Criteria |
| :--- | :--- | :--- |
| **Tier 1 (Green)** | Practice Lead / Solution Principal | • Gross Margin $\ge 38\%$<br>• Standard Duration ($\ge 32$ weeks for $>8$ modules)<br>• CEMLI count within normal bounds ($<12$ OIC, $<3$ PaaS)<br>• Clean module sizing with no downsized overrides |
| **Tier 2 (Amber)** | Vice President / Solution Director | • Gross Margin between $32\%$ and $38\%$<br>• Compressed delivery runway ($<28$ weeks for $>8$ modules)<br>• CEMLI inventory between $12-18$ OIC interfaces<br>• Up to 2 downsized module overrides |
| **Tier 3 (Red)** | Executive Committee / Deal Desk / Global Risk | • Gross Margin $< 32\%$<br>• Severe runway compression ($<24$ weeks)<br>• Heavy custom inventory ($>18$ OIC, $>4$ PaaS extensions)<br>• 3 or more downsized module overrides<br>• Client decision velocity modifier $>1.15$ (SLA lag) |

---

## 4. Deal Defense & SteerCo Justification Rules
When defending commercial proposals:
1. **Never sacrifice quality gates**: Never eliminate SIT or UAT to reduce price; instead, descope non-critical modules to Wave 2.
2. **Buffer for Decision Velocity**: If client historical decision SLA exceeds 5 business days, apply a minimum 10% schedule or staffing contingency buffer.
3. **Multi-Entity Multiplier**: Each additional legal entity or distinct chart of accounts beyond 3 increases data conversion and configuration effort by 12%–18%.
