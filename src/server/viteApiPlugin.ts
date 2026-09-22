import type { Plugin, ViteDevServer } from 'vite';
import {
  sendAuthConfirmationEmail,
  sendCustomerSatisfactionSurveyEmail,
  sendLoginNotificationEmail,
  getEmailDispatchHistory,
} from './emailService';

export function viteApiPlugin(): Plugin {
  return {
    name: 'sheq-api-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // Only handle /api endpoints
        if (!url.startsWith('/api/')) {
          return next();
        }

        // Helper to read JSON request body
        const readBody = async (): Promise<any> => {
          return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch (e) {
                reject(e);
              }
            });
            req.on('error', reject);
          });
        };

        const sendJson = (status: number, data: any) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        try {
          if (req.method === 'POST' && url === '/api/send-auth-link') {
            const body = await readBody();
            const { email, confirmationLink, otpCode, companyName } = body;

            if (!email) {
              return sendJson(400, { success: false, error: 'Email is required' });
            }

            const origin = req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3000';
            const finalLink =
              confirmationLink ||
              `${origin}/#magic_token=${Math.random().toString(36).substring(2)}&email=${encodeURIComponent(
                email
              )}`;

            const result = await sendAuthConfirmationEmail({
              email,
              confirmationLink: finalLink,
              otpCode,
              companyName,
            });

            return sendJson(200, {
              success: true,
              message: `Sign-in confirmation link successfully sent to ${email}`,
              messageId: result.messageId,
              previewUrl: result.previewUrl,
              confirmationLink: finalLink,
            });
          }

          if (req.method === 'POST' && url === '/api/send-survey-link') {
            const body = await readBody();
            const { customerName, customerEmail, surveyUrl, companyName } = body;

            if (!customerEmail) {
              return sendJson(400, { success: false, error: 'Customer email is required' });
            }

            const origin = req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3000';
            const finalUrl =
              surveyUrl ||
              `${origin}/#survey=nk-cs-${Math.random().toString(36).substring(2, 7)}`;

            const result = await sendCustomerSatisfactionSurveyEmail({
              customerName: customerName || 'Valued Customer',
              customerEmail,
              surveyUrl: finalUrl,
              companyName: companyName || 'nk',
            });

            return sendJson(200, {
              success: true,
              message: `Customer survey email successfully sent to ${customerEmail}`,
              messageId: result.messageId,
              previewUrl: result.previewUrl,
              surveyUrl: finalUrl,
            });
          }

          if (req.method === 'POST' && url === '/api/send-login-notification') {
            const body = await readBody();
            const { email, name, companyName, deviceInfo, ipAddress } = body;

            if (!email) {
              return sendJson(400, { success: false, error: 'Email is required' });
            }

            const origin = req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3000';
            const clientIp =
              ipAddress ||
              (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
              req.socket.remoteAddress ||
              '127.0.0.1';
            const clientDevice =
              deviceInfo || (req.headers['user-agent'] as string) || 'Web Browser';

            const result = await sendLoginNotificationEmail({
              email,
              name: name || 'User',
              companyName: companyName || 'NK Quality Systems',
              deviceInfo: clientDevice,
              ipAddress: clientIp,
              workspaceUrl: origin,
            });

            return sendJson(200, {
              success: true,
              message: `Sign-in notification email successfully sent to ${email}`,
              messageId: result.messageId,
              previewUrl: result.previewUrl,
              timestamp: result.timestamp,
            });
          }

          if (req.method === 'GET' && url === '/api/email-dispatches') {
            const history = getEmailDispatchHistory();
            return sendJson(200, {
              success: true,
              dispatches: history,
            });
          }

          if (req.method === 'POST' && url === '/api/ai-generate-suppliers') {
            const body = await readBody();
            const { prompt = '', industry = '', rawText = '', count = 4, companyName = 'SHEQ Street' } = body;

            let generatedSuppliers: any[] = [];
            const apiKey = process.env.GEMINI_API_KEY;

            if (apiKey) {
              try {
                const { GoogleGenAI } = await import('@google/genai');
                const ai = new GoogleGenAI({ apiKey });
                const aiPrompt = `You are an ISO 9001:2015 Quality Management and Approved Supplier List (ASL) expert.
Generate or parse a structured list of ${count} suppliers for an organization (${companyName}).
${industry ? `Target Industry / Domain: ${industry}` : ''}
${prompt ? `Custom user instructions: ${prompt}` : ''}
${
  rawText
    ? `Parse the following raw text or pasted vendor data into structured records:
"""
${rawText}
"""`
    : ''
}

Respond ONLY with a valid JSON array of objects. Do NOT include markdown blocks or code fences.
Each object must have these exact keys:
- "name": string (Supplier Name)
- "address": string (Physical street address and city)
- "division": string (Division, e.g. Raw Materials, Engineering, Logistics, Packaging)
- "category": string (Commodity or Service provided)
- "contactName": string (Contact person name)
- "telNo": string (Telephone number with country/area code, e.g. +27 11 ...)
- "email": string (Valid email address)
- "status": string ("Approved" or "Pending Evaluation")`;

                const resp = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: aiPrompt,
                });

                const text = resp.text || '';
                const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanJson);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  generatedSuppliers = parsed;
                }
              } catch (err) {
                console.warn('[AI GEN SUPPLIERS FALLBACK TRIGGERED]', err);
              }
            }

            if (generatedSuppliers.length === 0) {
              // Intelligent domain fallback
              generatedSuppliers = generateSmartSuppliersFallback({ prompt, industry, rawText, count });
            }

            return sendJson(200, {
              success: true,
              suppliers: generatedSuppliers,
              source: apiKey ? 'gemini' : 'domain-engine',
            });
          }

          if (req.method === 'POST' && url === '/api/ai-extract-document') {
            const body = await readBody();
            const { fileName = '', fileContent = '', companyName = 'SHEQ Street' } = body;

            const apiKey = process.env.GEMINI_API_KEY;
            let extractedData: any = null;

            if (apiKey) {
              try {
                const { GoogleGenAI } = await import('@google/genai');
                const ai = new GoogleGenAI({ apiKey });
                const aiPrompt = `You are an ISO 9001:2015 Quality Management and Document Control specialist.
A user uploaded a document named "${fileName}" for organization "${companyName}".
${fileContent ? `Document text content:\n"""\n${fileContent.slice(0, 3500)}\n"""` : ''}

Extract and structure this into an editable ISO 9001:2015 document template for revision.
Respond ONLY with a valid JSON object (no markdown backticks or code fences):
{
  "title": "Professional, capitalized document title",
  "docNumber": "e.g. NK-SOP-008, NK-WI-006, NK-POL-004, or NK-FRM-010",
  "category": "Policy | Quality Manual | Work Instruction | Form | Register | SOP",
  "clause": "e.g. Clause 7.5 or Clause 8.4",
  "status": "Draft",
  "author": "Quality Assurance Team",
  "approver": "Quality Lead",
  "content": "Full markdown content with sections: # [Title]\\n\\n## 1. Purpose & Objectives\\n...\\n\\n## 2. Scope & Applicability\\n...\\n\\n## 3. Terms & Definitions\\n...\\n\\n## 4. Responsibilities & Authorities\\n...\\n\\n## 5. Procedure & Process Flow\\n...\\n\\n## 6. Records & Documented Information\\n...\\n\\n## 7. Review & Change History\\n..."
}`;

                const resp = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: aiPrompt,
                });

                const text = resp.text || '';
                const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanJson);
                if (parsed && parsed.title) {
                  extractedData = parsed;
                }
              } catch (err) {
                console.warn('[AI EXTRACT DOCUMENT FALLBACK TRIGGERED]', err);
              }
            }

            if (!extractedData) {
              extractedData = generateSmartDocumentFallback({ fileName, fileContent, companyName });
            }

            return sendJson(200, {
              success: true,
              data: extractedData,
              source: apiKey && extractedData ? 'gemini' : 'domain-engine',
            });
          }

          return next();
        } catch (error: any) {
          console.error('[API ERROR]', error);
          return sendJson(500, {
            success: false,
            error: error?.message || 'Internal server error while dispatching email',
          });
        }
      });
    },
  };
}

