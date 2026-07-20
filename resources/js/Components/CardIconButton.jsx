export default function CardIconButton({ onClick, title, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition ${className}`}
    >
      {children}
    </button>
  );
}
