// * Frontend module: karyawan-web/src/components/ui/videos/SixteenIsToNine.tsx
// & This file defines frontend UI or logic for SixteenIsToNine.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk SixteenIsToNine.tsx.

export default function SixteenIsToNine() {
  return (
    <div className="aspect-4/3 overflow-hidden rounded-lg">
      <iframe
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="YouTube video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
}
