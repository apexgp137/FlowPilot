-- AICTE FlowGuard - Fictional Demonstration Seed Data
-- Fictional records for demonstration and testing purposes only.

USE aicte_flowguard;

-- Disable foreign key checks for clean re-seeding
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE alerts;
TRUNCATE TABLE evc_visits;
TRUNCATE TABLE compliance_items;
TRUNCATE TABLE workflow_history;
TRUNCATE TABLE document_checks;
TRUNCATE TABLE applications;
TRUNCATE TABLE users;
TRUNCATE TABLE institutions;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. INSTITUTIONS (Fictional Demonstration Institutes)
INSERT INTO institutions (id, institution_code, name, category, state, city, address, pincode, contact_email, contact_phone, established_year, status) VALUES
(1, '1-10928371', 'Apex Institute of Technology & Management', 'Engineering & Technology', 'Karnataka', 'Bengaluru', 'Plot 42, Electronic City Phase 1', '560100', 'principal@apextech.edu.in', '+91 80 2852 9001', 2008, 'Active'),
(2, '1-20839401', 'Karnataka Technical Academy of Engineering', 'Engineering & Technology', 'Karnataka', 'Mysuru', 'Ring Road Junction, Hebbal Industrial Area', '570016', 'director@karnatakatrust.edu.in', '+91 821 2419 880', 2012, 'Active'),
(3, '1-30492811', 'Bharat Institute of Science & Research', 'Engineering & Management', 'Maharashtra', 'Pune', 'Survey 88, Hinjawadi Phase 2', '411057', 'dean@bharatinstitute.edu.in', '+91 20 6688 1234', 2005, 'Active'),
(4, '1-40918274', 'National Academy of Applied Technology', 'Applied Sciences & Tech', 'Delhi', 'New Delhi', 'Institutional Area, Sector 9, Dwarka', '110077', 'registrar@naat-delhi.ac.in', '+91 11 2803 4400', 2015, 'Active'),
(5, '1-50827361', 'Vanguard School of Architecture & Planning', 'Architecture & Planning', 'Tamil Nadu', 'Chennai', 'Old Mahabalipuram Road, Navalur', '603103', 'head@vanguardarch.edu.in', '+91 44 4740 5500', 2018, 'Active'),
(6, '1-60719283', 'Deccan College of Pharmaceutical Sciences', 'Pharmacy', 'Telangana', 'Hyderabad', 'Gachibowli Knowledge City', '500032', 'info@deccanpharma.ac.in', '+91 40 2300 8900', 2014, 'Active');

-- 2. USERS (Fictional Demo Accounts)
-- Passwords:
-- Admin: Admin@1234
-- Official: Official@1234
-- Apex Tech Principal: Apex@1234
-- Karnataka Tech Director: KTech@1234
-- Bharat Institute Dean: Bharat@1234
INSERT INTO users (id, name, email, password, role, institution_id, designation, phone, is_active) VALUES
(1, 'Dr. Rajesh Sharma', 'admin@flowguard.aicte.gov.in', '$2a$10$F/PDyIW0dTlB3FZpkwnjm.yKKtzA4YfannD9MUChR7vVKd.ScsmXe', 'ADMIN', NULL, 'Chief Approval Director & Superadmin', '+91 11 2958 1000', 1),
(2, 'Dr. Sunita Deshmukh', 'official@flowguard.aicte.gov.in', '$2a$10$KsTmQIdNFyxlAzsjtto7qumnQ.L3KHvVTP1.8YBwwR2PhEBuk0d9G', 'OFFICIAL', NULL, 'Senior Regional Scrutiny Officer', '+91 11 2958 1022', 1),
(3, 'Prof. Arvind Nambiar', 'scrutiny.lead@flowguard.aicte.gov.in', '$2a$10$KsTmQIdNFyxlAzsjtto7qumnQ.L3KHvVTP1.8YBwwR2PhEBuk0d9G', 'OFFICIAL', NULL, 'EVC Committee Coordinator', '+91 11 2958 1035', 1),
(4, 'Dr. K. S. Ramanujam', 'principal@apextech.edu.in', '$2a$10$JooGGzzd9aH0Ad/WJt/i1ONot1CK/k.vzdjrTtNCNUO7yDZBEIbw2', 'INSTITUTION', 1, 'Principal, Apex Institute', '+91 80 2852 9005', 1),
(5, 'Dr. Meenakshi Rao', 'director@karnatakatrust.edu.in', '$2a$10$bHIKOER9r1csplhHWemiyOIggQnAGlBebnqXS3cyt3nkZRdRH7YEG', 'INSTITUTION', 2, 'Director, Karnataka Technical Academy', '+91 821 2419 885', 1),
(6, 'Prof. Vinod Patil', 'dean@bharatinstitute.edu.in', '$2a$10$pG/NJN/7VKzBx7gwEKBmXewNFBTENgphFLLoPe9eV8u4Bgdv3FIbS', 'INSTITUTION', 3, 'Dean Academic Affairs, Bharat Institute', '+91 20 6688 1240', 1);