function generateSmartSuppliersFallback(params: {
  prompt?: string;
  industry?: string;
  rawText?: string;
  count?: number;
}) {
  const { prompt = '', industry = '', rawText = '', count = 4 } = params;

  // Case 1: If raw text is provided, parse it intelligently
  if (rawText && rawText.trim().length > 0) {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.toLowerCase().startsWith('supplier name') && !l.toLowerCase().startsWith('#'));

    const parsedList: any[] = [];

    for (const line of lines) {
      // Split by comma, tab, or pipe
      let parts = line.split(/[,\t|]/).map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 2) {
        const name = parts[0] || 'Supplier ' + (parsedList.length + 1);
        const address = parts[1] || 'Industrial Area, City';
        const division = parts[2] || 'Operations';
        const contactName = parts[3] || 'Account Manager';
        const telNo = parts[4] || '+27 11 ' + Math.floor(1000000 + Math.random() * 9000000);
        const email = parts[5] || `info@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.co.za`;
        const category = parts[6] || division || 'General Services';
        const status = parts[7] || 'Approved';

        parsedList.push({
          name,
          address,
          division,
          contactName,
          telNo,
          email,
          category,
          status,
        });
      } else if (line.length > 3) {
        // Single item per line
        const name = line;
        const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        parsedList.push({
          name,
          address: 'Main Industrial Boulevard, Gauteng',
          division: 'Materials & Services',
          contactName: 'Technical Liaison',
          telNo: '+27 11 820 ' + Math.floor(1000 + Math.random() * 9000),
          email: `orders@${cleanName}.co.za`,
          category: 'Commercial Supplies',
          status: 'Approved',
        });
      }
    }

    if (parsedList.length > 0) {
      return parsedList.slice(0, 20);
    }
  }

  // Case 2: Pre-curated catalog across major ISO 9001 domains
  const library = [
    {
      name: 'Apex Industrial Castings & Forgings',
      address: '14 Foundry Way, Apex Industrial, Benoni',
      division: 'Engineering',
      category: 'Ferrous & Non-Ferrous Castings',
      contactName: 'Martin Du Plessis',
      telNo: '+27 11 894 2200',
      email: 'sales@apexcastings.co.za',
      status: 'Approved',
    },
    {
      name: 'ChemSpec Polymers & Resins Ltd',
      address: '28 Refinery Road, Secunda, Mpumalanga',
      division: 'Raw Materials',
      category: 'Engineering Polymers & Resins',
      contactName: 'Dr. Linda Mthembu',
      telNo: '+27 17 610 3340',
      email: 'technical@chemspec.co.za',
      status: 'Approved',
    },
    {
      name: 'Trans-Kalahari Cold Chain Logistics',
      address: 'Gate 3, City Deep Container Terminal, Johannesburg',
      division: 'Logistics',
      category: 'Refrigerated Transport & Distribution',
      contactName: 'Sipho Khumalo',
      telNo: '+27 11 613 8810',
      email: 'dispatch@tklogistics.co.za',
      status: 'Approved',
    },
    {
      name: 'CorruPack Sustainable Cartons',
      address: '33 Paper Mill Road, Springs, Gauteng',
      division: 'Packaging',
      category: 'FSC-Certified Corrugated Boxes',
      contactName: 'Vanessa Botha',
      telNo: '+27 11 812 7700',
      email: 'orders@corrupack.co.za',
      status: 'Approved',
    },
    {
      name: 'Precision Calibration & Metrology Labs',
      address: '4 Electron Avenue, Isando, Kempton Park',
      division: 'Quality & Testing',
      category: 'SANAS Calibrated Standards & Gauges',
      contactName: 'Bradley Smith',
      telNo: '+27 11 974 5500',
      email: 'lab@precisioncal.co.za',
      status: 'Approved',
    },
    {
      name: 'ShieldFire & Safety Gear International',
      address: '19 Safety Crescent, Maitland, Cape Town',
      division: 'HSE & Facilities',
      category: 'PPE, Arc Flash & Suppression Systems',
      contactName: 'Zainab Solomons',
      telNo: '+27 21 510 4490',
      email: 'orders@shieldfire.co.za',
      status: 'Approved',
    },
    {
      name: 'Delta Automation & Robotics Works',
      address: '15 Robotic Way, Strydompark, Randburg',
      division: 'Engineering',
      category: 'PLC Programming & Sensor Instrumentation',
      contactName: 'Andre Venter',
      telNo: '+27 11 792 1150',
      email: 'service@delta-auto.co.za',
      status: 'Pending Evaluation',
    },
    {
      name: 'BioClean Environmental Waste Disposal',
      address: '52 Chemical Lane, Wadeville, Germiston',
      division: 'Environmental Services',
      category: 'Hazardous Waste & Effluent Processing',
      contactName: 'Nomvula Dlamini',
      telNo: '+27 11 827 9000',
      email: 'enviro@biocleanwaste.co.za',
      status: 'Pending Evaluation',
    },
  ];

  // Shuffle or slice based on count
  const normalizedIndustry = (industry + ' ' + prompt).toLowerCase();
  let matched = library.filter(
    (s) =>
      normalizedIndustry.includes(s.division.toLowerCase()) ||
      normalizedIndustry.includes(s.category.toLowerCase()) ||
      s.category.toLowerCase().includes('raw') ||
      s.category.toLowerCase().includes('engineering')
  );

  if (matched.length < count) {
    matched = library;
  }

  return matched.slice(0, Math.max(1, Math.min(count, library.length)));
}

