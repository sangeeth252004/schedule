
import React, { useState } from 'react';
import axios from 'axios';
import { apiUrl } from './api';
import { generateRandomSchedule } from './scheduleUtils';

const MAX_FILES = 80;
const MAX_SIZE_MB = 100;
// 12:00pm to 8:00pm IST = 06:30 to 14:30 UTC
const DEFAULT_WINDOW_START = '00:00';
const DEFAULT_WINDOW_END = '23:59';
const DEFAULT_MIN_GAP = 10;


export default function UploadForm({ onUpload }) {
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [bulkCaption, setBulkCaption] = useState('');
  const [times, setTimes] = useState([]);
  const [date, setDate] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Fill all captions with bulk caption
  const handleFillCaptions = () => {
    setCaptions(Array(files.length).fill(bulkCaption));
  };

  const handleFileChange = e => {
    const selected = Array.from(e.target.files);
    if (selected.length > MAX_FILES) {
      setError(`Max ${MAX_FILES} files allowed.`);
      return;
    }
    for (let file of selected) {
      if (file.type !== 'video/mp4') {
        setError('Only MP4 files allowed.');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File size must be < ${MAX_SIZE_MB}MB.`);
        return;
      }
    }
    setFiles(selected);
    setCaptions(Array(selected.length).fill(''));
    setTimes([]);
    setShowSchedule(false);
    setError('');
  };

  const handleCaptionChange = (i, val) => {
    const arr = [...captions];
    arr[i] = val;
    setCaptions(arr);
  };
  const handleTimeChange = (i, val) => {
    const arr = [...times];
    arr[i] = val;
    setTimes(arr);
  };


  // Step 1: Generate schedule
  const handleGenerateSchedule = e => {
    e.preventDefault();
    if (!files.length) return setError('Select at least one video.');
    if (!date) return setError('Select a date.');
    if (captions.some(c => !c)) return setError('All captions required.');
    try {
      const schedule = generateRandomSchedule({
        date,
        count: files.length,
        minGapMinutes: DEFAULT_MIN_GAP,
        windowStart: DEFAULT_WINDOW_START,
        windowEnd: DEFAULT_WINDOW_END,
      });
      setTimes(schedule.map(dt => dt.toISOString().slice(0, 16)));
      setShowSchedule(true);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Step 2: Confirm and upload
  const handleSubmit = async e => {
    e.preventDefault();
    if (!files.length) return setError('Select at least one video.');
    if (!date) return setError('Select a date.');
    if (captions.some(c => !c)) return setError('All captions required.');
    if (times.length !== files.length) return setError('Generate schedule first.');
    setLoading(true);
    setError('');
    const form = new FormData();
    files.forEach(f => form.append('videos', f));
    captions.forEach(c => form.append('captions', c));
    times.forEach(t => form.append('scheduledTimes', t));
    try {
      const res = await axios.post(apiUrl('/reels/upload'), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUpload(res.data.reels);
      setFiles([]);
      setCaptions([]);
      setTimes([]);
      setDate('');
      setShowSchedule(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={showSchedule ? handleSubmit : handleGenerateSchedule} style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 8 }}>
        <input type="file" name="videos" accept="video/mp4" multiple onChange={handleFileChange} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ marginLeft: 8 }} />
      </div>
      {files.length > 0 && (
        <div style={{ margin: '8px 0', padding: 8, background: '#f9f9f9', border: '1px solid #eee' }}>
          <input
            type="text"
            placeholder="Set caption for all videos"
            value={bulkCaption}
            onChange={e => setBulkCaption(e.target.value)}
            style={{ width: '70%', marginRight: 8 }}
          />
          <button type="button" onClick={handleFillCaptions}>Fill All Captions</button>
        </div>
      )}
      {files.map((file, i) => (
        <div key={i} style={{ margin: '8px 0', border: '1px solid #eee', padding: 8 }}>
          <div><b>{file.name}</b> ({(file.size/1024/1024).toFixed(1)} MB)</div>
          <input
            type="text"
            placeholder="Caption"
            value={captions[i] || ''}
            onChange={e => handleCaptionChange(i, e.target.value)}
            required
            style={{ width: '100%', margin: '4px 0' }}
          />
        </div>
      ))}
      {showSchedule && (
        <div style={{ margin: '16px 0' }}>
          <h4>Generated Schedule</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Video</th>
                <th>Caption</th>
                <th>Scheduled Time</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, i) => {
                // Convert to IST for display
                const dt = new Date(times[i]);
                const ist = new Date(dt.getTime() + (5.5 * 60 * 60 * 1000));
                return (
                  <tr key={i}>
                    <td>{file.name}</td>
                    <td>{captions[i]}</td>
                    <td>{ist.toLocaleString('en-IN', { hour12: true }) + ' (IST)'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button type="button" onClick={handleGenerateSchedule} style={{ marginRight: 8 }}>Regenerate Times</button>
          <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Confirm & Upload'}</button>
        </div>
      )}
      {!showSchedule && (
        <button type="submit" disabled={loading}>{loading ? 'Generating...' : 'Generate Schedule'}</button>
      )}
      {error && <div style={{ color: 'red', margin: 8 }}>{error}</div>}
    </form>
  );
}
