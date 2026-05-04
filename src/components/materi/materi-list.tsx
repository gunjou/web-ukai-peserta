import MateriCard from "./materi-card";

import { Materi } from "@/services/materi.service";

interface Props {
  materi: Materi[];
}

export default function MateriList({ materi }: Props) {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4

        lg:grid-cols-2
      "
    >
      {materi.map((item) => (
        <MateriCard key={item.id} materi={item} />
      ))}
    </div>
  );
}
