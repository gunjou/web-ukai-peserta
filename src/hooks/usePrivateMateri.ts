import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";
import { getPrivateMateri, Materi } from "@/services/materi.service";

export function usePrivateMateri(type: "document" | "video") {
  const [data, setData] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const token = getAccessToken();
        if (!token) return;

        const res = await getPrivateMateri(type, token);
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [type]);

  return { data, loading };
}
