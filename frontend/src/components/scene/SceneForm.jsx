// components/scene/SceneForm.jsx
// Title field removed — no backend equivalent on submissions.
// Episode reference maps to source_episode.

import Icon from "@/components/common/Icon";

export default function SceneForm({ sourceEpisode, setSourceEpisode, content, setContent }) {
  return (
    <>
      {/* Metadata row */}
      <div className="grid grid-cols-1 gap-card-gap">
        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-label-caps text-on-surface-variant">
            EPISODE REFERENCE
          </label>
          <input
            type="text"
            value={sourceEpisode}
            onChange={(e) => setSourceEpisode(e.target.value)}
            placeholder="e.g. S04 E08"
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
