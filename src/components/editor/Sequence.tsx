import "@/styles/editor.css";
import { Lock, Monitor, Eye, Mic, Volume2, Settings } from "lucide-react";

interface TrackItem {
  id: number;
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
      id: i,
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

const ClipRenderer = ({ item }: { item: TrackItem }) => {
  return (
    <div
      style={{ 
        left: item.start - 8, 
        width: item.end - item.start,
        marginLeft: '2px',
      }}
      className="clip border-6 border-blue-500"
    >
      {item.content}
    </div>
  );
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
              <div className="track-label">{"<h1>"}</div>
              <div className="track-name">Header 1</div>
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
              <ClipRenderer key={item.name} item={item} />
            ))}
          </div>
        </div>
        <div className="track">
          <div className="track-definition">
            <div className="track-header">
              <div className="track-locked">
                <Lock size={16} />
              </div>
              <div className="track-label">{"<h2>"}</div>
              <div className="track-name">Header 2</div>
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
        </div>
        <div className="track">
          <div className="track-definition">
            <div className="track-header">
              <div className="track-locked">
                <Lock size={16} />
              </div>
              <div className="track-label">{"<h3>"}</div>
              <div className="track-name">Header 3</div>
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
        </div>
        <div className="track">
          <div className="track-definition">
            <div className="track-header">
              <div className="track-locked">
                <Lock size={16} />
              </div>
              <div className="track-label">{"<img>"}</div>
              <div className="track-name">Image</div>
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
        </div>
        <div className="track">
          <div className="track-definition">
            <div className="track-header">
              <div className="track-locked">
                <Lock size={16} />
              </div>
              <div className="track-label">{"<p>"}</div>
              <div className="track-name">Paragraph</div>
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
        </div>
      </div>
    </div>
  );
};
