import React from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Zap, Shield, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');
        .hp { font-family: 'Geist', -apple-system, sans-serif; min-height: 100vh; background: #fff; color: #111; display: flex; flex-direction: column; }
        .hp-nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; border-bottom: 1px solid #f0f0f0; }
        .hp-logo { display: flex; align-items: center; gap: 9px; }
        .hp-logo-icon { width: 28px; height: 28px; background: #111; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .hp-logo-text { font-size: 15px; font-weight: 600; letter-spacing: -0.3px; color: #111; }
        .hp-nav-links { display: flex; align-items: center; gap: 10px; }
        .hp-btn-ghost { font-size: 13px; font-weight: 500; color: #555; padding: 7px 14px; border-radius: 8px; border: 1px solid #e8e8e8; background: #fff; cursor: pointer; text-decoration: none; transition: background .15s, color .15s; font-family: inherit; }
        .hp-btn-ghost:hover { background: #f5f5f5; color: #111; }
        .hp-btn-solid { font-size: 13px; font-weight: 500; color: #fff; padding: 7px 16px; border-radius: 8px; border: none; background: #111; cursor: pointer; text-decoration: none; transition: background .15s; font-family: inherit; }
        .hp-btn-solid:hover { background: #333; }

        .hp-hero { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 24px 60px; }
        .hp-hero-kicker { font-size: 11px; font-weight: 500; letter-spacing: 1.2px; text-transform: uppercase; color: #999; margin-bottom: 24px; }
        .hp-hero-h1 { font-size: clamp(36px, 6vw, 68px); font-weight: 700; letter-spacing: -2.5px; line-height: 1.05; color: #0a0a0a; margin-bottom: 18px; }
        .hp-hero-sub { font-size: 15px; color: #777; line-height: 1.65; max-width: 400px; margin: 0 auto 36px; font-weight: 400; }
        .hp-hero-ctas { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .hp-cta-primary { font-size: 14px; font-weight: 500; color: #fff; padding: 10px 24px; border-radius: 10px; border: none; background: #111; cursor: pointer; text-decoration: none; transition: background .15s; font-family: inherit; }
        .hp-cta-primary:hover { background: #333; }
        .hp-cta-secondary { font-size: 14px; font-weight: 500; color: #555; padding: 10px 24px; border-radius: 10px; border: 1px solid #e0e0e0; background: #fff; cursor: pointer; text-decoration: none; transition: background .15s; font-family: inherit; }
        .hp-cta-secondary:hover { background: #f5f5f5; }

        .hp-features { display: flex; gap: 1px; background: #f0f0f0; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
        .hp-feat { flex: 1; background: #fff; padding: 28px 28px; }
        .hp-feat-icon { width: 32px; height: 32px; border-radius: 8px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; color: #555; }
        .hp-feat-title { font-size: 13px; font-weight: 600; color: #111; margin-bottom: 5px; letter-spacing: -0.2px; }
        .hp-feat-desc { font-size: 12px; color: #999; line-height: 1.6; }
        @media(max-width: 640px) { .hp-features { flex-direction: column; } .hp-nav { padding: 16px 20px; } }

        .hp-footer { padding: 18px 40px; border-top: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; }
        .hp-footer-copy { font-size: 12px; color: #bbb; }
        .hp-footer-link { font-size: 12px; color: #bbb; text-decoration: none; }
        .hp-footer-link:hover { color: #555; }
      `}</style>

      <div className="hp">
        {/* nav */}
        <nav className="hp-nav">
          <div className="hp-logo">
            {/* <div className="hp-logo-icon">
              <MessageSquare size={14} color="#fff" strokeWidth={2.5} />
            </div> */}
            <span className="hp-logo-text">voxChat</span>
          </div>
          <div className="hp-nav-links">
            <Link to="/login" className="hp-btn-ghost">Sign in</Link>
            <Link to="/signup" className="hp-btn-solid">Get started</Link>
          </div>
        </nav>

        {/* hero */}
        <section className="hp-hero">
          <p className="hp-hero-kicker">Open source · WebSocket · Redis</p>
          <h1 className="hp-hero-h1">Real-time chat,<br />done right</h1>
          <p className="hp-hero-sub">
            Instant messaging with read receipts, typing indicators, group chats, and live presence — built on WebSockets and Redis Pub/Sub.
          </p>
          <div className="hp-hero-ctas">
            <Link to="/signup" className="hp-cta-primary">Start chatting →</Link>
            <Link to="/login" className="hp-cta-secondary">Sign in</Link>
          </div>
        </section>

        {/* 3 features */}
        <div className="hp-features">
          {[
            { icon: <Zap size={15} />, title: 'Sub-100ms delivery', desc: 'Optimistic UI with instant render. WebSocket delivery confirmed async.' },
            { icon: <Shield size={15} />, title: 'Redis Pub/Sub scaling', desc: 'Messages routed across any server instance. Stateless horizontal scaling.' },
            { icon: <Users size={15} />, title: 'Groups & presence', desc: 'Group chats, typing indicators, and live online status out of the box.' },
          ].map(f => (
            <div key={f.title} className="hp-feat">
              <div className="hp-feat-icon">{f.icon}</div>
              <div className="hp-feat-title">{f.title}</div>
              <div className="hp-feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* footer */}
        <footer className="hp-footer">
          <span className="hp-footer-copy">voxChat — 2025</span>
          <a href="https://github.com/mynkchn" target="_blank" rel="noreferrer" className="hp-footer-link">GitHub →</a>
        </footer>
      </div>
    </>
  )
}
