// * Frontend module: karyawan-web/src/components/ui/videos/TwentyOneIsToNine.tsx
// & This file defines frontend UI or logic for TwentyOneIsToNine.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk TwentyOneIsToNine.tsx.

export default function TwentyOneIsToNine() {
  return (
    <div className="aspect-21/9 overflow-hidden rounded-lg">
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
