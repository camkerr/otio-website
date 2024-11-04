import "@/styles/editor.css";
import { Lock, Monitor, Eye, Mic, Volume2, Settings } from "lucide-react";

interface TrackItem {
  content: string;
  image?: string;
  name: string;
  track: number;
  type: string;
  start: number;
  end: number;
}

function clipGenerator(count: number): TrackItem[] {
  const clips: TrackItem[] = [];
  for (let i = 0; i < count; i++) {
    clips.push({
      content: `Clip ${i}`,
      name: `Clip ${i}`,
      track: Math.floor(Math.random() * 3),
      type: "text",
      start: i * 100,
      end: (i + 1) * 100,
    });
  }
  return clips;
}

const TrackItem = ({ item }: { item: TrackItem }) => {
  return <div className="clip"></div>;
};

export const Sequence = ({ clips }: { clips: TrackItem[] }) => {
  return (
    <div className="timeline-container">
      <div className="track-group">
        <div className="track">
          <div className="track-definition">
            <div className="track-header">
              <div className="track-locked">
                <Lock size={16} />
              </div>
              <div className="track-label">H1</div>
              <div className="track-name">H1</div>
              <div className="track-controls">
                <button>
                  <Monitor size={16} />
                </button>
                <button>
                  <Eye size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="track-content">
            {clipGenerator(20).map((item) => (
              <TrackItem item={item} key={item.name} />
            ))}
          </div>
        </div>
        <div className="track">
          <div className="track-definition">
            <div className="track-header">
              <div className="track-locked"></div>
              <div className="track-label">H1</div>
              <div className="track-name">H1</div>
              <div className="track-controls"></div>
            </div>
          </div>
        </div>
        <div className="track">
          <div className="track-definition">
            <div className="track-header">
              <div className="track-locked"></div>
              <div className="track-label">H2</div>
              <div className="track-name">H2</div>
              <div className="track-controls"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
