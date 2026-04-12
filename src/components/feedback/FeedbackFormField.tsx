import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackFormFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "textarea";
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export const FeedbackFormField = ({
  id,
  label,
  type = "text",
  required = false,
  value,
  onChange,
}: FeedbackFormFieldProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-left">
        {label} {required && "*"}
      </Label>
      {type === "textarea" ? (
        <Textarea
          id={id}
          maxLength={1024}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-32"
        />
      ) : (
        <Input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
};