-- 3. APPLICATIONS
INSERT INTO applications (id, reference_no, institution_id, application_type, academic_year, workflow_route, current_stage, status, priority, submission_date, due_date, program_level, intake_requested, notes, created_by) VALUES
(1, 'AICTE-2026-APP-1001', 1, 'Extension of Approval (EoA)', '2026-2027', 'Standard Bureau Review', 'Scrutiny', 'In Progress', 'High', '2026-09-15', '2026-11-05', 'Undergraduate', 480, 'Annual EoA submission with minor syllabus revisions and faculty updates.', 4),
(2, 'AICTE-2026-APP-1002', 1, 'Introduction of New Course', '2026-2027', 'Special Expert Review', 'EVC / Review', 'Pending', 'High', '2026-09-20', '2026-11-12', 'Undergraduate', 60, 'Proposal for B.Tech in Artificial Intelligence & Machine Learning (60 seats). Laboratory ready.', 4),
(3, 'AICTE-2026-APP-1003', 2, 'Increase in Intake', '2026-2027', 'Standard Bureau Review', 'SAC/SHC', 'In Progress', 'Medium', '2026-08-25', '2026-10-30', 'Undergraduate', 120, 'Request to increase Computer Science intake from 120 to 180 seats. Additional block constructed.', 5),
(4, 'AICTE-2026-APP-1004', 3, 'Extension of Approval (EoA)', '2026-2027', 'Standard Bureau Review', 'Final Decision', 'In Progress', 'Medium', '2026-08-10', '2026-10-25', 'Postgraduate', 360, 'Routine MBA and MCA accreditation extension.', 6),
(5, 'AICTE-2026-APP-1005', 4, 'Change of Site/Location', '2026-2027', 'Comprehensive Review', 'Returned for Deficiency', 'Returned', 'High', '2026-09-01', '2026-10-15', 'Undergraduate', 300, 'Land ownership conversion certificate was incomplete in initial submission.', 1),
(6, 'AICTE-2026-APP-1006', 5, 'Closure of Course', '2026-2027', 'Administrative Fast-Track', 'Completed', 'Approved', 'Low', '2026-07-15', '2026-09-30', 'Undergraduate', 0, 'Phasing out Diploma in Civil Drafting due to low student admissions over last 3 cycles.', 1),
(7, 'AICTE-2026-APP-1007', 6, 'New Technical Institute', '2026-2027', 'Comprehensive Review', 'Submitted', 'Pending', 'High', '2026-10-05', '2026-12-01', 'Undergraduate', 240, 'Application for establishment of new campus wing with pharmacy research center.', 1),
(8, 'AICTE-2026-APP-1008', 2, 'Extension of Approval (EoA)', '2026-2027', 'Standard Bureau Review', 'Completed', 'Approved', 'Low', '2026-06-20', '2026-08-15', 'Undergraduate', 420, 'Complied with all mandatory AICTE quality disclosure mandates.', 5),
(9, 'AICTE-2026-APP-1009', 3, 'Increase in Intake', '2026-2027', 'Standard Bureau Review', 'Completed', 'Rejected', 'Medium', '2026-06-05', '2026-07-30', 'Postgraduate', 60, 'Rejected due to inadequate Cadre ratio of Professors in Data Analytics department.', 6);

