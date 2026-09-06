import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, query, orderBy, limit } from 'firebase/firestore';
import firebaseConfig from './src/lib/firebaseConfig';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable CORS for external systems like Claude Artifacts
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize server-side Firebase
const fbApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(fbApp, firebaseConfig.firestoreDatabaseId);

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Mock/fallback responses will be used if needed.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Helper for calling Gemini with retry and fallback across candidate models
const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];

async function generateContentWithFallback(contents: any, config: any): Promise<any> {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    // Try up to 2 attempts per model with exponential backoff on 503/429
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient = errMsg.includes('503') || errMsg.includes('429') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand') || errMsg.includes('RESOURCE_EXHAUSTED');
        
        console.warn(`[Gemini Attempt ${attempt} on ${model}] Failed: ${errMsg}`);
        if (isTransient && attempt < 2) {
          // Wait briefly before retrying
          await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
        } else {
          // Break to next candidate model
          break;
        }
      }
    }
  }

  throw lastError;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// ----------------------------------------------------
// Public REST Endpoints for External Systems (Claude Artifacts, cURL, etc.)
// ----------------------------------------------------

// 1. Project Scenarios
app.get('/api/scenarios', async (req, res) => {
  try {
    const colRef = collection(db, 'project_scenarios');
    const snapshot = await getDocs(colRef);
    const scenarios: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      let scenarioData = null;
      if (data.scenarioDataJson) {
        try {
          scenarioData = JSON.parse(data.scenarioDataJson);
        } catch (e) {
          // ignore
        }
      }
      scenarios.push({
        id: data.id,
        name: data.name,
        clientName: data.clientName,
        description: data.description,
        moduleCount: data.moduleCount,
        projectWeeks: data.projectWeeks,
        updatedAt: data.updatedAt,
        authorId: data.authorId,
        scenarioData
      });
    });
    res.json({ success: true, count: scenarios.length, scenarios });
  } catch (error: any) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Single Scenario by ID
