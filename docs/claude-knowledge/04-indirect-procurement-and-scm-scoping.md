# Oracle Fusion Indirect Procurement & SCM Architecture

## 1. Pillar Scope & Architecture
Indirect Procurement in Oracle Cloud enables organizations to control non-production spend, streamline supplier interactions, enforce contract compliance, and automate requisition-to-pay processes.

### Core Modules & Functional Boundaries:
1. **Purchasing (`scm_purchasing` / `proc_purchasing`)**:
   * Purchase order (PO) generation, blanket purchase agreements (BPA), contract purchase agreements (CPA).
   * 2-way and 3-way matching rules with Oracle Payables (AP).
   * Multi-currency purchasing and tax integration.
2. **Self-Service Procurement (`proc_ssp` / `scm_self_service_proc`)**:
   * Employee requisitioning portal, smart forms, information-driven shopping.
   * Punchout catalogs (cXML / OCI) with major vendors (e.g., Amazon Business, Grainger, CDW).
   * Multi-level approval routing based on supervisory hierarchy, cost center, and dollar thresholds.
3. **Sourcing (`proc_sourcing`)**:
   * Negotiation creation (RFI, RFQ, RFP events).
   * Online supplier bidding, reverse auctions, two-stage blind evaluation, award recommendation workflows.
4. **Procurement Contracts (`proc_contracts`)**:
   * Structured clause library, contract terms authoring, deviation analysis, Microsoft Word integration.
   * Digital signature integration (DocuSign, Adobe Sign) and lifecycle amendment tracking.
5. **Supplier Qualification Management (`proc_sqm`)**:
   * Supplier onboarding questionnaires, annual assessment cycles, ESG & diversity certifications, automated risk scoring.
6. **Supplier Portal (`proc_supplier_portal`)**:
   * Vendor collaboration space: order acknowledgment, ASN (advance shipment notices), direct invoice submission, dispute management.

---

## 2. Key Scoping Dimensions & Multipliers

* **Punchout Catalogs**:
  * $1 - 3$ punchouts: Low complexity ($+40$ hrs).
  * $4 - 10$ punchouts: Medium complexity ($+120$ hrs, requires cXML testing and vendor sandbox coordination).
  * $>10$ punchouts: High complexity ($+250$ hrs).
* **Approval Matrices**:
  * Standard supervisory: Low complexity ($1.0\times$).
  * Multi-tier matrix (Department + Cost Center + Capital Expenditure + Project Accounting): High complexity ($1.35\times$).
* **Direct vs. Indirect SCM Integration**:
  * Integration with Inventory Management (`scm_inv`) and Cost Accounting (`scm_costing`) introduces consigned inventory, receipt accounting, and encumbrance accounting requirements.
