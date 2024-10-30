import "../../styles/editor.css";

interface TrackItem {
  content: string;
  image?: string;
  name: string;
  track: number;
  type: string;
}

const Timeline = (clips: TrackItem[]) => {
  return (
    <>
      <div>Track labels</div>
      <div>
        Main horizontal scroll area
        <div>Track 1</div>
        <div>Track 2</div>
        <div>Track 3</div>
      </div>
    </>
  );
};

export { Timeline };
