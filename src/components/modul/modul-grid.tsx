import { Modul } from "@/services/modul.service";
import ModulCard from "./modul-card";

interface Props {
  modules: Modul[];

  basePath: string;
}

export default function ModulGrid({ modules, basePath }: Props) {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4

        sm:grid-cols-2

        xl:grid-cols-3
      "
    >
      {modules.map((modul) => (
        <ModulCard
          key={modul.id}
          modul={modul}
          href={`${basePath}/${modul.id}`}
        />
      ))}
    </div>
  );
}
