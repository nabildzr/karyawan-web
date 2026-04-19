// * Frontend module: karyawan-web/src/components/form/form-elements/FileInputExample.tsx
// & This file defines frontend UI or logic for FileInputExample.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk FileInputExample.tsx.

import ComponentCard from "../../common/ComponentCard";
import FileInput from "../input/FileInput";
import Label from "../Label";

export default function FileInputExample() {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
    }
  };

  return (
    <ComponentCard title="File Input">
      <div>
        <Label>Upload file</Label>
        <FileInput onChange={handleFileChange} className="custom-class" />
      </div>
    </ComponentCard>
  );
}
