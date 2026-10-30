-- AICTE FlowGuard - Database Schema
-- Compatible with MySQL 8.x and MySQL 9.x

CREATE DATABASE IF NOT EXISTS aicte_flowguard
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aicte_flowguard;

-- 1. INSTITUTIONS TABLE
CREATE TABLE IF NOT EXISTS institutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  institution_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'Engineering & Technology',
  state VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT,
  pincode VARCHAR(10),
  contact_email VARCHAR(150) NOT NULL,
  contact_phone VARCHAR(20),
  established_year INT,
  status ENUM('Active', 'Inactive', 'Under Review') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_institution_state (state),
  INDEX idx_institution_status (status)
) ENGINE=InnoDB;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'OFFICIAL', 'INSTITUTION') NOT NULL,
  institution_id INT NULL,
  designation VARCHAR(150),
  phone VARCHAR(30),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_institution FOREIGN KEY (institution_id)
    REFERENCES institutions(id) ON DELETE SET NULL,
  INDEX idx_user_role (role),
  INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 3. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_no VARCHAR(50) NOT NULL UNIQUE,
  institution_id INT NOT NULL,
  application_type VARCHAR(100) NOT NULL,
  academic_year VARCHAR(20) DEFAULT '2026-2027',
  workflow_route VARCHAR(100) DEFAULT 'Standard Bureau Review',
  current_stage ENUM(
    'Submitted',
    'Scrutiny',
    'EVC / Review',
    'SAC/SHC',
    'Final Decision',
    'Completed',
    'Returned for Deficiency'
  ) NOT NULL DEFAULT 'Submitted',
  status ENUM(
    'Pending',
    'In Progress',
    'Returned',
    'Approved',
    'Rejected'
  ) NOT NULL DEFAULT 'Pending',
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  submission_date DATE NOT NULL,
  due_date DATE NOT NULL,
  program_level VARCHAR(50) DEFAULT 'Undergraduate',
  intake_requested INT DEFAULT 0,
  notes TEXT,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_app_institution FOREIGN KEY (institution_id)
    REFERENCES institutions(id) ON DELETE RESTRICT,
  CONSTRAINT fk_app_creator FOREIGN KEY (created_by)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_app_status (status),
  INDEX idx_app_stage (current_stage),
  INDEX idx_app_priority (priority),
  INDEX idx_app_due_date (due_date)
) ENGINE=InnoDB;

-- 4. WORKFLOW HISTORY TABLE
CREATE TABLE IF NOT EXISTS workflow_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  previous_stage VARCHAR(50),
  new_stage VARCHAR(50) NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  action_type VARCHAR(100) DEFAULT 'STAGE_TRANSITION',
  changed_by INT NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wf_app FOREIGN KEY (application_id)
    REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_wf_user FOREIGN KEY (changed_by)
    REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_wf_app (application_id),
  INDEX idx_wf_created (created_at)
) ENGINE=InnoDB;

-- 5. COMPLIANCE ITEMS TABLE
CREATE TABLE IF NOT EXISTS compliance_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  institution_id INT NOT NULL,
  application_id INT NULL,
  requirement_title VARCHAR(255) NOT NULL,
  requirement_type VARCHAR(100) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status ENUM('Pending', 'Submitted', 'Verified', 'Overdue') DEFAULT 'Pending',
  evidence_note TEXT,
  document_reference VARCHAR(255),
  assigned_to INT NULL,
  verified_by INT NULL,
  verified_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_comp_institution FOREIGN KEY (institution_id)
    REFERENCES institutions(id) ON DELETE CASCADE,
  CONSTRAINT fk_comp_app FOREIGN KEY (application_id)
    REFERENCES applications(id) ON DELETE SET NULL,
  CONSTRAINT fk_comp_assigned FOREIGN KEY (assigned_to)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_comp_verifier FOREIGN KEY (verified_by)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_comp_inst (institution_id),
  INDEX idx_comp_status (status),
  INDEX idx_comp_due_date (due_date)
) ENGINE=InnoDB;

-- 6. EVC VISITS TABLE
CREATE TABLE IF NOT EXISTS evc_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  institution_id INT NOT NULL,
  proposed_visit_date DATE NOT NULL,
  lead_expert_name VARCHAR(150),
  expert_panel TEXT,
  visit_mode ENUM('Physical On-Site', 'Virtual / Online EVC') DEFAULT 'Physical On-Site',
  status ENUM('Proposed', 'Confirmed', 'Completed', 'Rescheduled', 'Cancelled') DEFAULT 'Proposed',
  visit_notes TEXT,
  report_summary TEXT,
  scheduled_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_evc_app FOREIGN KEY (application_id)
    REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_evc_inst FOREIGN KEY (institution_id)
    REFERENCES institutions(id) ON DELETE CASCADE,
  CONSTRAINT fk_evc_user FOREIGN KEY (scheduled_by)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_evc_date (proposed_visit_date),
  INDEX idx_evc_status (status)
) ENGINE=InnoDB;

-- 7. ALERTS TABLE
CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category ENUM(
    'Application Deadline',
    'Application Overdue',
    'Compliance Deadline',
    'Compliance Overdue',
    'Upcoming EVC',
    'Workflow Action Pending',
    'General Notice'
  ) NOT NULL,
  institution_id INT NULL,
  application_id INT NULL,
  compliance_id INT NULL,
  evc_id INT NULL,
  due_date DATE NULL,
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alert_inst FOREIGN KEY (institution_id)
    REFERENCES institutions(id) ON DELETE CASCADE,
  CONSTRAINT fk_alert_app FOREIGN KEY (application_id)
    REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_alert_comp FOREIGN KEY (compliance_id)
    REFERENCES compliance_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_alert_evc FOREIGN KEY (evc_id)
    REFERENCES evc_visits(id) ON DELETE CASCADE,
  INDEX idx_alert_inst (institution_id),
  INDEX idx_alert_is_read (is_read),
  INDEX idx_alert_priority (priority)
) ENGINE=InnoDB;

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  user_email VARCHAR(150),
  user_role VARCHAR(50),
  action_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  description TEXT NOT NULL,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_created (created_at),
  INDEX idx_audit_action (action_type),
  INDEX idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB;

-- 9. DOCUMENT CHECKS (AI / Rule-Based Assistant)
CREATE TABLE IF NOT EXISTS document_checks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  extracted_metadata JSON NULL,
  rule_results JSON NULL,
  passed_checks INT DEFAULT 0,
  total_checks INT DEFAULT 0,
  findings TEXT,
  verification_status ENUM('Pending Review', 'Verified Match', 'Discrepancy Found') DEFAULT 'Pending Review',
  reviewed_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_doc_app FOREIGN KEY (application_id)
    REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_doc_reviewer FOREIGN KEY (reviewed_by)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
