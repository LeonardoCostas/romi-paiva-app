import { Clock, User, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearSession, getToken, getUserRole, isStaffRole } from '../utils/auth';

export default function Inicio() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => ({
    token: getToken(),
    role: getUserRole(),
  }));

  const isLoggedIn = Boolean(session.token);
  const canAccessAdmin = isStaffRole(session.role);

  const handleLogout = () => {
    clearSession();
    setSession({ token: null, role: null });
    navigate('/', { replace: true });
  };

  return (
    <div
      className="rp-root"
      style={{ fontFamily: "'Inter', sans-serif", background: '#100608', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Dancing+Script:wght@600&family=Inter:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        /* Buttons */
        .rp-btn-reservar {
          background: linear-gradient(135deg, #dda0bb 0%, #b8638e 100%);
          color: #fff; border: none; cursor: pointer; text-decoration: none;
          transition: opacity .22s, transform .22s, box-shadow .22s;
          display: flex; align-items: center; gap: 8px;
          padding: 11px 24px; border-radius: 100px;
          font-size: 12px; font-weight: 600; letter-spacing: .07em;
          text-transform: uppercase;
          box-shadow: 0 4px 20px rgba(180,90,140,.35);
        }
        .rp-btn-reservar:hover {
          opacity: .9; transform: translateY(-1px) scale(1.02);
          box-shadow: 0 8px 28px rgba(180,90,140,.5);
        }

        .rp-btn-dark {
          background: rgba(255,255,255,.06); color: rgba(255,255,255,.8);
          border: 1px solid rgba(255,255,255,.11); cursor: pointer; text-decoration: none;
          padding: 11px 22px; border-radius: 100px;
          font-size: 12px; font-weight: 500; letter-spacing: .06em;
          text-transform: uppercase; transition: background .22s, border-color .22s;
        }
        .rp-btn-dark:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.22); }

        .rp-nav-link {
          background: transparent; border: none; cursor: pointer; text-decoration: none;
          display: flex; align-items: center; gap: 7px;
          color: rgba(255,255,255,.55); font-size: 12px;
          letter-spacing: .08em; font-family: inherit; text-transform: uppercase;
          transition: color .2s; padding: 8px 4px;
        }
        .rp-nav-link:hover { color: rgba(255,255,255,.9); }

        /* Float animation for card */
        .rp-float { animation: rpFloat 5s ease-in-out infinite; }
        @keyframes rpFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-9px); }
        }

        /* Service circles */
        .rp-svc-item { text-align: center; cursor: pointer; }
        .rp-svc-circle-wrap {
          width: 72px; height: 72px; border-radius: 50%; overflow: hidden;
          margin: 0 auto 10px;
          border: 1.5px solid rgba(232,164,192,.4);
          box-shadow: 0 0 0 0 rgba(232,164,192,.0);
          transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
        }
        .rp-svc-item:hover .rp-svc-circle-wrap {
          transform: translateY(-5px) scale(1.07);
          box-shadow: 0 8px 32px rgba(232,164,192,.35);
          border-color: rgba(232,164,192,.75);
        }
        .rp-svc-circle-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* WA Button */
        .rp-wa-btn {
          display: inline-flex; align-items: center; gap: 16px;
          background: rgba(18,6,12,.85);
          border: 1px solid rgba(220,150,185,.28);
          border-radius: 100px; padding: 15px 34px;
          color: #fff; text-decoration: none;
          transition: border-color .25s, transform .25s, box-shadow .25s;
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 32px rgba(0,0,0,.45);
        }
        .rp-wa-btn:hover {
          border-color: rgba(220,150,185,.6);
          transform: translateY(-2px) scale(1.015);
          box-shadow: 0 8px 40px rgba(0,0,0,.55), 0 0 24px rgba(220,150,185,.15);
        }

        /* Card hover actions */
        .rp-card-action-btn {
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 14px; padding: 13px 22px;
          color: #fff; font-size: 13px; font-weight: 500;
          cursor: pointer; display: flex; align-items: center; gap: 7px;
          transition: background .2s, border-color .2s, transform .2s;
          font-family: inherit; letter-spacing: .02em;
        }
        .rp-card-action-btn:hover {
          background: rgba(255,255,255,.12);
          border-color: rgba(255,255,255,.22);
          transform: translateY(-1px);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .rp-main { flex-direction: column !important; padding: 28px 24px 20px !important; }
          .rp-left { max-width: 100% !important; }
          .rp-right { width: 100% !important; max-width: 380px; margin: 0 auto; }
          .rp-nav { padding: 14px 24px !important; }
          .rp-headline-lg { font-size: 44px !important; }
          .rp-nav-actions { gap: 6px !important; }
          .rp-nav-actions .rp-btn-dark { display: none; }
        }
        @media (max-width: 600px) {
          .rp-nav { padding: 12px 18px !important; gap: 12px !important; }
          .rp-brand { min-width: 0; gap: 8px !important; }
          .rp-brand-divider, .rp-brand-script, .rp-nav-link { display: none !important; }
          .rp-btn-reservar { padding: 10px 13px !important; gap: 6px !important; font-size: 10px !important; letter-spacing: .04em !important; white-space: nowrap; }
          .rp-main { padding: 24px 20px 16px !important; gap: 28px !important; }
          .rp-headline-lg { font-size: 36px !important; }
          .rp-location { max-width: 100%; padding: 7px 14px !important; font-size: 10.5px !important; line-height: 1.4; }
          .rp-svc-row { gap: 14px !important; flex-wrap: wrap !important; justify-content: center !important; }
          .rp-tagline-quote { display: none !important; }
          .rp-right { max-width: 100% !important; }
          .rp-wa-wrap { padding: 6px 18px 30px !important; }
          .rp-wa-btn { width: 100%; max-width: 360px; justify-content: center; gap: 12px !important; padding: 13px 16px !important; }
        }
      `}</style>

      {/* BACKGROUND */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#100608' }} />
        <img src="/fondo.jpg" alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.82 }} />
        <img src="/fondo.jpg" alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen', opacity: 0.15 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 65% at 50% 50%, transparent 35%, rgba(6,1,4,.8) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,1,4,.6) 0%, transparent 20%, transparent 65%, rgba(6,1,4,.75) 100%)' }} />
      </div>

      {/* NAVBAR */}
      <nav className="rp-nav" style={{
        position: 'relative', zIndex: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 52px',
        borderBottom: '1px solid rgba(255,255,255,.05)',
        backdropFilter: 'blur(4px)',
      }}>
        {/* Logo */}
        <div className="rp-brand" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8a060" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
              <line x1="20" y1="4" x2="8.12" y2="15.88"/>
              <line x1="14.47" y1="14.48" x2="20" y2="20"/>
              <line x1="8.12" y1="8.12" x2="12" y2="12"/>
            </svg>
            <div style={{ display: 'flex', gap: 3 }}>
              {[0,1].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', border: '1px solid #c8a060', opacity: .65 }} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 8, letterSpacing: '.3em', textTransform: 'uppercase', color: '#c8a060', opacity: .8 }}>ESTETICA</div>
            <div style={{ fontSize: 13, letterSpacing: '.22em', fontWeight: 700, color: '#f0e0c0', textTransform: 'uppercase' }}>ROMI PAIVA</div>
          </div>
          <div className="rp-brand-divider" style={{ width: 1, height: 36, background: 'rgba(255,255,255,.14)', margin: '0 16px' }} />
          <span className="rp-brand-script" style={{ fontFamily: "'Dancing Script', cursive", fontSize: 28, color: '#f0e0c0', fontWeight: 600 }}>
            Romi Paiva
          </span>
        </div>

        {/* Nav actions (CON LINKS) */}
        <div className="rp-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isLoggedIn && (
            <Link to="/login" className="rp-nav-link"><User size={14} /> Iniciar sesión</Link>
          )}
          {isLoggedIn && canAccessAdmin && (
            <Link to="/admin/agenda" className="rp-nav-link"><User size={14} /> Panel admin</Link>
          )}
          {isLoggedIn && !canAccessAdmin && (
            <Link to="/mis-turnos" className="rp-nav-link"><User size={14} /> Mis turnos</Link>
          )}
          {isLoggedIn && (
            <button type="button" className="rp-nav-link" onClick={handleLogout}>Salir</button>
          )}
          <Link to="/turnos" className="rp-btn-reservar"><Clock size={13} /> Reservar turno</Link>
          <Link to="/servicios" className="rp-btn-dark">Ver servicios</Link>
        </div>
      </nav>

      {/* MAIN */}
      <main className="rp-main" style={{
        position: 'relative', zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '44px 52px 20px', gap: 40,
      }}>

        {/* LEFT */}
        <div className="rp-left" style={{ flex: 1, maxWidth: 580, paddingTop: 8 }}>
          <div className="rp-location" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(16,6,10,.7)', border: '1px solid rgba(220,150,185,.2)', borderRadius: 100, padding: '7px 18px', fontSize: 11.5, color: 'rgba(255,255,255,.65)', marginBottom: 26, backdropFilter: 'blur(10px)', letterSpacing: '.06em' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#e8a4c0', display: 'inline-block', boxShadow: '0 0 8px rgba(232,164,192,.6)' }} />
            Studio premium · Rafael Calzada, Buenos Aires
          </div>

          <h1 className="rp-headline-lg" style={{ fontFamily: "'Playfair Display', serif", fontSize: 62, fontWeight: 700, lineHeight: 1.04, color: '#f5edf0', margin: '0 0 2px', letterSpacing: '-.01em' }}>Donde el arte<br />encuentra</h1>
          <h1 className="rp-headline-lg" style={{ fontFamily: "'Playfair Display', serif", fontSize: 62, fontWeight: 400, fontStyle: 'italic', lineHeight: 1.06, color: '#e8a4c0', margin: '0 0 26px', letterSpacing: '-.01em' }}>la elegancia</h1>

          <p style={{ fontSize: 14.5, lineHeight: 1.85, color: 'rgba(255,255,255,.5)', marginBottom: 30, maxWidth: 420, fontWeight: 300 }}>Alaciado de vanguardia, pestañas y packs premium.<br />Realzamos tu esencia, potenciamos tu belleza.</p>

          <div style={{ width: 200, height: 1, background: 'linear-gradient(90deg, #c8a060, rgba(200,160,96,.15))', marginBottom: 32 }} />

          {/* Services row */}
          <div className="rp-svc-row" style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 32, flexWrap: 'nowrap' }}>
            {[
              { image: '/peinados.jpg', label: 'ALISADO', sub: 'Y TRATAMIENTOS' },
              { image: '/ppppp.jpg', label: 'EXTENSIONES', sub: 'DE PESTAÑAS' },
              { image: '/cejasmini.jpg', label: 'CEJAS', sub: 'Y DISEÑO' },
              { image: '/keratinaimagen.jpeg', label: 'PACKS', sub: 'PERSONALIZADOS' },
            ].map(({ image, label, sub }) => (
              <div key={label} className="rp-svc-item" style={{ minWidth: 72 }}>
                <div className="rp-svc-circle-wrap"><img src={image} alt={label} /></div>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.16em', color: 'rgba(255,255,255,.88)', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: 8, letterSpacing: '.1em', color: 'rgba(255,255,255,.42)', textTransform: 'uppercase', marginTop: 3, lineHeight: 1.4 }}>{sub}</div>
              </div>
            ))}

            {/* Tagline quote */}
            <div className="rp-tagline-quote" style={{ marginLeft: 8, border: '1px solid rgba(220,150,185,.2)', borderRadius: 14, padding: '14px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 165, backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,.025)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.04)' }}>
              <div style={{ fontSize: 8, letterSpacing: '.18em', color: 'rgba(255,255,255,.38)', textTransform: 'uppercase', marginBottom: 6 }}>BELLEZA QUE SE VE,</div>
              <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 18, color: 'rgba(255,255,255,.75)', lineHeight: 1.4 }}>confianza que se siente.</div>
            </div>
          </div>

          <div style={{ fontSize: 9, letterSpacing: '.38em', color: 'rgba(255,255,255,.22)', textTransform: 'uppercase' }}>CUIDADO &nbsp;·&nbsp; ESTILO &nbsp;·&nbsp; CONFIANZA</div>
        </div>

        {/* RIGHT: CARD */}
        <div className="rp-right" style={{ position: 'relative', flexShrink: 0, width: 360, paddingTop: 4 }}>
          <div className="rp-float" style={{ background: 'linear-gradient(160deg, rgba(28,12,18,.9) 0%, rgba(14,6,10,.95) 100%)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 26, padding: 18, boxShadow: '0 48px 100px rgba(0,0,0,.75), 0 2px 0 rgba(255,255,255,.04) inset', backdropFilter: 'blur(16px)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 28, left: 28, zIndex: 5, background: 'rgba(14,6,10,.94)', border: '1px solid rgba(220,150,185,.18)', borderRadius: 16, padding: '11px 14px', backdropFilter: 'blur(10px)', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,.5)' }}>
              <div style={{ color: '#e8b060', fontSize: 11, letterSpacing: 1.5 }}>★★★★★</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 22, lineHeight: 1.1 }}>4.9</div>
              <div style={{ color: 'rgba(255,255,255,.38)', fontSize: 9 }}>/5.0</div>
              <div style={{ color: 'rgba(255,255,255,.32)', fontSize: 8.5, marginTop: 3, letterSpacing: '.05em' }}>+500 reseñas</div>
            </div>
            <div style={{ position: 'absolute', top: 30, right: 26, zIndex: 5, fontFamily: "'Dancing Script', cursive", fontSize: 27, color: '#f0e0c0', fontWeight: 600, textShadow: '0 2px 12px rgba(0,0,0,.5)' }}>Romi Paiva</div>
            <div style={{ position: 'relative', borderRadius: 18, overflow: 'visible', marginBottom: 16 }}>
              <img src="/fotomaain.jpeg" alt="Romi Paiva" style={{ width: '100%', height: 305, objectFit: 'cover', objectPosition: 'center top', display: 'block', borderRadius: 18, boxShadow: '0 8px 32px rgba(0,0,0,.4)' }} />
              <div style={{ position: 'absolute', bottom: 56, right: -24, width: 130, borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(255,255,255,.15)', boxShadow: '0 12px 36px rgba(0,0,0,.65), 0 1px 0 rgba(255,255,255,.06) inset' }}>
                <img src="/ojo.jpg" alt="Detalle pestañas" style={{ width: '100%', display: 'block' }} />
              </div>
              <div style={{ position: 'absolute', bottom: 16, right: 118, background: 'linear-gradient(135deg, #e8a4c0, #b8638e)', color: '#fff', borderRadius: 13, padding: '9px 13px', fontSize: 11, lineHeight: 1.45, whiteSpace: 'nowrap', boxShadow: '0 6px 20px rgba(160,80,120,.5)' }}>
                <div style={{ fontWeight: 700, letterSpacing: '.02em' }}>Turnos disponibles</div>
                <div style={{ opacity: .78, fontSize: 9.5 }}>Esta semana ·</div>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '0 4px 14px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: '#c8a060', lineHeight: 1, textShadow: '0 2px 16px rgba(200,160,96,.25)' }}>500+</div>
                <div style={{ fontSize: 8, letterSpacing: '.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,.32)', marginTop: 4 }}>CLIENTAS FELICES</div>
              </div>
              <Link to="/servicios" className="rp-card-action-btn" style={{ textDecoration: 'none' }}>Ver Servicios <ChevronRight size={14} /></Link>
            </div>
          </div>
        </div>
      </main>

      {/* WHATSAPP CTA */}
      <div className="rp-wa-wrap" style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 40px', position: 'relative', zIndex: 10 }}>
        <a href="https://wa.me/5491130323105" target="_blank" rel="noopener noreferrer" className="rp-wa-btn">
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(37,211,102,.18) 0%, rgba(37,211,102,.08) 100%)', border: '1px solid rgba(37,211,102,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '.03em', color: '#f2d0df', marginBottom: 3 }}>Asesoramiento personalizado</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.45)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Consultas y reserva de turnos</div>
          </div>
          <div style={{ marginLeft: 8, width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(220,150,185,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(220,150,185,.7)', flexShrink: 0 }}>
            <ChevronRight size={15} />
          </div>
        </a>
      </div>
    </div>
  );
}