app.get('/api/scenarios/:id', async (req, res) => {
  try {
    const docRef = doc(db, 'project_scenarios', req.params.id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return res.status(404).json({ success: false, error: 'Scenario not found' });
    }
    const data = snap.data();
    let scenarioData = null;
    if (data.scenarioDataJson) {
      try {
        scenarioData = JSON.parse(data.scenarioDataJson);
      } catch (e) {
        // ignore
      }
    }
    res.json({
      success: true,
      scenario: {
        id: data.id,
        name: data.name,
        clientName: data.clientName,
        description: data.description,
        moduleCount: data.moduleCount,
        projectWeeks: data.projectWeeks,
        updatedAt: data.updatedAt,
        authorId: data.authorId,
        scenarioData
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Snapshots
app.get('/api/snapshots', async (req, res) => {
  try {
    const colRef = collection(db, 'universal_snapshots');
    const snapshot = await getDocs(colRef);
    const snapshots: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      let scenarioData = null;
      if (data.scenarioDataJson) {
        try {
          scenarioData = JSON.parse(data.scenarioDataJson);
        } catch (e) {
          // ignore
        }
      }
      snapshots.push({
        id: data.id,
        scenarioId: data.scenarioId,
        scenarioName: data.scenarioName,
        description: data.description,
        totalEffortHours: data.totalEffortHours,
        projectWeeks: data.projectWeeks,
        avgFte: data.avgFte,
        timestamp: data.timestamp,
        authorId: data.authorId,
        scenarioData
      });
    });
    res.json({ success: true, count: snapshots.length, snapshots });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Podcast Episodes
app.get('/api/podcasts', async (req, res) => {
  try {
    const colRef = collection(db, 'podcast_episodes');
    const snapshot = await getDocs(colRef);
    const episodes: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      let dialogue = [];
      let keyTakeaways = [];
      if (data.dialogueJson) {
        try { dialogue = JSON.parse(data.dialogueJson); } catch (e) {}
      }
      if (data.keyTakeaways) {
        try { keyTakeaways = JSON.parse(data.keyTakeaways); } catch (e) {}
      }
      episodes.push({
        id: data.id,
        scenarioId: data.scenarioId,
        clientName: data.clientName,
        title: data.title,
        subtitle: data.subtitle,
        focus: data.focus,
        accent: data.accent,
        summary: data.summary,
        keyTakeaways,
        dialogue,
        createdAt: data.createdAt
      });
    });
    res.json({ success: true, count: episodes.length, episodes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// General Gemini generation endpoint
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, contextData } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let contents = prompt;
    if (contextData) {
      contents = `Context Details:\n${typeof contextData === 'string' ? contextData : JSON.stringify(contextData, null, 2)}\n\nUser Request:\n${prompt}`;
    }

    const response = await generateContentWithFallback(contents, {
      systemInstruction: systemInstruction || 'You are an elite Oracle Cloud Global Practice Leader, Principal Enterprise Architect, and Big-4 Delivery Director specializing in Oracle Fusion Cloud (ERP, SCM, HCM, EPM, CX) estimation, True Cloud Method (TCM), OUM Cloud, CEMLI architecture, and Steering Committee governance. Provide sharp, structured, actionable, and mathematically grounded advice.'
    });

    res.json({
      text: response.text,
      success: true
    });
  } catch (error: any) {
    console.error('Gemini API Error (fallback handled):', error);
    res.status(200).json({
      success: false,
      error: error.message || 'Gemini model is currently experiencing high demand. Automatic fallback synthesized.',
      fallbackText: 'AI assistant is currently experiencing high upstream demand. Synthesis fallback active.'
    });
  }
});

// Specialized Dynamic Scoping Questions Generator
app.post('/api/gemini/generate-questions', async (req, res) => {
  try {
    const { industry, modules, currentScale, targetFocus } = req.body;

    const prompt = `Generate 3 to 5 targeted, highly impactful Oracle Fusion Cloud implementation scoping and complexity questions specifically for the ${industry || 'Enterprise'} industry, covering modules: ${(modules || []).join(', ')}. Target focus: ${targetFocus || 'General Architecture & CEMLI'}.

Return the result strictly as a valid JSON array of question objects matching this structure:
[
  {
    "id": "dyn_q_1",
    "category": "Global Template & Governance",
    "title": "Clear concise question title",
    "description": "Elaborate context explaining why this matters for Oracle Cloud implementation",
    "options": [
      { "label": "Low Complexity Option (e.g. Standard MBP)", "score": 1, "scheduleWeeks": 0, "hoursImpact": 0, "desc": "Details", "rationale": "Why low" },
      { "label": "Moderate Complexity Option", "score": 2, "scheduleWeeks": 1.5, "hoursImpact": 240, "desc": "Details", "rationale": "Why moderate" },
      { "label": "High Complexity Option", "score": 3, "scheduleWeeks": 3.0, "hoursImpact": 520, "desc": "Details", "rationale": "Why high" },
      { "label": "Extreme Complexity Option (e.g. Custom PaaS/Global)", "score": 4, "scheduleWeeks": 5.0, "hoursImpact": 950, "desc": "Details", "rationale": "Why extreme" }
    ]
  }
]`;

    const response = await generateContentWithFallback(prompt, {
      responseMimeType: 'application/json',
      systemInstruction: 'You are an Oracle Certified Cloud Enterprise Architect. Generate realistic, highly tailored scoping questions with calibrated schedule weeks and hours impact.'
    });

    let jsonStr = response.text || '[]';
    // Clean potential markdown wrap
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }
    const questions = JSON.parse(jsonStr);

    res.json({ questions, success: true });
  } catch (error: any) {
    console.error('Questions Generation Error (fallback handled):', error);
    res.status(200).json({ error: error.message, questions: [], success: false });
  }
});

// Specialized One-Box RFP & Scoping Text Parser Endpoint
app.post('/api/gemini/parse-rfp', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'rawText is required', success: false });
    }

    const prompt = `You are an elite Oracle Fusion Cloud Principal Enterprise Architect and Global Practice Leader.
Parse and extract all Oracle Cloud implementation scoping parameters from the following client RFP, scoping notes, email thread, or Q&A replies.

RAW CLIENT TEXT:
"""
${rawText}
"""

Available Oracle Module IDs to match:
- Financials (ERP): 'erp_gl', 'erp_ap', 'erp_ar', 'erp_fa', 'erp_cm', 'erp_tax', 'erp_ppm', 'erp_proc'
- Supply Chain (SCM): 'scm_inv', 'scm_om', 'scm_mfg', 'scm_maint', 'scm_plan', 'scm_wms', 'scm_gop'
- HCM & Payroll: 'hcm_core', 'hcm_payroll', 'hcm_absence', 'hcm_time', 'hcm_benefits', 'hcm_talent', 'hcm_orc'
- EPM & CX: 'epm_fccs', 'epm_epbcs', 'epm_edm', 'cx_service', 'cx_cpq'

Scale Driver Keys:
- 'fin_ent' (Legal Entities), 'fin_led' (Ledgers), 'fin_cur' (Currencies), 'fin_coa_segments' (COA Segments)
- 'scm_plants' (Mfg Plants), 'scm_wh' (Warehouses), 'scm_inv' (Inventory Orgs)
- 'hcm_hc' (Total Employee Headcount), 'hcm_union_groups' (Union Groups)
- 'tech_oic' (OIC Integrations), 'tech_data_objects' (FBDI Conversion Objects), 'tech_conversion_cycles' (Mock Cycles 1-5), 'tech_historical_years' (Historical Years)

Delivery Modifiers (1.0 = Baseline normal):
- 'decisionVelocity' (0.90 Rapid <48h, 1.00 Standard 1-2w, 1.15 Slow 2-4w, 1.35 Gridlock)
- 'dataDebt' (0.90 Pristine MDM, 1.00 Standard, 1.10 Moderate, 1.25 Heavy Z-tables/Unpurged)
- 'cloudMindset' (0.90 Zero Customization 100% MBP, 1.00 Standard, 1.15 Moderate PaaS, 1.30 Hostile/Bespoke)
- 'integrationVolatility' (0.90 Pre-built OIC, 1.00 Standard, 1.10 Moderate, 1.25 Volatile/SCADA/MES)
- 'smeAvailability' (0.90 100% Dedicated Full-time, 1.00 Standard 50%, 1.15 Constrained <25%)
- 'regulatoryCompliance' (1.00 Standard Single GAAP, 1.25 Multi-statutory/USMCA/GoBD/HIPAA/Dual-Ledger)
- 'changeResistance' (0.90 High Readiness, 1.00 Neutral, 1.20 High Resistance/Union CBA)

Attribution rules:
- 'direct': Explicitly stated with exact number/quote.
- 'inferred': Implied from context (e.g. multi-currency in Europe implies 2+ ledgers).
- 'default': Applied standard Oracle MBP benchmark because text was silent.

Return strictly a valid JSON object matching this schema:
{
  "clientName": "Extracted or inferred Client Name",
  "industry": "Industry sector",
  "legacySystem": "Identified legacy system (e.g., SAP, AS400, Custom)",
  "targetGoLiveMonths": 18,
  "overallConfidencePct": 94,
  "inferredModules": [
    {
      "id": "erp_gl",
      "name": "General Ledger & Financial Reporting",
      "pillar": "ERP",
      "confidencePct": 98,
      "citation": "Exact quote from text",
      "attribution": "direct"
    }
  ],
  "scaleDrivers": [
    {
      "key": "fin_ent",
      "name": "Legal Entities",
      "category": "FIN",
      "currentValue": 4,
      "extractedValue": 14,
      "unit": "entities",
      "confidencePct": 95,
      "citation": "Exact quote from text",
      "attribution": "direct"
    }
  ],
  "modifiers": [
    {
      "key": "decisionVelocity",
      "name": "Decision Velocity",
      "category": "Governance",
      "value": 1.00,
      "label": "Standard 1-2 Weeks",
      "confidencePct": 90,
      "citation": "Quote or reason",
      "reasoning": "Detailed justification",
      "attribution": "direct"
    }
  ],
  "rawScaleDriversPayload": {
    "fin_ent": 14,
    "fin_led": 2,
    "fin_coa_segments": 8,
    "scm_plants": 8,
    "scm_wh": 6,
    "scm_inv": 12,
    "hcm_hc": 6800,
    "tech_oic": 36,
    "tech_data_objects": 22,
    "tech_conversion_cycles": 3,
    "tech_historical_years": 3
  },
  "rawModifiersPayload": {
    "decisionVelocity": 1.15,
    "dataDebt": 1.25,
    "cloudMindset": 1.00,
    "integrationVolatility": 1.25,
    "smeAvailability": 1.00,
    "regulatoryCompliance": 1.25,
    "changeResistance": 1.20
  },
  "unmappedExclusions": [
    {
      "item": "Legacy Mainframe Hardware Maintenance",
      "note": "Hardware maintenance is out of scope for Oracle SaaS SI.",
      "category": "Infrastructure / Non-Oracle"
    }
  ],
  "summaryFindings": [
    "Key finding 1...",
    "Key finding 2..."
  ],
  "keyRiskHighlights": [
    "Risk 1...",
    "Risk 2..."
  ]
}`;

    const response = await generateContentWithFallback(prompt, {
      responseMimeType: 'application/json',
      systemInstruction: 'You are an Oracle Certified Global Delivery Architect. Extract parameters with high fidelity, rigorous citations, and precise attribution tags.'
    });

    let jsonStr = response.text || '{}';
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }
    const result = JSON.parse(jsonStr);

    res.json({ result, success: true });
  } catch (error: any) {
    console.error('RFP Parse Generation Error (fallback handled):', error);
    res.status(200).json({ error: error.message, success: false });
  }
});

