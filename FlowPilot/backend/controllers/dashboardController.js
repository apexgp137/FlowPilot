const pool = require('../db');

exports.getDashboardStats = async (req, res) => {
  try {
    const isInstitution = req.user.role === 'INSTITUTION';
    const instId = isInstitution ? req.user.institution_id : null;

    // 1. Core Summary Metrics
    let appWhere = isInstitution ? 'WHERE institution_id = ?' : '';
    let appParams = isInstitution ? [instId] : [];

    let compWhere = isInstitution ? 'WHERE institution_id = ?' : '';
    let compParams = isInstitution ? [instId] : [];

    let evcWhere = isInstitution ? 'WHERE institution_id = ?' : '';
    let evcParams = isInstitution ? [instId] : [];

    // Applications counts
    const [appCounts] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
         SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
         SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected,
         SUM(CASE WHEN status = 'Returned' THEN 1 ELSE 0 END) AS returned,
         SUM(CASE WHEN priority = 'High' AND status IN ('Pending', 'In Progress', 'Returned') THEN 1 ELSE 0 END) AS high_priority_count
       FROM applications ${appWhere}`,
      appParams
    );

    // Compliance counts
    const [compCounts] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) AS submitted,
         SUM(CASE WHEN status = 'Verified' THEN 1 ELSE 0 END) AS verified,
         SUM(CASE WHEN status = 'Overdue' OR (due_date < CURRENT_DATE() AND status != 'Verified') THEN 1 ELSE 0 END) AS overdue
       FROM compliance_items ${compWhere}`,
      compParams
    );

    // EVC counts
    const [evcCounts] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN proposed_visit_date >= CURRENT_DATE() AND status IN ('Proposed', 'Confirmed') THEN 1 ELSE 0 END) AS upcoming,
         SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed
       FROM evc_visits ${evcWhere}`,
      evcParams
    );

    // Institutions count (for admin/official)
    let totalInstitutions = 1;
    if (!isInstitution) {
      const [instCount] = await pool.query('SELECT COUNT(*) AS total FROM institutions');
      totalInstitutions = instCount[0].total || 0;
    }

    // 2. Status Distribution (for charts)
    const [statusDist] = await pool.query(
      `SELECT status, COUNT(*) AS count
       FROM applications ${appWhere}
       GROUP BY status`,
      appParams
    );

    // 3. Stage Distribution (for charts)
    const [stageDist] = await pool.query(
      `SELECT current_stage AS stage, COUNT(*) AS count
       FROM applications ${appWhere}
       GROUP BY current_stage`,
      appParams
    );

    // 4. Compliance Distribution (for charts)
    const [complianceDist] = await pool.query(
      `SELECT
         CASE
           WHEN due_date < CURRENT_DATE() AND status != 'Verified' THEN 'Overdue'
           ELSE status
         END AS status_group,
         COUNT(*) AS count
       FROM compliance_items ${compWhere}
       GROUP BY status_group`,
      compParams
    );

    // 5. Recent Applications
    let recentAppsQuery = `
      SELECT a.id, a.reference_no, a.application_type, a.current_stage, a.status,
             a.priority, a.submission_date, a.due_date, i.name AS institution_name
      FROM applications a
      JOIN institutions i ON a.institution_id = i.id
    `;
    if (isInstitution) {
      recentAppsQuery += ' WHERE a.institution_id = ?';
    }
    recentAppsQuery += ' ORDER BY a.created_at DESC LIMIT 5';
    const [recentApplications] = await pool.query(recentAppsQuery, appParams);

    // 6. Overdue Compliance Items
    let overdueCompQuery = `
      SELECT c.id, c.requirement_title, c.requirement_type, c.due_date, c.status,
             i.name AS institution_name
      FROM compliance_items c
      JOIN institutions i ON c.institution_id = i.id
      WHERE (c.status = 'Overdue' OR (c.due_date < CURRENT_DATE() AND c.status != 'Verified'))
    `;
    if (isInstitution) {
      overdueCompQuery += ' AND c.institution_id = ?';
    }
    overdueCompQuery += ' ORDER BY c.due_date ASC LIMIT 5';
    const [overdueCompliance] = await pool.query(overdueCompQuery, compParams);

    // 7. Upcoming EVC Visits
    let upcomingEvcQuery = `
      SELECT ev.id, ev.proposed_visit_date, ev.visit_mode, ev.status, ev.lead_expert_name,
             a.reference_no AS application_ref, i.name AS institution_name
      FROM evc_visits ev
      JOIN applications a ON ev.application_id = a.id
      JOIN institutions i ON ev.institution_id = i.id
      WHERE ev.proposed_visit_date >= CURRENT_DATE() AND ev.status NOT IN ('Completed', 'Cancelled')
    `;
    if (isInstitution) {
      upcomingEvcQuery += ' AND ev.institution_id = ?';
    }
    upcomingEvcQuery += ' ORDER BY ev.proposed_visit_date ASC LIMIT 5';
    const [upcomingVisits] = await pool.query(upcomingEvcQuery, evcParams);

    // 8. Recent Workflow Activity
    let activityQuery = `
      SELECT wh.id, wh.previous_stage, wh.new_stage, wh.previous_status, wh.new_status,
             wh.remarks, wh.created_at, a.reference_no, i.name AS institution_name,
             u.name AS actor_name, u.role AS actor_role
      FROM workflow_history wh
      JOIN applications a ON wh.application_id = a.id
      JOIN institutions i ON a.institution_id = i.id
      JOIN users u ON wh.changed_by = u.id
    `;
    if (isInstitution) {
      activityQuery += ' WHERE a.institution_id = ?';
    }
    activityQuery += ' ORDER BY wh.created_at DESC LIMIT 6';
    const [recentActivities] = await pool.query(activityQuery, appParams);

    // Compile complete statistics payload
    const data = {
      summary: {
        totalApplications: Number(appCounts[0].total) || 0,
        pendingApplications: Number(appCounts[0].pending) || 0,
        inProgressApplications: Number(appCounts[0].in_progress) || 0,
        approvedApplications: Number(appCounts[0].approved) || 0,
        rejectedApplications: Number(appCounts[0].rejected) || 0,
        returnedApplications: Number(appCounts[0].returned) || 0,
        highPriorityApplications: Number(appCounts[0].high_priority_count) || 0,
        totalCompliance: Number(compCounts[0].total) || 0,
        pendingCompliance: (Number(compCounts[0].pending) || 0) + (Number(compCounts[0].submitted) || 0),
        overdueCompliance: Number(compCounts[0].overdue) || 0,
        upcomingVisits: Number(evcCounts[0].upcoming) || 0,
        totalInstitutions
      },
      charts: {
        statusDistribution: statusDist.map(s => ({ name: s.status, count: Number(s.count) })),
        stageDistribution: stageDist.map(s => ({ name: s.stage, count: Number(s.count) })),
        complianceDistribution: complianceDist.map(c => ({ name: c.status_group, count: Number(c.count) }))
      },
      recentApplications,
      overdueCompliance,
      upcomingVisits,
      recentActivities
    };

    return res.json({ success: true, data });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard statistics.' });
  }
};
