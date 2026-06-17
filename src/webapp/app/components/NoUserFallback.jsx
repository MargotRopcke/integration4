import React from "react";

export function NoUserFallback() {
  return (
    <div className="intro" id="error-screen" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="mobile-container" style={{ justifyContent: 'center', backgroundColor: 'var(--color-blood-orange)' }}>
        <div className="error-card" style={{
          background: 'var(--style-creamy-vanilla, #FDFEEF)',
          padding: '40px 20px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          border: '4px solid var(--style-text-blue, #144552)',
          maxWidth: '320px',
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <h1 style={{
            fontSize: '5rem',
            margin: 0,
            fontFamily: "var(--font-Antwerpen-Tall, 'AntwerpenTallTall', sans-serif)",
            color: 'var(--color-blood-orange)',
            lineHeight: 1
          }}>404</h1>
          <p style={{
            fontSize: '1.5rem',
            margin: 0,
            fontFamily: "var(--font-secondary, 'SunAntwerpen', sans-serif)",
            color: 'var(--style-text-blue, #144552)',
            lineHeight: 1.3
          }}>
            sorry<br />locations not found
          </p>
          <div style={{
            width: '60px',
            height: '4px',
            background: 'var(--color-pear-sorbet)',
            borderRadius: '2px'
          }} />
          <p style={{
            fontSize: '0.9rem',
            margin: 0,
            fontFamily: 'sans-serif',
            color: '#666',
            lineHeight: 1.4
          }}>
            Please scan the QR code again to see your locations.
          </p>
        </div>
      </div>
    </div>
  );
}
