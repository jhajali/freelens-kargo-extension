import { Common } from "@freelensapp/extensions";
import type { Stage } from "../../k8s/kargo/stage-v1alpha1";
import styles from "./stage-node.module.scss";
import stylesInline from "./stage-node.module.scss?inline";

const {
  Util: { cssNames },
} = Common;

export interface StageNodeProps {
  stage: Stage;
  onClick?: (stage: Stage) => void;
}

export function StageNode({ stage, onClick }: StageNodeProps) {
  const health = stage.status?.health?.status ?? "Unknown";
  const phase = stage.status?.phase ?? "";

  const healthClass = health === "Healthy" ? styles.healthy
    : health === "Unhealthy" ? styles.unhealthy
    : health === "Progressing" ? styles.progressing
    : styles.unknown;

  return (
    <>
      <style>{stylesInline}</style>
      <div
        className={cssNames(styles.stageNode, healthClass)}
        onClick={() => onClick?.(stage)}
      >
        <div className={styles.stageName}>{stage.getName()}</div>
        <div className={styles.stagePhase}>{phase || "—"}</div>
      </div>
    </>
  );
}
