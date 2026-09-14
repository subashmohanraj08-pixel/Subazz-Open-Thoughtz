import { useState } from 'react';
import { reportService } from '../services/services';

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'hate_abuse', label: 'Hate / abuse' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
];

export default function ReportModal({ targetType, targetId, onClose }) {
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    try {
      await reportService.create({ targetType, targetId, reason, details });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit report.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-4">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-semibold">Report submitted</p>
            <p className="text-sm text-gray-500 mt-1">Our admin team will review this shortly.</p>
            <button onClick={onClose} className="btn-secondary mt-4">
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-serif text-lg font-semibold mb-3">Report this {targetType}</h3>
            {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
            <div className="space-y-2 mb-3">
              {REASONS.map((r) => (
                <label key={r.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                  {r.label}
                </label>
              ))}
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Additional details (optional)"
              rows={3}
              className="input-field text-sm mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button onClick={submit} className="btn-primary">
                Submit report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
