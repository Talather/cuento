import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface RatingSliderProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export const RatingSlider = ({ id, label, value, onChange }: RatingSliderProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-left">{label}</Label>
      <Slider
        id={id}
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        className="py-4"
      />
      <div className="text-sm text-muted-foreground text-center">
        {value}/10
      </div>
    </div>
  );
};