-- 4. WORKFLOW HISTORY
INSERT INTO workflow_history (application_id, previous_stage, new_stage, previous_status, new_status, action_type, changed_by, remarks, created_at) VALUES
(1, 'Submitted', 'Scrutiny', 'Pending', 'In Progress', 'SCRUTINY_STARTED', 2, 'Application verified by regional bureau. Initial fee and documentation confirmed.', '2026-09-18 10:30:00'),
(2, 'Submitted', 'Scrutiny', 'Pending', 'In Progress', 'SCRUTINY_COMPLETED', 2, 'Curriculum structure and laboratory space blueprints reviewed. Recommended for on-site EVC inspection.', '2026-09-25 14:15:00'),
(2, 'Scrutiny', 'EVC / Review', 'In Progress', 'Pending', 'EVC_RECOMMENDED', 2, 'Application advanced to EVC scheduling stage for technical verification.', '2026-09-28 11:00:00'),
(3, 'Submitted', 'Scrutiny', 'Pending', 'In Progress', 'STAGE_ADVANCE', 2, 'Scrutiny completed successfully. All infrastructure norms met.', '2026-09-02 09:45:00'),
(3, 'Scrutiny', 'EVC / Review', 'In Progress', 'In Progress', 'EVC_CONDUCTED', 3, 'EVC inspection completed on-site. Panel recommended positive consideration.', '2026-09-18 16:30:00'),
(3, 'EVC / Review', 'SAC/SHC', 'In Progress', 'In Progress', 'STANDING_COMMITTEE', 1, 'Placed before Standing Appellate Committee for intake clearance.', '2026-10-05 15:00:00'),
(4, 'Submitted', 'Scrutiny', 'Pending', 'In Progress', 'SCRUTINY_PASS', 2, 'Basic scrutiny passed without observations.', '2026-08-15 11:20:00'),
(4, 'Scrutiny', 'EVC / Review', 'In Progress', 'In Progress', 'EVC_WAIVED', 1, 'EVC inspection waived based on 5-year clean track record and valid NBA accreditation.', '2026-08-28 14:00:00'),
(4, 'EVC / Review', 'SAC/SHC', 'In Progress', 'In Progress', 'STAGE_ADVANCE', 1, 'Forwarded for final approval signature.', '2026-09-20 10:00:00'),
(4, 'SAC/SHC', 'Final Decision', 'In Progress', 'In Progress', 'STAGE_ADVANCE', 1, 'Final deliberation by Competent Authority in progress.', '2026-10-10 12:00:00'),
(5, 'Submitted', 'Scrutiny', 'Pending', 'In Progress', 'SCRUTINY_CHECK', 2, 'Discrepancy noted in land deed survey numbers. Notifying institution.', '2026-09-08 16:00:00'),
(5, 'Scrutiny', 'Returned for Deficiency', 'In Progress', 'Returned', 'DEFICIENCY_ISSUED', 2, 'Returned to institution for submission of corrected encumbrance certificate from sub-registrar.', '2026-09-12 11:45:00'),
(6, 'Submitted', 'Completed', 'Pending', 'Approved', 'APPROVAL_GRANTED', 1, 'Formal approval order issued for closure of course with student redeployment safeguards.', '2026-08-20 15:30:00'),
(8, 'Submitted', 'Completed', 'Pending', 'Approved', 'APPROVAL_GRANTED', 1, 'Extension of Approval for academic year 2026-27 granted.', '2026-07-28 16:00:00'),
(9, 'Submitted', 'Completed', 'Pending', 'Rejected', 'REJECTION_RECORDED', 1, 'Application rejected due to failure to meet Cadre Ratio requirements per AICTE Approval Process Handbook.', '2026-07-25 14:10:00');

