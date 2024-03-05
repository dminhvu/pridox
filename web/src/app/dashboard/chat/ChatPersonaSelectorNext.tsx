import { Persona } from "@/app/admin/personas/interfaces";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import { CustomDropdown } from "@/components/Dropdown";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
function PersonaItem({
  id,
  name,
  onSelect,
  isSelected,
}: {
  id: number;
  name: string;
  onSelect: (personaId: number) => void;
  isSelected: boolean;
}) {
  return (
    <div
      key={id}
      className={`
    flex
    px-3 
    text-sm 
    py-2 
    my-0.5
    rounded
    mx-1
    select-none 
    cursor-pointer 
    text-emphasis
    bg-background
    hover:bg-hover
  `}
      onClick={() => {
        onSelect(id);
      }}
    >
      {name}
      {isSelected && (
        <div className="ml-auto mr-1">
          <FiCheck />
        </div>
      )}
    </div>
  );
}

export function ChatPersonaSelector({
  personas,
  selectedPersonaId,
  onPersonaChange,
}: {
  personas: Persona[];
  selectedPersonaId: number | null;
  onPersonaChange: (persona: Persona | null) => void;
}) {

  return (
    <Select onValueChange={(value) => {
      const clickedPersona = personas.find(
        (persona) => persona.id.toString() === value
      );
      if (clickedPersona) {
        onPersonaChange(clickedPersona);
      }
    }}>
      <SelectTrigger className="ml-6 w-[240px]">
        <SelectValue placeholder="Select your persona" />
      </SelectTrigger>
      <SelectContent >
        <SelectGroup>
          <SelectLabel>Personas</SelectLabel>
          {personas.map((persona, ind) => {
            return (
              <SelectItem
                key={persona.name}
                value={persona.id.toString()}
              >
                {
                  persona.name
                }
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
