import React, { useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL + '/query';

function App() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        background: 'linear-gradient(120deg,#232526,#414345 80%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      }}
    >
      <div
        style={{
          minWidth: 400,
          width: '100%',
          maxWidth: 680,
          padding: '48px 32px 36px 32px',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.94)',
          boxShadow: '0 12px 40px 0 rgba(30,30,30,0.18), 0 1.5px 6px #aaa2',
          margin: '40px 0',
          border: '1.5px solid #e4e6e8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#1b263b',
            fontWeight: 700,
            letterSpacing: '.01em',
            fontSize: 38,
            marginBottom: 4,
          }}
        >
          Talk to your Database
        </h1>
        <p
          style={{
            textAlign: 'center',
            color: '#6c757d',
            fontSize: '1.18em',
            marginTop: 0,
            marginBottom: 36,
            letterSpacing: '.01em',
          }}
        >
          Enter your question in plain English.<br />
          <span style={{ color: '#495057', fontWeight: 500 }}>
            Powered by Gemini Flash, OpenRouter, FastAPI, and MySQL.
          </span>
        </p>
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            width: '100%',
            gap: 14,
            marginBottom: 38,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Show all transactions above 200"
            style={{
              flex: 1,
              fontSize: 19,
              padding: '16px 20px',
              borderRadius: 10,
              border: '1.5px solid #ced4da',
              outline: 'none',
              background: '#f8fafc',
              boxShadow: '0 1px 1.5px #e9ecef',
              fontWeight: 500,
              letterSpacing: '.01em',
              transition: 'border .14s',
            }}
            autoFocus
            required
          />
          <button
            type="submit"
            style={{
              fontSize: 19,
              padding: '16px 30px',
              border: 'none',
              borderRadius: 10,
              background: 'linear-gradient(90deg,#3a86ff 0%,#3366cc 98%)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 700,
              boxShadow: '0 1px 4px #dbeafe',
              transition: 'background .15s',
            }}
            disabled={loading}
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </form>
        <div style={{ width: '100%' }}>
          {result && (
            <div>
              {result.success ? (
                <div>
                  <div
                    style={{
                      marginBottom: 18,
                      fontSize: '1.08em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <b style={{ color: '#2d3142' }}>User prompt:</b>
                    <span
                      style={{
                        background: '#e0f2fe',
                        padding: '3px 10px',
                        borderRadius: 5,
                        fontWeight: 540,
                        color: '#276678',
                        fontSize: '1.01em',
                      }}
                    >
                      {result.prompt}
                    </span>
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <b style={{ color: '#2d3142' }}>Generated SQL:</b>
                    <pre
                      style={{
                        background: '#f3f3f7',
                        padding: 14,
                        borderRadius: 8,
                        marginTop: 8,
                        overflowX: 'auto',
                        fontSize: 16,
                        color: '#0a1c37',
                        fontFamily: "'JetBrains Mono', 'Fira Mono', 'Consolas', monospace",
                        border: '1px solid #e4e6e8',
                      }}
                    >
                      {result.sql}
                    </pre>
                  </div>
                  <b style={{ color: '#2d3142' }}>Result:</b>
                  <div
                    style={{
                      overflowX: 'auto',
                      marginTop: 12,
                      borderRadius: 10,
                      background: '#f9fafd',
                      border: '1px solid #e6e8ea',
                      boxShadow: '0 0.5px 2px #e7eaf0',
                    }}
                  >
                    <table
                      style={{
                        borderCollapse: 'collapse',
                        width: '100%',
                        minWidth: 320,
                        fontSize: 17,
                        letterSpacing: '.01em',
                      }}
                    >
                      <thead>
                        <tr>
                          {result.columns.map((col) => (
                            <th
                              key={col}
                              style={{
                                background: '#eaf3fb',
                                padding: '10px 14px',
                                border: '1px solid #dbeafe',
                                fontWeight: 600,
                                color: '#22577a',
                                fontSize: 17,
                              }}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.length === 0 && (
                          <tr>
                            <td
                              colSpan={result.columns.length}
                              style={{
                                textAlign: 'center',
                                padding: 24,
                                color: '#b2bec3',
                                fontStyle: 'italic',
                                fontWeight: 500,
                              }}
                            >
                              No data found
                            </td>
                          </tr>
                        )}
                        {result.rows.map((row, idx) => (
                          <tr key={idx}>
                            {row.map((cell, cidx) => (
                              <td
                                key={cidx}
                                style={{
                                  padding: '10px 14px',
                                  border: '1px solid #e5e9ef',
                                  background: idx % 2 === 0 ? '#f6f9fa' : '#fff',
                                }}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    color: 'crimson',
                    marginTop: 18,
                    background: '#fff4f4',
                    borderRadius: 5,
                    padding: '12px 16px',
                    fontWeight: 500,
                    fontSize: '1.05em',
                    border: '1px solid #ffd6d6',
                  }}
                >
                  <b>Error:</b> {result.error}
                </div>
              )}
            </div>
          )}
        </div>
        <div
          style={{
            marginTop: 44,
            textAlign: 'center',
            color: '#888',
            fontSize: '0.97em',
            width: '100%',
          }}
        >
          <hr style={{ margin: '24px 0', borderColor: '#e7eaf0', borderWidth: '1px 0 0 0' }} />
          <div>
            Made by{' '}
            <a
              href="https://www.linkedin.com/in/gayathri1006/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3366cc', fontWeight: 600 }}
            >
              Gayathri G
            </a>{' '}
            | Powered by Gemini Flash, OpenRouter, FastAPI, MySQL, and React.
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;