function generateSmartDocumentFallback(params: {
  fileName?: string;
  fileContent?: string;
  companyName?: string;
}) {
  const { fileName = 'Document', fileContent = '', companyName = 'SHEQ Street' } = params;

  // Clean title from fileName
  const cleanBase = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_.]/g, ' ')
    .trim();

  const titleWords = cleanBase
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const lowerName = (fileName + ' ' + fileContent).toLowerCase();

  let category = 'Policy';
  let clause = 'Clause 7.5';
  let docCode = 'POL';

  if (lowerName.includes('work instruction') || lowerName.includes('sop') || lowerName.includes('procedure')) {
    if (lowerName.includes('sop') || lowerName.includes('procedure')) {
      category = 'SOP';
      docCode = 'SOP';
      clause = 'Clause 7.5';
    } else {
      category = 'Work Instruction';
      docCode = 'WI';
      clause = 'Clause 8.5';
    }
  } else if (lowerName.includes('form') || lowerName.includes('checklist') || lowerName.includes('survey')) {
    category = 'Form';
    docCode = 'FRM';
    clause = 'Clause 9.1';
  } else if (lowerName.includes('register') || lowerName.includes('matrix') || lowerName.includes('log')) {
    category = 'Register';
    docCode = 'REG';
    clause = 'Clause 6.1';
  } else if (lowerName.includes('manual')) {
    category = 'Quality Manual';
    docCode = 'QM';
    clause = 'Clause 4.3 & 4.4';
  } else if (lowerName.includes('audit')) {
    category = 'SOP';
    docCode = 'SOP';
    clause = 'Clause 9.2';
  } else if (lowerName.includes('risk')) {
    category = 'Register';
    docCode = 'REG';
    clause = 'Clause 6.1';
  }

  const prefix = companyName.substring(0, 2).toUpperCase() || 'NK';
  const randomNum = Math.floor(10 + Math.random() * 89);
  const docNumber = `${prefix}-${docCode}-0${randomNum}`;

  const title = titleWords.length > 2 ? titleWords : `${titleWords || 'Controlled'} Standard Operating Procedure`;

  const content = `# ${title}

**Document Number:** ${docNumber}  
**Organization:** ${companyName}  
**Standard:** ISO 9001:2015 Quality Management Systems  
**Controlled Clause:** ${clause}  
**Status:** Draft (Awaiting Final Review & Authorization)  

---

## 1. Purpose & Objectives
The purpose of this controlled document is to formalize and maintain structured standards and standardized operational workflows for **${title}** across all relevant divisions of ${companyName}. This ensures strict compliance with ISO 9001:2015 ${clause}, preventing process variations and safeguarding customer satisfaction.

## 2. Scope & Applicability
This document applies across all operating facilities, personnel, contract service providers, and quality management representatives involved in activities governed by this scope.

## 3. Normative References & Definitions
- **ISO 9001:2015 Quality Management Systems** – Requirements
- **Documented Information:** Information required to be controlled and maintained by the organization and the medium on which it is contained.
- **Continual Improvement:** Recurring activity to enhance process and service performance.

## 4. Roles & Responsibilities
| Role | Assigned Authority & Responsibility |
| :--- | :--- |
| **Top Management / Executive** | Authorizes resources and validates systemic compliance. |
| **Quality Lead / Custodian** | Oversees implementation, routine audits, and document revision control. |
| **Process Owners / Operational Staff** | Executes tasks in strict accordance with instructions outlined herein. |

## 5. Procedure & Operational Protocols
1. **Initiation & Verification:** Prior to commencing activities, responsible personnel must confirm verification parameters against applicable specifications.
2. **Standardized Execution:** Execute operations strictly following the standardized work sequence and safety controls.
3. **Inspection & Acceptance Criteria:** Validate all process checkpoints against predefined non-negotiable tolerance standards.
4. **Non-Conformance Handling:** Any deviation or discrepancy must be quarantined immediately and logged via the Non-Conformance & CAPA protocol.

${fileContent ? `## 6. Imported Source Excerpts\n> Document text parsed from original file:\n\n${fileContent.slice(0, 800)}\n\n` : ''}## 7. Records & Documented Information
All associated records, check sheets, and logs produced through execution of this document shall be retained for a minimum statutory period of 5 years, protected against unauthorized alterations or accidental loss.

## 8. Revision & Approval History
- **Rev 0 (Current):** Initial AI-assisted text extraction and template import for stakeholder review and revision.
`;

  return {
    title,
    docNumber,
    category,
    clause,
    status: 'Draft',
    author: 'Quality Assurance Team',
    approver: 'Quality Lead / Top Management',
    content,
  };
}
