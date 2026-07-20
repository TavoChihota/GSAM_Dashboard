import { useRef } from 'react';
import { Download, X } from 'lucide-react';
import { downloadElementAsPdf } from '@/lib/exportCardPdf';

export default function CardExpandModal({ open, onClose, title, children }) {
  const bodyRef = useRef(null);

  if (!open) return null;

  const handleDownload = () => downloadElementAsPdf(bodyRef.current, title);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 transition border border-slate-300 rounded-lg px-2.5 py-1.5"
              title="Download as PDF"
            >
              <Download size={14} /> Download PDF
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition">
              <X size={22} />
            </button>
          </div>
        </div>
        <div ref={bodyRef} className="p-6 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
