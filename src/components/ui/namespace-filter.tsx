import React from "react";
import { MultiSelect, MultiSelectOption } from "../multi-select";
import { Badge } from "./badge";

export interface NamespaceFilterProps {
  namespaces: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const NamespaceFilter: React.FC<NamespaceFilterProps> = ({
  namespaces,
  selected,
  onChange
}) => {
  // Add "All" option to the beginning
  const options: MultiSelectOption[] = [
    { value: "All", label: "All" },
    ...namespaces.map(ns => ({ value: ns, label: ns }))
  ];

  // Check if "All" is selected
  const isAllSelected = selected.length === 1 && selected[0] === "All";

  const handleValueChange = (values: string[]) => {
    if (values.includes("All")) {
      // If "All" is selected along with other values, just select "All"
      onChange(["All"]);
    } else {
      // Remove "All" if other options are selected
      onChange(values);
    }
  };

  return (
    <div aria-label="Namespace Filter" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <MultiSelect
        options={options}
        onValueChange={handleValueChange}
        defaultValue={selected}
        placeholder={isAllSelected ? "All namespaces" : "Select namespaces"}
        hideSelectAll={false}
        maxCount={2} // Show up to 2 namespace badges, then show "+X selected"
      />
    </div>
  );
};

export { NamespaceFilter };