-- 5. COMPLIANCE ITEMS
INSERT INTO compliance_items (id, institution_id, application_id, requirement_title, requirement_type, description, due_date, status, evidence_note, document_reference, assigned_to, verified_by, verified_at) VALUES
(1, 1, 1, 'Fire Safety & Rescue Services NOC Renewal', 'Fire Safety NOC', 'Submission of valid Fire Safety Clearance certificate from State Fire & Emergency Department.', '2026-10-22', 'Overdue', 'NOC renewal applied at department; awaiting final inspection receipt.', 'NOC/KA/BLR/2026-88', 4, NULL, NULL),
(2, 1, 1, 'Faculty Cadre Ratio Disclosure Form (1:2:6)', 'Faculty Cadre Ratio', 'Mandatory faculty ratio submission across departments as per AICTE Regulation norms.', '2026-11-04', 'Submitted', 'Uploaded audited faculty payroll and form 16 references for Q2.', 'DOC-REF-FCR-2026-1A', 4, NULL, NULL),
(3, 1, 2, 'AI & Robotics Lab Setup Equipment Audit', 'Laboratory Equipment Compliance', 'Verification of GPU workstations, edge computing kits, and software licenses.', '2026-11-10', 'Pending', 'Procurement purchase orders released to vendor. Delivery scheduled.', 'PO-APEX-2026-ROBO', 4, NULL, NULL),
(4, 2, 3, 'Structural Stability Certificate (Civil Eng Dept)', 'Building Stability Certificate', 'Structural engineer certification for newly constructed Block-C third floor.', '2026-10-29', 'Submitted', 'Signed endorsement by empanelled chartered structural engineer submitted.', 'STAB-MY-2026-778', 5, 2, '2026-10-25 11:30:00'),
(5, 2, 3, 'Anti-Ragging Committee & Squad Constitution', 'Anti-Ragging Committee', 'Affidavits from students/parents and updated committee notice board display photos.', '2026-11-15', 'Verified', 'All student affidavits collected digitally via National Anti-Ragging portal.', 'AR-2026-KTA-PORTAL', 5, 2, '2026-10-15 10:00:00'),
(6, 3, 4, 'Online Student Grievance Redressal Portal (Ombudsman)', 'Grievance Redressal Portal', 'Appointment of retired judge / academician as ombudsman and functional complaint portal.', '2026-10-20', 'Overdue', 'Portal URL active, waiting for state ombudsman appointment order copy.', 'PORTAL-PUNE-881', 6, NULL, NULL),
(7, 3, 4, 'Land Title & Non-Encumbrance Certificate', 'Land Title & Encumbrance', 'Verification of contiguous campus land parcel without any disputed commercial mortgages.', '2026-11-08', 'Verified', 'Certified by District Collector revenue authority with geo-fencing maps.', 'LAND-REV-PUNE-2026', 6, 1, '2026-10-12 17:00:00'),
(8, 4, 5, 'Contiguous Campus Land Conversion Order', 'Land Title & Encumbrance', 'Submission of commercial institutional land use permission order from DDA.', '2026-10-18', 'Overdue', 'Document previously rejected due to expired validity period.', 'DDA-ORDER-REJ-44', 1, NULL, NULL),
(9, 5, 6, 'Faculty Reallocation Undertaking for Closed Courses', 'Faculty Cadre Ratio', 'Notarized undertaking guaranteeing no unlawful retrenchment of full-time teachers.', '2026-08-10', 'Verified', 'All 8 affected faculty absorbed into allied architecture studios.', 'UNDERTAKE-TN-2026', 1, 1, '2026-08-15 12:00:00');

