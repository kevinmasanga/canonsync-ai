// components/scene/SceneForm.jsx

import Icon from "@/components/common/Icon";

const EPISODES = [
  "S04 E08: The Glass Horizon",
  "S04 E09: Residual Echoes",
  "S04 E10: Terminal Protocol",
];

export default function SceneForm({ episode, setEpisode, title, setTitle, content, setContent }) {
  return (
    <>
      {/* Metadata row */}
      <div className="grid grid-cols-1 gap-card-gap md:grid-cols-12">
        <div className="flex flex-col gap-2 md:col-span-4">
          <label className="font-label-caps text-label-caps text-on-surface-variant">
            EPISODE REFERENCE
          </label>
          <div className="relative">
            <select
              value={episode}
              onChange={(e) => setEpisode(e.target.value)}
              className="input-etched w-full appearance-none rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {EPISODES.map((ep) => (
                <option key={ep}>{ep}</option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="pointer-events-none absolute right-3 top-3.5 text-on-surface-variant"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 md:col-span-8">
          <label className="font-label-caps text-label-caps text-on-surface-variant">
            SCENE TITLE
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. EXT. RAIN-SLICKED ALLEYWAY - NIGHT"
            className="input-etched w-full rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Textarea centerpiece */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container/50 px-4 py-2">
          <div className="flex gap-4">
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              FORMAT: SCREENPLAY
            </span>
            <span className="font-label-caps text-label-caps text-primary">
              LIVE CONTINUITY SCAN ACTIVE
            </span>
          </div>
          <div className="flex gap-2 text-on-surface-variant">
            <Icon name="format_align_left" size={16} className="cursor-pointer hover:text-primary" />
            <Icon name="history" size={16} className="cursor-pointer hover:text-primary" />
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          placeholder={`Enter scene text here...\n\nINT. COMMAND CENTER - DAY\n\nThe low hum of the servers fills the room. ELARA stares at the shifting data streams. Her hands hover over the console, hesitant.\n\nELARA\n(whispering)\nThe timeline shouldn't have shifted this far.`}
          className="flex-1 resize-none bg-transparent p-8 font-body-lg text-body-lg leading-relaxed text-on-surface placeholder-outline-variant/40 focus:outline-none"
        />
      </div>
    </>
  );
}