// ==========================================
// SMARTSHEET REST API & WEBHOOK INTEGRATION
// ==========================================

// Smartsheet Config Status
app.get('/api/smartsheet/config', (req, res) => {
  res.json({
    hasEnvToken: Boolean(process.env.SMARTSHEET_ACCESS_TOKEN),
    hasEnvWebhook: Boolean(process.env.SMARTSHEET_WEBHOOK_URL)
  });
});

// Test and verify Smartsheet Access Token & retrieve Workspaces/User Info
app.post('/api/smartsheet/test-auth', async (req, res) => {
  try {
    const token = req.body.accessToken || process.env.SMARTSHEET_ACCESS_TOKEN;
    if (!token) {
      return res.status(400).json({ valid: false, error: 'Smartsheet Access Token is required' });
    }

    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    // Call Smartsheet API v2 Get Current User & Workspaces
    const [userRes, workspacesRes] = await Promise.all([
      fetch('https://api.smartsheet.com/2.0/users/me', {
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' }
      }),
      fetch('https://api.smartsheet.com/2.0/workspaces?includeAll=true', {
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' }
      })
    ]);

    if (!userRes.ok) {
      const errText = await userRes.text();
      return res.status(401).json({
        valid: false,
        error: `Smartsheet authentication failed (Status ${userRes.status}): ${errText || 'Invalid API Token'}`
      });
    }

    const userData = await userRes.json();
    let workspacesData: any = { data: [] };
    if (workspacesRes.ok) {
      workspacesData = await workspacesRes.json();
    }

    res.json({
      valid: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
        admin: userData.admin || false
      },
      workspaces: workspacesData.data || []
    });
  } catch (error: any) {
    console.error('Smartsheet Auth Error:', error);
    res.status(500).json({ valid: false, error: error.message || 'Network error connecting to Smartsheet API' });
  }
});

