import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/multi-select/index';
import { IngressData } from '@/types/ingress';
import { Tag, FileText } from 'lucide-react';

interface DashboardFiltersProps {
  allLabels: string[];
  allAnnotations: string[];
  selectedLabels: string[];
  selectedAnnotations: string[];
  onLabelsChange: (labels: string[]) => void;
  onAnnotationsChange: (annotations: string[]) => void;
  ingresses: IngressData[];
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  allLabels,
  allAnnotations,
  selectedLabels,
  selectedAnnotations,
  onLabelsChange,
  onAnnotationsChange,
  ingresses,
}) => {
  const labelOptions = useMemo(
    () =>
      allLabels.map((label) => {
        const count = ingresses.filter((ing) => {
          if (!ing.labels) return false;
          return Object.keys(ing.labels).some((key) => `${key}:${ing.labels![key]}` === label);
        }).length;
        return { value: label, label: `${label} (${count})` };
      }),
    [allLabels, ingresses]
  );

  const annotationOptions = useMemo(
    () =>
      allAnnotations.map((annotation) => {
        const count = ingresses.filter((ing) => {
          if (!ing.annotations) return false;
          return Object.keys(ing.annotations).some(
            (key) => `${key}:${ing.annotations![key]}` === annotation
          );
        }).length;
        return { value: annotation, label: `${annotation} (${count})` };
      }),
    [allAnnotations, ingresses]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Labels
        </Label>
        <MultiSelect
          options={labelOptions}
          onValueChange={onLabelsChange}
          defaultValue={selectedLabels}
          placeholder="Select labels..."
          maxCount={2}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Annotations
        </Label>
        <MultiSelect
          options={annotationOptions}
          onValueChange={onAnnotationsChange}
          defaultValue={selectedAnnotations}
          placeholder="Select annotations..."
          maxCount={2}
        />
      </div>
    </div>
  );
};
