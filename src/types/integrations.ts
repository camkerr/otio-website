export type Integration = {
  id?: string;
  name: string;
  type: "app" | "tool";
  description: string;
  company: string;
  logo: string;
  categories: string[];
  media: MediaItem[];
  url?: string;
};

export type MediaItem = {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  isHero?: boolean;
};
