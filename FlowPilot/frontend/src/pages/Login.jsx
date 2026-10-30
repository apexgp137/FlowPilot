import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('admin@flowguard.aicte.gov.in');
  const [password, setPassword] = useState('Admin@1234');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0f1d',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(13, 148, 136, 0.12) 0%, transparent 40%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '28px 24px',
            textAlign: 'center',
            borderBottom: '1px solid #1e293b'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #0d9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.4)'
            }}
          >
            <ShieldCheck size={30} color="#ffffff" />
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            FlowPilot
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
            Approval Workflow Automation & Compliance Management
          </p>
          <div
            style={{
              marginTop: '12px',
              display: 'inline-block',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              color: '#38bdf8'
            }}
          >
            Hackathon Demonstration System
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Institutional / Official Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}
                />
                <input
                  type="email"
                  className="input-control"
                  style={{ paddingLeft: '38px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@flowpilot.aicte.gov.in"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label>Secure Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}
                />
                <input
                  type="password"
                  className="input-control"
                  style={{ paddingLeft: '38px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                justifyContent: 'center',
                fontSize: '15px'
              }}
            >
              {isSubmitting ? 'Authenticating Credentials...' : 'Authenticate & Enter System'}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Quick Demo Accounts Switcher */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Quick Demo Account Presets:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDemoAccount('admin@flowguard.aicte.gov.in', 'Admin@1234')}
                style={{
                  background: email === 'admin@flowguard.aicte.gov.in' ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${email === 'admin@flowguard.aicte.gov.in' ? '#bfdbfe' : '#e2e8f0'}`,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a8a' }}>ADMIN: Dr. Rajesh Sharma</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>admin@flowguard.aicte.gov.in</div>
                </div>
                {email === 'admin@flowguard.aicte.gov.in' && <CheckCircle2 size={16} color="#2563eb" />}
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('official@flowguard.aicte.gov.in', 'Official@1234')}
                style={{
                  background: email === 'official@flowguard.aicte.gov.in' ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${email === 'official@flowguard.aicte.gov.in' ? '#bfdbfe' : '#e2e8f0'}`,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a8a' }}>OFFICIAL: Dr. Sunita Deshmukh</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>official@flowguard.aicte.gov.in</div>
                </div>
                {email === 'official@flowguard.aicte.gov.in' && <CheckCircle2 size={16} color="#2563eb" />}
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('principal@apextech.edu.in', 'Apex@1234')}
                style={{
                  background: email === 'principal@apextech.edu.in' ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${email === 'principal@apextech.edu.in' ? '#bfdbfe' : '#e2e8f0'}`,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a8a' }}>INSTITUTION: Apex Tech Institute</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>principal@apextech.edu.in</div>
                </div>
                {email === 'principal@apextech.edu.in' && <CheckCircle2 size={16} color="#2563eb" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
