// * Frontend module: karyawan-web/src/components/ui/images/ResponsiveImage.tsx
// & This file defines frontend UI or logic for ResponsiveImage.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk ResponsiveImage.tsx.

export default function ResponsiveImage() {
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <img
          src="/images/grid-image/image-01.png"
          alt="Cover"
          className="w-full border border-gray-200 rounded-xl dark:border-gray-800"
        />
      </div>
    </div>
  );
}