-- 6. EVC VISITS
INSERT INTO evc_visits (id, application_id, institution_id, proposed_visit_date, lead_expert_name, expert_panel, visit_mode, status, visit_notes, report_summary, scheduled_by) VALUES
(1, 2, 1, '2026-11-05', 'Prof. B. K. Murthy (IIT Madras)', 'Prof. K. Venkatesh (IISc Bangalore), Dr. Sudha Nair (Anna Univ)', 'Physical On-Site', 'Confirmed', 'Physical inspection of high-performance computing laboratory, library volumes, and faculty interviews for AI course.', 'Panel constitution approved by Bureau. Logistics confirmed with Apex Institute.', 3),
(2, 3, 2, '2026-09-16', 'Dr. Ramesh Chandra (NIT Surathkal)', 'Prof. S. Joshi (VJTI Mumbai)', 'Physical On-Site', 'Completed', 'Verification of classroom space and computer ratio for 60 additional CSE seats.', 'Committee recommended grant of approval with condition of appointing 1 additional professor within 90 days.', 3),
(3, 7, 6, '2026-11-20', 'Dr. Anand Swaminathan (BITS Pilani)', 'Dr. Pradeep Roy (NIPER Hyderabad)', 'Physical On-Site', 'Proposed', 'Initial preliminary inspection for establishment of new pharmacy research institute.', 'Awaiting confirmation of travel itinerary from experts.', 2),
(4, 1, 1, '2026-10-15', 'Prof. M. C. Govil (NIT Sikkim)', 'Dr. Anjali Patil (COEP)', 'Virtual / Online EVC', 'Rescheduled', 'Virtual scrutiny of documentation. Rescheduled on institute request due to semester exam schedule.', 'Rescheduled to November window.', 3);

-- 7. ALERTS
INSERT INTO alerts (id, title, category, institution_id, application_id, compliance_id, evc_id, due_date, priority, is_read, read_at) VALUES
(1, 'Fire Safety & Rescue NOC is OVERDUE', 'Compliance Overdue', 1, 1, 1, NULL, '2026-10-22', 'Critical', 0, NULL),
(2, 'Upcoming EVC Visit: Apex Institute AI Laboratory Inspection', 'Upcoming EVC', 1, 2, NULL, 1, '2026-11-05', 'High', 0, NULL),
(3, 'Faculty Cadre Ratio Form Submission Due in 8 Days', 'Compliance Deadline', 1, 1, 2, NULL, '2026-11-04', 'Medium', 0, NULL),
(4, 'Online Student Grievance Portal Compliance is OVERDUE', 'Compliance Overdue', 3, 4, 6, NULL, '2026-10-20', 'High', 0, NULL),
(5, 'Application AICTE-2026-APP-1003 Pending SAC/SHC Decision', 'Workflow Action Pending', 2, 3, NULL, NULL, '2026-10-30', 'High', 0, NULL),
(6, 'Application AICTE-2026-APP-1005 Returned for Land Deed Deficiency', 'Workflow Action Pending', 4, 5, NULL, NULL, '2026-10-15', 'Critical', 0, NULL),
(7, 'AICTE Annual Approval Process Portal Window 2026-27 Active', 'General Notice', NULL, NULL, NULL, NULL, '2026-11-30', 'Low', 1, '2026-10-26 09:00:00');