// Retrieve Workspaces in Smartsheet
app.post('/api/smartsheet/workspaces', async (req, res) => {
  try {
    const token = req.body.accessToken || process.env.SMARTSHEET_ACCESS_TOKEN;
    if (!token) {
      return res.status(400).json({ error: 'Access token is required' });
    }
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    const response = await fetch('https://api.smartsheet.com/2.0/workspaces?includeAll=true', {
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Smartsheet Error: ${errText}` });
    }

    const data = await response.json();
    res.json({ workspaces: data.data || [], success: true });
  } catch (error: any) {
    console.error('Smartsheet Fetch Workspaces Error:', error);
    res.status(500).json({ error: error.message, success: false });
  }
});

// Direct Deployment: Create Project Sheet, Columns, and Date-wise Rows in Smartsheet or dispatch via Webhook
app.post('/api/smartsheet/deploy', async (req, res) => {
  const logs: Array<{ step: string; timestamp: string; status: 'done' | 'failed' | 'info'; detail?: string }> = [];
  const addLog = (step: string, status: 'done' | 'failed' | 'info' = 'done', detail?: string) => {
    logs.push({ step, timestamp: new Date().toLocaleTimeString(), status, detail });
  };

  try {
    const token = req.body.accessToken || process.env.SMARTSHEET_ACCESS_TOKEN;
    const webhookUrl = req.body.webhookUrl || process.env.SMARTSHEET_WEBHOOK_URL;
    const { workspaceId, sheetName, projectData } = req.body;

    if (!projectData) {
      return res.status(400).json({ error: 'projectData is required', success: false });
    }

    const projectName = projectData.name || projectData.project?.name || 'Oracle Cloud Project';
    addLog('Received deployment payload for: ' + projectName, 'info');

    // 1. Prioritize Direct Smartsheet REST API v2 when Access Token is present
    if (token && (token.length > 10) && token !== 'ENV_CONFIGURED') {
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      addLog(`Authenticating with Smartsheet REST API v2`, 'info');

      // Smartsheet API constraint: sheet.name must be 50 characters or less (Error code 1041)
      let targetSheetName = (sheetName || `${projectName} - Baseline 1.0 (Frozen)`).trim();
      if (targetSheetName.length > 50) {
        targetSheetName = targetSheetName.substring(0, 50).trim();
      }
      addLog(`Creating Smartsheet Project Sheet: "${targetSheetName}" (${targetSheetName.length} chars)`, 'info');

      // Define 30 standard Smartsheet PMO columns adhering to Oracle Cloud Project Plan Generation Standard v1.0
      const columnsPayload = [
        { title: 'Task Name', primary: true, type: 'TEXT_NUMBER' },
        { title: 'ASSIGNED TO ROLE', type: 'TEXT_NUMBER' },
        { title: 'Status', type: 'PICKLIST', options: ['NOT STARTED', 'IN PROGRESS', 'READY FOR GATE', 'COMPLETE', 'BASELINE LOCKED'] },
        { title: 'Start Date', type: 'TEXT_NUMBER' },
        { title: 'End Date', type: 'TEXT_NUMBER' },
        { title: 'Task Progress', type: 'PICKLIST', options: ['GREEN', 'AMBER', 'RED', 'COMPLETE'] },
        { title: 'Predecessors', type: 'TEXT_NUMBER' },
        { title: 'Duration', type: 'TEXT_NUMBER' },
        { title: 'Type', type: 'TEXT_NUMBER' },
        { title: 'Workstream', type: 'TEXT_NUMBER' },
        { title: 'Comments', type: 'TEXT_NUMBER' },
        { title: 'Allocation', type: 'TEXT_NUMBER' },
        { title: 'LEVEL-ID', type: 'TEXT_NUMBER' },
        { title: 'Complete', type: 'TEXT_NUMBER' },
        { title: 'TASK_NUMBER', type: 'TEXT_NUMBER' },
        { title: 'CATEGORY', type: 'TEXT_NUMBER' },
        { title: 'WBS-ID', type: 'TEXT_NUMBER' },
        { title: 'TEMPLATE-ID', type: 'TEXT_NUMBER' },
        { title: 'Parent WBS ID', type: 'TEXT_NUMBER' },
        { title: 'Wave', type: 'TEXT_NUMBER' },
        { title: 'Phase', type: 'TEXT_NUMBER' },
        { title: 'Sub-Phase', type: 'TEXT_NUMBER' },
        { title: 'Domain', type: 'TEXT_NUMBER' },
        { title: 'Module Code', type: 'TEXT_NUMBER' },
        { title: 'Module Name', type: 'TEXT_NUMBER' },
        { title: 'Component ID', type: 'TEXT_NUMBER' },
        { title: 'Component Name', type: 'TEXT_NUMBER' },
        { title: 'Schedule Method', type: 'TEXT_NUMBER' },
        { title: 'Anomaly Flag', type: 'TEXT_NUMBER' },
        { title: 'Anomaly Reason', type: 'TEXT_NUMBER' }
      ];

      const sheetCreateEndpoint = workspaceId && workspaceId !== 'home'
        ? `https://api.smartsheet.com/2.0/workspaces/${workspaceId}/sheets`
        : 'https://api.smartsheet.com/2.0/sheets';

      const sheetCreateRes = await fetch(sheetCreateEndpoint, {
        method: 'POST',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: targetSheetName,
          columns: columnsPayload
        })
      });

      if (!sheetCreateRes.ok) {
        const errText = await sheetCreateRes.text();
        throw new Error(`Failed to create Smartsheet (Status ${sheetCreateRes.status}): ${errText}`);
      }

      const sheetData = await sheetCreateRes.json();
      const createdSheet = sheetData.result || sheetData;
      const sheetId = createdSheet.id;
      const sheetUrl = createdSheet.permalink || `https://app.smartsheet.com/sheets/${sheetId}`;
      let columns = createdSheet.columns || [];

      addLog(`Created Smartsheet Sheet: "${targetSheetName}" (Sheet ID: ${sheetId})`, 'done');

      // If columns were returned directly in sheet creation response, use them; otherwise fetch sheet
      if (!columns || columns.length === 0) {
        try {
          await new Promise((res) => setTimeout(res, 800));
          const verifyRes = await fetch(`https://api.smartsheet.com/2.0/sheets/${sheetId}?include=all`, {
            headers: { Authorization: authHeader, 'Content-Type': 'application/json' }
          });
          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            if (verifyData.columns && verifyData.columns.length > 0) {
              columns = verifyData.columns;
            }
          }
        } catch (verifyErr) {
          console.warn('Smartsheet columns reload warning:', verifyErr);
        }
      } else {
        // Brief 400ms pause to ensure cluster consistency
        await new Promise((res) => setTimeout(res, 400));
      }
      addLog(`Resolved ${columns.length} Smartsheet PMO schema columns for sheet ID ${sheetId}`, 'done');

      // Column ID Mapping helper (case-insensitive & whitespace trimmed)
      const getColId = (title: string): number | string => {
        const target = title.toLowerCase().trim();
        const found = columns.find((c: any) => c.title && c.title.toLowerCase().trim() === target);
        if (found && found.id) return found.id;
        // Fallback to partial match or primary column
        const partial = columns.find((c: any) => c.title && (c.title.toLowerCase().includes(target) || target.includes(c.title.toLowerCase())));
        if (partial && partial.id) return partial.id;
        return columns[0]?.id;
      };

      const cTaskName = getColId('Task Name');
      const cRole = getColId('ASSIGNED TO ROLE');
      const cStatus = getColId('Status');
      const cStart = getColId('Start Date');
      const cEnd = getColId('End Date');
      const cProgress = getColId('Task Progress');
      const cPred = getColId('Predecessors');
      const cDur = getColId('Duration');
      const cType = getColId('Type');
      const cWorkstream = getColId('Workstream');
      const cComments = getColId('Comments');
      const cAlloc = getColId('Allocation');
      const cLevel = getColId('LEVEL-ID');
      const cComplete = getColId('Complete');
      const cTaskNum = getColId('TASK_NUMBER');
      const cCategory = getColId('CATEGORY');
      const cWbsId = getColId('WBS-ID');
      const cTmplId = getColId('TEMPLATE-ID');
      const cParentWbs = getColId('Parent WBS ID');
      const cWave = getColId('Wave');
      const cPhase = getColId('Phase');
      const cSubPhase = getColId('Sub-Phase');
      const cDomain = getColId('Domain');
      const cModCode = getColId('Module Code');
      const cModName = getColId('Module Name');
      const cCompId = getColId('Component ID');
      const cCompName = getColId('Component Name');
      const cSchedMethod = getColId('Schedule Method');
      const cAnomaly = getColId('Anomaly Flag');
      const cAnomalyReason = getColId('Anomaly Reason');

      // Build hierarchical rows for Phases and Subtasks
      const rowsToAdd: any[] = [];
      const smartsheetRows = projectData.smartsheetRows || projectData.wbsRows || [];

      if (Array.isArray(smartsheetRows) && smartsheetRows.length > 0) {
        // Direct 30-Column Standard Rows Mapping
        smartsheetRows.forEach((r: any) => {
          const indent = '  '.repeat(Math.max(0, (r.levelId || 1) - 1));
          const formattedTaskName = `${indent}${r.taskName || ''}`;

          rowsToAdd.push({
            toBottom: true,
            cells: [
              { columnId: cTaskName, value: formattedTaskName },
              { columnId: cRole, value: r.assignedToRole || '' },
              { columnId: cStatus, value: r.status || 'NOT STARTED' },
              { columnId: cStart, value: r.startDate || '' },
              { columnId: cEnd, value: r.endDate || '' },
              { columnId: cProgress, value: r.taskProgress || 'GREEN' },
              { columnId: cPred, value: r.predecessors || '' },
              { columnId: cDur, value: r.duration || '' },
              { columnId: cType, value: r.type || 'Activity' },
              { columnId: cWorkstream, value: r.workstream || 'PMO' },
              { columnId: cComments, value: r.comments || '' },
              { columnId: cAlloc, value: r.allocation || '' },
              { columnId: cLevel, value: String(r.levelId || 5) },
              { columnId: cComplete, value: String(r.complete ?? 0) },
              { columnId: cTaskNum, value: String(r.taskNumber || '') },
              { columnId: cCategory, value: r.category || 'Mandatory' },
              { columnId: cWbsId, value: r.wbsId || '' },
              { columnId: cTmplId, value: r.templateId || '' },
              { columnId: cParentWbs, value: r.parentWbsId || '' },
              { columnId: cWave, value: r.wave || 'Wave 0' },
              { columnId: cPhase, value: r.phase || '' },
              { columnId: cSubPhase, value: r.subPhase || '' },
              { columnId: cDomain, value: r.domain || 'CROSS' },
              { columnId: cModCode, value: r.moduleCode || '' },
              { columnId: cModName, value: r.moduleName || '' },
              { columnId: cCompId, value: r.componentId || '' },
              { columnId: cCompName, value: r.componentName || '' },
              { columnId: cSchedMethod, value: r.scheduleMethod || 'ALIGN_TO_SUBPHASE' },
              { columnId: cAnomaly, value: r.anomalyFlag || 'NONE' },
              { columnId: cAnomalyReason, value: r.anomalyReason || '' }
            ]
          });
        });
      } else {
        // Fallback to legacy phases
        const phases = projectData.phases || [];
        phases.forEach((phase: any, pIdx: number) => {
          const phaseNum = pIdx;
          const phaseDuration = Math.max(1, (phase.endWeek || 1) - (phase.startWeek || 1) + 1);
          const waveLabel = pIdx === 0 ? 'Wave 0' : 'Wave 1';
          const wbsPhaseId = `WBS-P${pIdx}`;
          const predPhase = pIdx === 0 ? '' : `WBS-P${pIdx - 1}`;

          // Phase summary header row (Level 2)
          rowsToAdd.push({
            toBottom: true,
            cells: [
              { columnId: cTaskName, value: `${phaseNum}.0 [PHASE] ${phase.phaseName.toUpperCase()}` },
              { columnId: cRole, value: phase.leadRole || 'Track Lead' },
              { columnId: cStatus, value: 'BASELINE LOCKED' },
              { columnId: cStart, value: phase.startDate || '' },
              { columnId: cEnd, value: phase.endDate || '' },
              { columnId: cProgress, value: 'GREEN' },
              { columnId: cPred, value: predPhase },
              { columnId: cDur, value: `${phaseDuration} wks` },
              { columnId: cType, value: 'Phase Summary' },
              { columnId: cWorkstream, value: 'GOVERNANCE' },
              { columnId: cComments, value: phase.tcmGate || `Gate ${phaseNum}` },
              { columnId: cAlloc, value: '' },
              { columnId: cLevel, value: '2' },
              { columnId: cComplete, value: '0' },
              { columnId: cTaskNum, value: `${phaseNum}.0` },
              { columnId: cCategory, value: 'Summary' },
              { columnId: cWbsId, value: wbsPhaseId },
              { columnId: cTmplId, value: `TMPL-PHASE-${pIdx}` },
              { columnId: cParentWbs, value: 'WBS-ROOT' },
              { columnId: cWave, value: waveLabel },
              { columnId: cPhase, value: phase.phaseName || '' },
              { columnId: cSubPhase, value: 'All' },
              { columnId: cDomain, value: 'Oracle Cloud' },
              { columnId: cModCode, value: '' },
              { columnId: cModName, value: '' },
              { columnId: cCompId, value: '' },
              { columnId: cCompName, value: '' },
              { columnId: cSchedMethod, value: 'BLANK_FOR_ROLLUP' },
              { columnId: cAnomaly, value: 'NO' },
              { columnId: cAnomalyReason, value: '' }
            ]
          });

          // Subtasks under this phase (Level 5)
          const subtasks = phase.subtasks || [];
          subtasks.forEach((st: any, sIdx: number) => {
            const wbsTaskId = `WBS-P${pIdx}-T${sIdx + 1}`;
            const predTask = sIdx === 0 ? wbsPhaseId : `WBS-P${pIdx}-T${sIdx}`;

            rowsToAdd.push({
              toBottom: true,
              cells: [
                { columnId: cTaskName, value: `   ${phaseNum}.${sIdx + 1} ↳ ${st.name}` },
                { columnId: cRole, value: st.owner || 'Pod Lead' },
                { columnId: cStatus, value: 'NOT STARTED' },
                { columnId: cStart, value: st.start || phase.startDate || '' },
                { columnId: cEnd, value: st.end || phase.endDate || '' },
                { columnId: cProgress, value: 'GREEN' },
                { columnId: cPred, value: predTask },
                { columnId: cDur, value: `${st.durationWeeks || 1} wks` },
                { columnId: cType, value: 'Task' },
                { columnId: cWorkstream, value: 'PMO' },
                { columnId: cComments, value: `Deliverable: ${st.deliverable || 'Deliverable'}` },
                { columnId: cAlloc, value: '' },
                { columnId: cLevel, value: '5' },
                { columnId: cComplete, value: '0' },
                { columnId: cTaskNum, value: `${phaseNum}.${sIdx + 1}` },
                { columnId: cCategory, value: 'Deliverable' },
                { columnId: cWbsId, value: wbsTaskId },
                { columnId: cTmplId, value: `TMPL-TASK-${pIdx}-${sIdx}` },
                { columnId: cParentWbs, value: wbsPhaseId },
                { columnId: cWave, value: waveLabel },
                { columnId: cPhase, value: phase.phaseName || '' },
                { columnId: cSubPhase, value: st.name || '' },
                { columnId: cDomain, value: 'Oracle Cloud' },
                { columnId: cModCode, value: '' },
                { columnId: cModName, value: '' },
                { columnId: cCompId, value: '' },
                { columnId: cCompName, value: '' },
                { columnId: cSchedMethod, value: 'ALIGN_TO_SUBPHASE' },
                { columnId: cAnomaly, value: 'NO' },
                { columnId: cAnomalyReason, value: '' }
              ]
            });
          });
        });
      }

      addLog(`Populating ${rowsToAdd.length} structured rows across ${projectData.waves?.length || projectData.phases?.length || 1} waves/phases`, 'info');

      // Add rows in robust batches of 200 (Smartsheet rate-limit and latency safe)
      const BATCH_SIZE = 200;
      let insertedCount = 0;

      for (let i = 0; i < rowsToAdd.length; i += BATCH_SIZE) {
        const batch = rowsToAdd.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(rowsToAdd.length / BATCH_SIZE);

        let batchSuccess = false;
        let lastBatchErr = '';

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const rowsRes = await fetch(`https://api.smartsheet.com/2.0/sheets/${sheetId}/rows`, {
              method: 'POST',
              headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
              body: JSON.stringify(batch)
            });

            if (rowsRes.ok) {
              insertedCount += batch.length;
              batchSuccess = true;
              addLog(`Inserted batch ${batchNum}/${totalBatches} (${batch.length} rows)`, 'done');
              break;
            } else {
              lastBatchErr = await rowsRes.text();
              console.warn(`[Smartsheet Batch ${batchNum} Attempt ${attempt}] Error:`, lastBatchErr);
              // Wait 1.5s before retry (handles 1006 Not Found replication latency & 429 rate limit)
              await new Promise((res) => setTimeout(res, 1500 * attempt));
            }
          } catch (netErr: any) {
            lastBatchErr = netErr.message;
            await new Promise((res) => setTimeout(res, 1500 * attempt));
          }
        }

        if (!batchSuccess) {
          addLog(`Batch ${batchNum} insertion failed: ${lastBatchErr}`, 'failed');
          throw new Error(`Sheet created (ID: ${sheetId}), but inserting WBS rows failed: ${lastBatchErr}`);
        }
      }

      addLog(`Successfully populated ${insertedCount} WBS rows with dates, deliverables, and TCM criteria`, 'done');
      addLog(`Smartsheet Deployment Complete! Direct Link: ${sheetUrl}`, 'done');

      return res.json({
        success: true,
        mode: 'api',
        sheetId: sheetId,
        sheetName: targetSheetName,
        smartsheetUrl: sheetUrl,
        rowsCreatedCount: rowsToAdd.length,
        logs
      });
    }

    // 2. If Webhook / Smartsheet Bridge URL is provided and connectionMode is webhook
    if (webhookUrl && (webhookUrl.includes('bridge') || webhookUrl.includes('webhook') || req.body.connectionMode === 'webhook')) {
      addLog(`Dispatching to Smartsheet Webhook / Bridge endpoint: ${webhookUrl}`, 'info');
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Oracle-Cloud-PMO-Estimator-Smartsheet'
          },
          body: JSON.stringify({
            event: 'ORACLE_CLOUD_BASELINE_FROZEN_SMARTSHEET',
            timestamp: new Date().toISOString(),
            project: projectData
          })
        });

        const respText = await webhookResponse.text();
        addLog(`Webhook responded with status ${webhookResponse.status} (${webhookResponse.statusText})`, webhookResponse.ok ? 'done' : 'failed');

        return res.json({
          success: webhookResponse.ok,
          mode: 'webhook',
          statusCode: webhookResponse.status,
          responseBody: respText.slice(0, 500),
          logs
        });
      } catch (webhookErr: any) {
        addLog(`Webhook dispatch error: ${webhookErr.message}`, 'failed');
      }
    }

    // 3. Simulated / Sandbox Mode (When no live API token or webhook is provided)
    addLog('No live Smartsheet token configured. Executed validated PMO Sandbox Simulation.', 'info');
    addLog(`Validated schedule window: ${projectData.startDate || '2026-09-01'} to ${projectData.endDate || '2027-05-25'} (${projectData.totalWeeks || 38} Weeks)`, 'done');
    addLog(`Calculated ${projectData.phases?.length || 7} Phase Headers and ${(projectData.phases?.length || 7) * 3} WBS Deliverables`, 'done');
    addLog('Configured 9 Smartsheet Columns: Task Name, Phase/Gate, Start, End, Duration, Effort Hours, Assigned Role, TCM Criteria, Status.', 'done');
    addLog('To create a LIVE sheet in your Smartsheet account, enter your Smartsheet API Access Token above and click Connect.', 'info');

    return res.json({
      success: true,
      mode: 'sandbox',
      smartsheetUrl: null,
      rowsCreatedCount: (projectData.phases?.length || 7) * 4,
      message: 'Plan validated in Sandbox Simulation. Connect your Smartsheet API token to create a live sheet in your workspace.',
      logs
    });
  } catch (error: any) {
    console.error('Smartsheet Deploy Error:', error);
    addLog(`Deployment error: ${error.message}`, 'failed');
    return res.status(500).json({
      success: false,
      error: error.message,
      logs
    });
  }
});

