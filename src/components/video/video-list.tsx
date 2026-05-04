import VideoCard from "./video-card";

import { Materi } from "@/services/materi.service";

interface Props {
  videos: Materi[];
}

export default function VideoList({ videos }: Props) {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4

        lg:grid-cols-2
      "
    >
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
