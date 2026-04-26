// * TiptapEditor — editor teks sederhana untuk helpdesk.
// * Dibuat mandiri supaya tidak bergantung ke package eksternal.

interface TiptapEditorProps {
  value: string;
  onChange: (html: string, plain: string) => void;
}
export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value, e.target.value)}
      placeholder="Jelaskan masalah kamu secara detail..."
      rows={7}
      className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 transition focus:border-brand-500 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
    />
  );
}
