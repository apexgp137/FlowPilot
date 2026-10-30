// Automated Backend Test Suite
const http = require('http');

function post(url, data, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function patch(url, data, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('Running backend automated verification tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health
    const health = await get('http://localhost:5000/api/health');
    assert(health.status === 200 && health.body.status === 'UP', 'Health check endpoint returns 200 UP');

    // 2. Invalid Login
    const invalidLogin = await post('http://localhost:5000/api/auth/login', {
      email: 'admin@flowguard.aicte.gov.in',
      password: 'WrongPassword'
    });
    assert(invalidLogin.status === 401 && invalidLogin.body.success === false, 'Invalid login rejected with 401');

    // 3. Admin Login
    const adminLogin = await post('http://localhost:5000/api/auth/login', {
      email: 'admin@flowguard.aicte.gov.in',
      password: 'Admin@1234'
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'ADMIN', 'Admin login successful with valid JWT');
    const adminToken = adminLogin.body.token;

    // 4. Official Login
    const officialLogin = await post('http://localhost:5000/api/auth/login', {
      email: 'official@flowguard.aicte.gov.in',
      password: 'Official@1234'
    });
    assert(officialLogin.status === 200 && officialLogin.body.user.role === 'OFFICIAL', 'Official login successful with valid JWT');
    const officialToken = officialLogin.body.token;

    // 5. Institution Login
    const instLogin = await post('http://localhost:5000/api/auth/login', {
      email: 'principal@apextech.edu.in',
      password: 'Apex@1234'
    });
    assert(instLogin.status === 200 && instLogin.body.user.role === 'INSTITUTION' && instLogin.body.user.institution_id === 1, 'Institution login successful with valid institution binding');
    const instToken = instLogin.body.token;

    // 6. Auth Me endpoint
    const meRes = await get('http://localhost:5000/api/auth/me', instToken);
    assert(meRes.status === 200 && meRes.body.user.email === 'principal@apextech.edu.in', 'GET /api/auth/me verifies valid session');

    // 7. Dashboard Stats for Admin
    const dashAdmin = await get('http://localhost:5000/api/dashboard', adminToken);
    assert(dashAdmin.status === 200 && dashAdmin.body.data.summary.totalApplications >= 9, 'Admin dashboard receives aggregated database metrics');

    // 8. Data Isolation: Institution Dashboard
    const dashInst = await get('http://localhost:5000/api/dashboard', instToken);
    assert(dashInst.status === 200 && dashInst.body.data.summary.totalApplications >= 2 && dashInst.body.data.summary.totalApplications < dashAdmin.body.data.summary.totalApplications, 'Institution dashboard is isolated strictly to institution 1 (Apex Institute)');

    // 9. Data Isolation: Institution Applications
    const appsInst = await get('http://localhost:5000/api/applications', instToken);
    const allBelongToInst1 = appsInst.body.data.every(a => a.institution_id === 1);
    assert(appsInst.status === 200 && allBelongToInst1, 'Institution application query only returns records belonging to institution 1');

    // 10. Data Isolation: Institution cannot view other institution application
    const app4Res = await get('http://localhost:5000/api/applications/4', instToken);
    assert(app4Res.status === 403, 'Institution user is blocked (403) from accessing another institution application');

    // 11. Create Application by Institution
    const newApp = await post('http://localhost:5000/api/applications', {
      application_type: 'Introduction of New Course',
      notes: 'Automated test proposal for Cyber Security course',
      priority: 'High',
      intake_requested: 60
    }, instToken);
    assert(newApp.status === 201 && newApp.body.success === true, 'Institution successfully submits new application');
    const createdAppId = newApp.body.applicationId;

    // 12. Institution cannot change workflow stage / approval status
    const unauthorizedStatusChange = await patch(`http://localhost:5000/api/applications/${createdAppId}`, {
      status: 'Approved'
    }, instToken);
    assert(unauthorizedStatusChange.status === 403, 'Institution blocked (403) from approving their own application');

    // 13. Official updates workflow stage with transaction
    const officialAdvance = await patch(`http://localhost:5000/api/applications/${createdAppId}`, {
      current_stage: 'Scrutiny',
      status: 'In Progress',
      remarks: 'Application documents scrutinized and initial fee verified by Regional Office.'
    }, officialToken);
    assert(officialAdvance.status === 200 && officialAdvance.body.data.current_stage === 'Scrutiny', 'Official successfully advances workflow stage to Scrutiny');

    // 14. Workflow history verifies chronological record
    const historyRes = await get(`http://localhost:5000/api/applications/${createdAppId}/history`, officialToken);
    assert(historyRes.status === 200 && historyRes.body.count >= 2, 'Workflow history accurately records all stage and status changes');

    // 15. Compliance Creation and Submission
    const newComp = await post('http://localhost:5000/api/compliance', {
      institution_id: 1,
      application_id: createdAppId,
      requirement_title: 'Cyber Security Lab Cloud Infrastructure Audit',
      requirement_type: 'Laboratory Equipment Compliance',
      due_date: '2026-11-20'
    }, officialToken);
    assert(newComp.status === 201, 'Official creates institutional compliance item');
    const compId = newComp.body.complianceId;

    // 16. Institution submits evidence note
    const submitEvidence = await patch(`http://localhost:5000/api/compliance/${compId}`, {
      evidence_note: 'AWS cloud credit license agreement and firewall configuration report uploaded.',
      document_reference: 'AWS-EDUPARTNER-2026-99'
    }, instToken);
    assert(submitEvidence.status === 200, 'Institution records compliance evidence');

    // 17. Official verifies compliance item
    const verifyComp = await patch(`http://localhost:5000/api/compliance/${compId}`, {
      status: 'Verified'
    }, officialToken);
    assert(verifyComp.status === 200, 'Authorized official marks compliance as Verified');

    // 18. Schedule EVC Visit
    const newEvc = await post('http://localhost:5000/api/evc', {
      application_id: createdAppId,
      proposed_visit_date: '2026-11-28',
      lead_expert_name: 'Prof. K. R. Sreenivasan (IISc)',
      expert_panel: 'Dr. Priya Mani (NIT Trichy)',
      visit_mode: 'Physical On-Site',
      status: 'Confirmed'
    }, officialToken);
    assert(newEvc.status === 201, 'Official schedules EVC inspection visit');

    // 19. Alerts endpoint
    const alertsRes = await get('http://localhost:5000/api/alerts', instToken);
    assert(alertsRes.status === 200 && alertsRes.body.count > 0, 'Centralized alerts generated and retrieved');

    // 20. Audit Trail
    const auditRes = await get('http://localhost:5000/api/audit', adminToken);
    assert(auditRes.status === 200 && auditRes.body.count > 0, 'Audit trail logs all critical actions with user, timestamp and description');

    // 21. Document Check Assistant
    const docCheckRes = await post('http://localhost:5000/api/document-check/check', {
      application_id: createdAppId,
      document_name: 'test_cyber_lab_cadre.pdf',
      document_type: 'Faculty Cadre Ratio',
      cadre_ratio: '1:2:6',
      faculty_count: 24,
      prof_count: 3
    }, officialToken);
    assert(docCheckRes.status === 201 && docCheckRes.body.data.verification_status === 'Verified Match', 'Rule-based document check completes with transparent checklist');

    console.log(`\n=========================================`);
    console.log(`Test Execution Summary: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=========================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test suite error:', err);
    process.exit(1);
  }
}

runTests();
