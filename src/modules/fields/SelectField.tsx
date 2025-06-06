import React from "react";

interface Option {
  label: string;
  value: string;
  id?: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string, id?: string) => void;
  options?: Option[] | string[];
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  optionText?: string;
  dynamicOptions?: {
    collection: string;
    displayField: string;
    currentValue?: string;
  };
}

// Comprehensive list of calculation variables matching the calculation output
const CALCULATION_VARIABLES = [
  // Basic measurements (from woningSpecifiek)
  "breedte",
  "diepte",
  "gootHoogte",
  "nokHoogte",
  "aantalWoningen",
  "heeftPlatDak",
  "bouwlagen",
  "breedteComplex",
  "kopgevels",
  "portieken",
  "breedteWoningPlusHoogte",
  
  
  // Gevel calculations
  "gevelOppervlakVoor",
  "gevelOppervlakAchter",
  "gevelOppervlakTotaal",
  "gevelOppervlakNetto",
  "brutoKopgevelOppervlak",
  
  // Dak calculations
  "dakOppervlak",
  "dakOppervlakTotaal",
  "dakLengte",
  "dakLengteTotaal",
  "dakOverstekOppervlak",
  "dakTotaalMetOverhang",
  "lengteDakvlak",
  "lengteDakvlakPlusBreedteWoning",
  
  // Vloer calculations
  "vloerOppervlak",
  "vloerOppervlakTotaal",
  "vloerOppervlakteBeganeGrond",
  "oppervlakteKelder", // Hier is de nieuwe variabele toegevoegd
  
  // Kozijn measurements
  "kozijnOppervlakVoorTotaal",
  "kozijnOppervlakAchterTotaal",
  "kozijnOppervlakTotaal",
  "kozijnRendementTotaal",
  "kozijnOmtrekTotaal",
  "kozijnOppervlakteWoning",
  "glasOppervlakteWoning",
  
  // Kozijn by size categories
  "kozijn05", 
  "kozijn10", 
  "kozijn15", 
  "kozijn20", 
  "kozijn25", 
  "kozijn30", 
  "kozijn35", 
  "kozijn40",
  
  // Window perimeter measurements
  "vensterbankLengte",
  "vensterbankLengteTotaal",
  "omtrekVoordeur",
  "omtrekAchterdeur",
  "omtrekKozijnen",
  "omtrekDraaidelen",
  
  // Plinth and other perimeter measurements
  "vloerplintLengte",
  "vloerplintLengteTotaal",
  "omtrekSandwichElementen",
  
  // Room measurements
  "oppervlakteHal",
  "aantalSlaapkamers",
  
  // Ventilation
  "zrRooster",
  "zrRoosterLengte",
  
  // PV Panel measurements
  "aantalPVPanelenGGB",
  "oppervlaktePVPanelenGGB",
  "aantalPVPanelenKop",
  "oppervlaktePVPanelenKop",
  "aantalPVPanelenLangs",
  "oppervlaktePVPanelenLangs",
  
  // Project totals
  "projectGevelOppervlak",
  "projectKozijnenOppervlak",
  "projectDakOppervlak",
  "projectOmtrek",
  
  // Backward compatibility with old variable names
  "AantalWoningen",
  "Dakoppervlak",
  "LengteDakvlak",
  "BreedteWoning",
  "NettoGevelOppervlak",
  "Hoogte",
  "VensterbankLengte",
  "VloerOppervlakteBeganeGrond",
  "OmtrekKozijnen",
  
  // Common constants
  "0.3",
  "0.75",
  "1.1",
  "1.05",
  "2",
  "2.39",
  "3",
  "4",
  "5",
  "0.1",
  "0.05",
  "477"

];

export function SelectField({
  label,
  value,
  onChange,
  options: providedOptions,
  required,
  disabled,
  isEditing,
  optionText,
  dynamicOptions,
}: SelectFieldProps) {
  
  // Convert the static variables into option objects
  const staticOptions = CALCULATION_VARIABLES.map(variable => ({
    label: variable,
    value: variable,
    id: variable, // Using the variable name as the ID for simplicity
  }));
  
  // Use provided options if available, otherwise use static variables
  const finalOptions = providedOptions
    ? Array.isArray(providedOptions)
      ? providedOptions.map((opt) =>
          typeof opt === "string" ? { label: opt, value: opt } : opt
        )
      : []
    : staticOptions;

  return (
    <div className="form-field">
      <label className="field-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      {isEditing ? (
        <select
          value={value}
          onChange={(e) => {
            const selectedOption = finalOptions.find(
              (opt) => opt.value === e.target.value
            );
            onChange(e.target.value, selectedOption?.id);
          }}
          className="input-base"
          required={required}
          disabled={disabled}
        >
          <option value="">{optionText || "Select an option"}</option>
          {finalOptions.map((option) => (
            <option key={`${label}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="input-read-only">
          {value || <span className="empty-reference">-</span>}
        </div>
      )}
    </div>
  );
}