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
      />
      {selected.length > 0 && (
        <div className="flex gap-1">
          {selected.map(ns => (
            <Badge key={ns} variant="secondary">{ns}</Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export { NamespaceFilter };
