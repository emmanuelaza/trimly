export default function DashboardLoading() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="skeleton" style={{ width: '150px', height: '2.5rem' }}></div>
        <div className="skeleton" style={{ width: '130px', height: '2.5rem' }}></div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card">
            <div className="skeleton" style={{ width: '80px', height: '1rem', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ width: '120px', height: '3rem' }}></div>
          </div>
        ))}
      </div>
      
      <div className="skeleton" style={{ width: '250px', height: '2rem', marginTop: '3rem', marginBottom: '1rem' }}></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', alignItems: 'center' }}>
            <div className="skeleton" style={{ width: '200px', height: '1.5rem' }}></div>
            <div className="skeleton" style={{ width: '100px', height: '1.5rem' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
