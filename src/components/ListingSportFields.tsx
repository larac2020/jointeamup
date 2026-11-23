import { changeSportValue, sportFields, type SportValues } from "@/lib/listing-sports";

export function ListingSportFields({ sport, value, onChange, inputClassName }: {
  sport: string; value: SportValues; onChange: (value: SportValues) => void; inputClassName: string;
}) {
  return <div className="grid gap-4 sm:grid-cols-2">
    {sportFields(sport, value.format).map((field) => <label className="block" key={field.key}>
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{field.label}</span>
      <select aria-label={field.label} className={inputClassName} value={value[field.key] ?? ""}
        onChange={(event) => onChange(changeSportValue(sport, value, field.key, event.target.value))}>
        {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>)}
  </div>;
}