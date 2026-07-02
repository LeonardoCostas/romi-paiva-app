import { Link } from 'react-router-dom';

export function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #100608 0%, #070204 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 40, width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#f5edf0', fontSize: 30, margin: '0 0 6px', fontWeight: 700 }}>{title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Notice({ tone, children }) {
  const success = tone === 'success';
  return (
    <div style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 12, border: `1px solid ${success ? 'rgba(76,175,125,.35)' : 'rgba(232,93,93,.35)'}`, background: success ? 'rgba(76,175,125,.1)' : 'rgba(232,93,93,.1)', color: success ? '#c7f4d8' : '#f5c4c4', fontSize: 13, lineHeight: 1.45 }}>
      {children}
    </div>
  );
}

export function FooterLink({ to, children }) {
  return (
    <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13 }}>
      <Link to={to} style={{ color: '#dda0bb', textDecoration: 'none', fontWeight: 500 }}>{children}</Link>
    </div>
  );
}

export function AuthInput(props) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '14px 16px',
        color: '#fff',
        fontSize: 14,
        outline: 'none',
        ...(props.style ?? {}),
      }}
    />
  );
}

export function AuthButton({ loading, disabled, children }) {
  const inactive = loading || disabled;
  return (
    <button type="submit" disabled={inactive} style={{ background: 'linear-gradient(135deg, #dda0bb 0%, #b8638e 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 600, cursor: inactive ? 'default' : 'pointer', opacity: inactive ? .72 : 1, boxShadow: '0 4px 20px rgba(180,90,140,0.25)' }}>
      {children}
    </button>
  );
}
