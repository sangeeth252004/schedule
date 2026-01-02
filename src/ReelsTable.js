
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl } from './api';

export default function ReelsTable({ refresh }) {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(apiUrl('/reels')).then(res => {
      setReels(res.data.reels);
      setLoading(false);
    });
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scheduled reel?')) return;
    try {
      await axios.delete(apiUrl(`/reels/${id}`));
      setReels(reels => reels.filter(r => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL scheduled reels?')) return;
    try {
      await axios.delete(apiUrl('/reels/pending/all'));
      setReels(reels => reels.filter(r => r.status !== 'Pending'));
    } catch (err) {
      alert(err.response?.data?.error || 'Delete all failed');
    }
  };

  return (
    <div>
      <h2>Uploaded Reels</h2>
      <button onClick={handleDeleteAll} style={{ color: 'red', marginBottom: 8 }}>Delete All Pending</button>
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Video</th>
              <th>Caption</th>
              <th>Scheduled Time</th>
              <th>Status</th>
              <th>Instagram ID</th>
              <th>Error</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reels.map(r => (
              <tr key={r._id} style={{ background: r.status === 'Failed' ? '#fee' : r.status === 'Published' ? '#efe' : '#fff' }}>
                <td><a href={r.videoUrl} target="_blank" rel="noopener noreferrer">Video</a></td>
                <td>{r.caption}</td>
                <td>{new Date(r.scheduledTime).toLocaleString()}</td>
                <td>{r.status}</td>
                <td>{r.instagramMediaId || '-'}</td>
                <td style={{ color: 'red' }}>{r.error || ''}</td>
                <td>
                  {r.status === 'Pending' && (
                    <button onClick={() => handleDelete(r._id)} style={{ color: 'red' }}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
