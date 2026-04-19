// * Frontend module: karyawan-web/src/components/ui/images/TwoColumnImageGrid.tsx
// & This file defines frontend UI or logic for TwoColumnImageGrid.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk TwoColumnImageGrid.tsx.

export default function TwoColumnImageGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <img
          src="/images/grid-image/image-02.png"
          alt=" grid"
          className="border border-gray-200 rounded-xl dark:border-gray-800"
        />
      </div>

      <div>
        <img
          src="/images/grid-image/image-03.png"
          alt=" grid"
          className="border border-gray-200 rounded-xl dark:border-gray-800"
        />
      </div>
    </div>
  );
}
