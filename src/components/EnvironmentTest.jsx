import React from 'react';

const EnvironmentTest = () => {
  const envVars = {
    'VITE_API_BASE_URL': import.meta.env.VITE_API_BASE_URL,
    'VITE_APP_NAME': import.meta.env.VITE_APP_NAME,
    'VITE_APP_VERSION': import.meta.env.VITE_APP_VERSION,
    'VITE_ENABLE_DEBUG': import.meta.env.VITE_ENABLE_DEBUG,
    'MODE': import.meta.env.MODE,
    'DEV': import.meta.env.DEV,
    'PROD': import.meta.env.PROD
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h3>Environment Variables Test</h3>
      <p>Current Environment: <strong>{import.meta.env.MODE}</strong></p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#e0e0e0' }}>
            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ccc' }}>Variable</th>
            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ccc' }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(envVars).map(([key, value]) => (
            <tr key={key}>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>{key}</td>
              <td style={{ padding: '8px', border: '1px solid #ccc', color: value ? 'green' : 'red' }}>
                {value || 'Not set'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EnvironmentTest;
