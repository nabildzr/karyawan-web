// * Frontend module: karyawan-web/src/components/ui/videos/OneIsToOne.tsx
// & This file defines frontend UI or logic for OneIsToOne.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk OneIsToOne.tsx.

export default function OneIsToOne() {
  return (
    <div className="overflow-hidden rounded-lg aspect-square">
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