-- 8. AUDIT LOGS
INSERT INTO audit_logs (id, user_id, user_email, user_role, action_type, entity_type, entity_id, description, ip_address, created_at) VALUES
(1, 1, 'admin@flowguard.aicte.gov.in', 'ADMIN', 'SYSTEM_INIT', 'DATABASE', 'INIT-01', 'Database initialized and seeded with baseline administrative records.', '127.0.0.1', '2026-09-01 08:00:00'),
(2, 4, 'principal@apextech.edu.in', 'INSTITUTION', 'LOGIN', 'AUTH', 'USER-4', 'Institution user authenticated successfully from institutional IP.', '106.51.22.84', '2026-09-15 09:12:00'),
(3, 4, 'principal@apextech.edu.in', 'INSTITUTION', 'CREATE_APPLICATION', 'APPLICATION', 'AICTE-2026-APP-1001', 'Created application for Extension of Approval (EoA) 2026-27.', '106.51.22.84', '2026-09-15 09:30:00'),
(4, 2, 'official@flowguard.aicte.gov.in', 'OFFICIAL', 'LOGIN', 'AUTH', 'USER-2', 'Scrutiny officer logged in to regional review dashboard.', '14.139.12.5', '2026-09-18 10:15:00'),
(5, 2, 'official@flowguard.aicte.gov.in', 'OFFICIAL', 'UPDATE_STAGE', 'APPLICATION', 'AICTE-2026-APP-1001', 'Transitioned application from Submitted to Scrutiny stage.', '14.139.12.5', '2026-09-18 10:30:00'),
(6, 4, 'principal@apextech.edu.in', 'INSTITUTION', 'CREATE_APPLICATION', 'APPLICATION', 'AICTE-2026-APP-1002', 'Created application for Introduction of New Course: AI & Machine Learning.', '106.51.22.84', '2026-09-20 11:20:00'),
(7, 3, 'scrutiny.lead@flowguard.aicte.gov.in', 'OFFICIAL', 'SCHEDULE_EVC', 'EVC_VISIT', 'EVC-1', 'Scheduled physical EVC inspection for Apex Institute on 2026-11-05.', '14.139.12.18', '2026-09-28 11:30:00'),
(8, 2, 'official@flowguard.aicte.gov.in', 'OFFICIAL', 'VERIFY_COMPLIANCE', 'COMPLIANCE', 'COMP-5', 'Verified Anti-Ragging Committee compliance for Karnataka Technical Academy.', '14.139.12.5', '2026-10-15 10:00:00'),
(9, 1, 'admin@flowguard.aicte.gov.in', 'ADMIN', 'UPDATE_STATUS', 'APPLICATION', 'AICTE-2026-APP-1006', 'Approved application for course closure following council resolution.', '127.0.0.1', '2026-08-20 15:30:00');

-- 9. DOCUMENT CHECKS (Assistance Demonstration)
INSERT INTO document_checks (id, application_id, document_name, document_type, extracted_metadata, rule_results, passed_checks, total_checks, findings, verification_status, reviewed_by) VALUES
(1, 1, 'apex_institute_faculty_cadre_2026.pdf', 'Faculty Cadre Ratio', 
  '{"institute_code": "1-10928371", "cadre_ratio_found": "1:2:6", "total_professors": 12, "total_associate": 24, "total_assistant": 72, "cadre_ratio_valid": true, "phd_qualified": 28}',
  '[{"check": "Cadre Ratio 1:2:6", "status": "PASS", "detail": "Cadre ratio meets AICTE Approval Process Handbook Table 7.1"}, {"check": "Principal / Director Qualification", "status": "PASS", "detail": "Ph.D. in relevant discipline with >15 years experience"}, {"check": "Faculty Cadre Completeness", "status": "PASS", "detail": "All 108 faculty entries have authenticated Aadhaar/PAN mapping"}]',
  3, 3, 'All automated structural checks passed. Recommended for official verification sign-off.', 'Verified Match', 2),
(2, 5, 'national_academy_land_title_deed.pdf', 'Land Title & Encumbrance', 
  '{"institute_code": "1-40918274", "land_area_acres": "4.2", "classification": "Institutional", "encumbrance_status": "Contingent Liability", "sub_registrar_stamp": "Expired"}',
  '[{"check": "Contiguous Land Area >= 2.5 Acres", "status": "PASS", "detail": "Area is 4.2 acres in urban classification"}, {"check": "Unencumbered Ownership", "status": "FAIL", "detail": "Sub-registrar non-encumbrance certificate is older than 6 months"}, {"check": "Land Use Conversion Certificate", "status": "FAIL", "detail": "Pending conversion seal from District Magistrate"}]',
  1, 3, 'Critical discrepancy in non-encumbrance certificate freshness and local authority land use conversion order.', 'Discrepancy Found', 2);
