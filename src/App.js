
import React, { useState } from 'react';
import UploadForm from './UploadForm';
import ReelsTable from './ReelsTable';

function App() {
  const [refresh, setRefresh] = useState(0);
  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Instagram Reels Scheduler</h1>
      <p>Upload and schedule your Instagram Reels for automatic publishing.</p>
      <UploadForm onUpload={() => setRefresh(r => r + 1)} />
      <ReelsTable refresh={refresh} />
    </div>
  );
}

export default App;