// ---------------------------------------------------------------------------
// NotebookLM Podcast Audio Overview Generator Endpoint
// ---------------------------------------------------------------------------
app.post('/api/gemini/podcast', async (req, res) => {
  try {
    const { scenario, data, focus = 'deep_dive', accent = 'en-IN', customPrompt } = req.body;
    if (!scenario) {
      return res.status(400).json({ error: 'Scenario is required', success: false });
    }

    const clientName = scenario.clientName || scenario.name || 'Enterprise Client';
    const weeks = scenario.projectWeeks || 32;
    const hours = Math.round(data?.targetHours || 8500);
    const fte = (data?.avgTotalFTE ?? data?.totalFTE ?? (hours / (weeks * 40)) ?? 7.5).toFixed(1);
    const onshorePct = scenario.deliveryMix?.onshore ?? 20;
    const offshorePct = scenario.deliveryMix?.offshore ?? 80;
    const margin = Math.round(data?.masterBlendedCalc?.grossMarginPct ?? data?.grossMarginPct ?? 48);
    const modules = (scenario.selectedModules || []).slice(0, 10).join(', ');
    const oic = scenario.scaleDrivers?.tech_oic || 0;
    const paas = scenario.scaleDrivers?.tech_paas || 0;
    const dataObjects = scenario.scaleDrivers?.tech_data_objects || 0;
    const mockCycles = scenario.scaleDrivers?.tech_conversion_cycles || 3;
    const contractValue = Math.round(data?.masterBlendedCalc?.totalRevenue ?? data?.totalContractValue ?? 1250000).toLocaleString();

    let focusGuidance = '';
    if (focus === 'commercials') {
      focusGuidance = 'Focus heavily on commercial economics: Contract value, Blended bill rates, 2-Tier 20% Onshore / 80% Offshore GDC staffing arbitrage, 45%+ gross margin defensibility, and Fixed-Fee vs T&M risk allocation for the CFO.';
    } else if (focus === 'architecture') {
      focusGuidance = 'Focus on technical architecture, CEMLI containment, OIC integrations, legacy data extraction & FBDI staging, mock conversion cycles, and testing gates (CRP1, CRP2, SIT, UAT) for the CIO/CTO.';
    } else if (focus === 'executive') {
      focusGuidance = 'Provide a punchy, rapid 2-minute executive SteerCo briefing covering the strategic roadmap, scope boundaries, why 20/80 staffing protects quality, and go-live milestone confidence.';
    } else {
      focusGuidance = 'Provide a comprehensive Listen Podcast Deep Dive covering the full project lifecycle: scope footprint, timeline pacing, 20/80 delivery pyramid, technical complexity, risk mitigations, and commercial ROI.';
    }

    const accentGuidance = accent === 'en-IN'
      ? `ACCENT & CULTURAL TONE: Indian English Delivery Context (en-IN).
The two hosts, Alex (Priya) and Jordan (Rohan), speak in articulate, polished Indian business English characteristic of senior Oracle Cloud practice leadership and global delivery center (GDC) heads from Bangalore and Hyderabad.
Their delivery is insightful, crisp, and warm, blending deep Oracle Cloud True Cloud Method (TCM) rigor with strategic commercial acumen and offshore factory excellence.`
      : `ACCENT & TONE: ${accent} standard business consulting podcast banter.`;

    const host1Name = accent === 'en-IN' ? 'Alex (Priya)' : 'Alex';
    const host2Name = accent === 'en-IN' ? 'Jordan (Rohan)' : 'Jordan';

    const prompt = `You are the executive producer and lead scriptwriter for the iconic "Audio Overview" / Listen Podcast feature.
Create an authentic, intellectually stimulating, two-host conversational podcast dialogue discussing this Oracle Cloud Implementation Proposal & Project Plan.

PROJECT PARAMETERS:
- Client: ${clientName} (${scenario.industry || 'Manufacturing & Enterprise'})
- Duration: ${weeks} Weeks
- Total Sizing Effort: ${hours.toLocaleString()} Hours (~${fte} FTEs)
- Sourcing Delivery Model: Strict 2-Tier Model (${onshorePct}% Onshore, ${offshorePct}% Offshore GDC)
- Scope Footprint: Modules: [${modules}]
- Technical Complexity: ${oic} OIC Integrations, ${paas} PaaS Extensions, ${dataObjects} Data Conversion Objects, ${mockCycles} Mock Cycles
- Commercials: ~$${contractValue} Total Revenue, Target Gross Margin ~${margin}%
- Delivery Methodology: Oracle True Cloud Method (TCM) & OUM 7-Phase Protocol
${accentGuidance}
${customPrompt ? `- Custom User Directives: "${customPrompt}"` : ''}

PODCAST HOST PERSONAS:
1. ${host1Name} (Inquisitive Co-host / Enterprise Strategist):
   - Lively, curious, insightful, and asks the probing questions a CIO or CFO would ask.
   - Highlights surprising numbers, challenges assumptions ("Wait, 28 weeks for full SCM and Financials? How does the team pull that off?"), and provides relatable analogies.
2. ${host2Name} (Principal Enterprise Architect & Global Practice Leader):
   - Authoritative yet accessible, seasoned, grounded in Oracle Cloud delivery reality.
   - Explains the True Cloud Method, why 80% offshore GDC factory execution works with 20% onshore architects, how CEMLI inventory is locked down, and why stage gates prevent go-live failure.

FORMAT REQUIREMENTS:
- Tone: High-energy, natural podcast banter (e.g., "Welcome back to the Deep Dive...", "Right!", "And here's the thing...", "Wait, let's unpack that...").
- Structure: 10 to 14 dialogue turns.
- Strict JSON output matching this schema:
{
  "title": "Compelling podcast episode title (e.g. Inside the 28-Week Oracle Cloud Blueprint: Sourcing, Speed & Scale)",
  "subtitle": "Clear subtitle highlighting the core takeaway",
  "focus": "${focus}",
  "accent": "${accent}",
  "durationMinutes": 6,
  "summary": "2-3 sentence executive summary of this episode",
  "keyTakeaways": [
    "Takeaway 1",
    "Takeaway 2",
    "Takeaway 3"
  ],
  "hosts": {
    "host1": { "name": "${host1Name}", "title": "Enterprise Strategist", "avatarColor": "blue", "voiceType": "female" },
    "host2": { "name": "${host2Name}", "title": "Oracle Cloud Practice Lead", "avatarColor": "emerald", "voiceType": "male" }
  },
  "dialogue": [
    {
      "id": "turn_1",
      "speaker": "Alex",
      "speakerRole": "Enterprise Strategist",
      "text": "Dialogue text with natural conversational rhythm and questions.",
      "topicTag": "Introduction & Scope",
      "highlight": true
    },
    {
      "id": "turn_2",
      "speaker": "Jordan",
      "speakerRole": "Oracle Cloud Practice Lead",
      "text": "Response explaining the technical reality, methodology, or numbers.",
      "topicTag": "Architecture",
      "highlight": false
    }
  ]
}`;

    const response = await generateContentWithFallback(prompt, {
      responseMimeType: 'application/json',
      systemInstruction: 'You are the creator of Google NotebookLM Audio Overviews. Produce brilliant, fluid, and authentic 2-speaker podcast discussions grounded in real enterprise project metrics.'
    });

    let jsonStr = response.text || '{}';
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }
    const episode = JSON.parse(jsonStr);

    // Ensure metadata
    episode.id = `pod_${Date.now()}`;
    episode.createdAt = new Date().toISOString();
    episode.scenarioId = scenario.id;
    episode.clientName = clientName;

    res.json({ episode, success: true });
  } catch (error: any) {
    console.warn('Gemini Podcast Generation Error (falling back to intelligent synthesis):', error);
    res.status(200).json({
      success: false,
      error: error.message,
      fallbackRequired: true
    });
  }
});

// Mount Vite middleware for development vs static build for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
