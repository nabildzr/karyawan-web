// * Frontend module: karyawan-web/src/components/form/form-elements/ToggleSwitch.tsx
// & This file defines frontend UI or logic for ToggleSwitch.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk ToggleSwitch.tsx.

import ComponentCard from "../../common/ComponentCard";
import Switch from "../switch/Switch";

export default function ToggleSwitch() {
  const handleSwitchChange = (checked: boolean) => {
    console.log("Switch is now:", checked ? "ON" : "OFF");
  };
  return (
    <ComponentCard title="Toggle switch input">
      <div className="flex gap-4">
        <Switch
          label="Default"
          defaultChecked={true}
          onChange={handleSwitchChange}
        />
        <Switch
          label="Checked"
          defaultChecked={true}
          onChange={handleSwitchChange}
        />
        <Switch label="Disabled" disabled={true} />
      </div>{" "}
      <div className="flex gap-4">
        <Switch
          label="Default"
          defaultChecked={true}
          onChange={handleSwitchChange}
          color="gray"
        />
        <Switch
          label="Checked"
          defaultChecked={true}
          onChange={handleSwitchChange}
          color="gray"
        />
        <Switch label="Disabled" disabled={true} color="gray" />
      </div>
    </ComponentCard>
  );
}
