export default function AgendaLoading() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="skeleton" style={{ width: '150px', height: '2.5rem' }}></div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="skeleton" style={{ width: '80px', height: '2.5rem' }}></div>
          <div className="skeleton" style={{ width: '120px', height: '2.5rem' }}></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="skeleton" style={{ width: '200px', height: '1.5rem', marginBottom: '1.5rem' }}></div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="skeleton" style={{ flex: '1 1 200px', height: '3rem' }}></div>
          <div className="skeleton" style={{ flex: '1 1 200px', height: '3rem' }}></div>
          <div className="skeleton" style={{ width: '130px', height: '3rem' }}></div>
          <div className="skeleton" style={{ width: '120px', height: '3rem' }}></div>
          <div className="skeleton" style={{ width: '100px', height: '3rem' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div className="skeleton" style={{ width: '90px', height: '2rem' }}></div>
              <div>
                <div className="skeleton" style={{ width: '150px', height: '1.5rem', marginBottom: '0.5rem' }}></div>
                <div className="skeleton" style={{ width: '100px', height: '1rem' }}></div>
              </div>
            </div>
            <div className="skeleton" style={{ width: '120px', height: '2.5rem' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
