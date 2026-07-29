// components/scene/SceneStatusBadge.jsx

import Icon from "@/components/common/Icon";
import { SCENE_STATUS } from "@/lib/constants";

const CONFIG = {
  [SCENE_STATUS.PROCESSING]: {
    label: "Processing",
    icon: "hourglass_top",
    classes: "bg-primary/10 text-primary border-primary/20",
  },
  [SCENE_STATUS.COMPLETED]: {
    label: "Completed",
    icon: "check_circle",
    classes: "bg-success/10 text-success border-success/20",
  },
  [SCENE_STATUS.FAILED]: {
    label: "Failed",
    icon: "error",
    classes: "bg-error/10 text-error border-error/20",
  },
};

export default function SceneStatusBadge({ status }) {
  const config = CONFIG[status] || CONFIG[SCENE_STATUS.PROCESSING];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-label-caps text-label-caps ${config.classes}`}
    >
      <Icon name={config.icon} filled size={14} />
      {config.label}
    </span>
  );
}