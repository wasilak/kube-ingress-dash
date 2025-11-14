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
  const options: MultiSelectOption[] = namespaces.map(ns => ({ value: ns, label: ns }));

  return (
    <div aria-label="Namespace Filter" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <MultiSelect
        options={options}
        onValueChange={onChange}
        defaultValue={selected}
        placeholder="Select namespaces"
        hideSelectAll={false}
        maxCount={2} // Show up to 2 namespace badges, then show "+X selected"
      />
    </div>
  );
};

export { NamespaceFilter };
