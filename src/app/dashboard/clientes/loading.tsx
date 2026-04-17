export default function ClientesLoading() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="skeleton" style={{ width: '250px', height: '2.5rem' }}></div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="skeleton" style={{ width: '200px', height: '1.5rem', marginBottom: '1.5rem' }}></div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="skeleton" style={{ flex: '1 1 200px', height: '3rem' }}></div>
          <div className="skeleton" style={{ flex: '1 1 200px', height: '3rem' }}></div>
          <div className="skeleton" style={{ width: '120px', height: '3rem' }}></div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div className="skeleton" style={{ width: '100%', height: '2rem' }}></div>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: i === 5 ? 'none' : '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="skeleton" style={{ width: '180px', height: '1.25rem' }}></div>
                <div className="skeleton" style={{ width: '120px', height: '1rem' }}></div>
              </div>
              <div className="skeleton" style={{ width: '100px', height: '2rem' }}></div>
              <div className="skeleton" style={{ width: '100px', height: '2.5rem' }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
