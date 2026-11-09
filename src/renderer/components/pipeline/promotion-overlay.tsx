import { Common } from "@freelensapp/extensions";
import styles from "./promotion-overlay.module.scss";

const {
  Util: { cssNames },
} = Common;

export interface PromotionOverlayProps {
  phase?: string;
}

export function PromotionOverlay({ phase }: PromotionOverlayProps) {
  if (phase !== "Running" && phase !== "Pending") return null;

  const phaseClass = phase === "Running" ? styles.running : styles.pending;

  return (
    <>
      <div className={cssNames(styles.overlay, phaseClass)}>{phase}</div>
    </>
  );
}
