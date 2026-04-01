import { Common } from "@freelensapp/extensions";
import styles from "./promotion-overlay.module.scss";
import stylesInline from "./promotion-overlay.module.scss?inline";

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
      <style>{stylesInline}</style>
      <div className={cssNames(styles.overlay, phaseClass)}>{phase}</div>
    </>
  );
}
