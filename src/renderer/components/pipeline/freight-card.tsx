import type { FreightReference } from "../../k8s/kargo/types";
import styles from "./freight-card.module.scss";
import stylesInline from "./freight-card.module.scss?inline";

export interface FreightCardProps {
  freight: FreightReference;
  onClick?: () => void;
}

export function FreightCard({ freight, onClick }: FreightCardProps) {
  const name = freight.name?.substring(0, 7) ?? "";
  const summary = freight.images?.[0]
    ? `${freight.images[0].repoURL ?? ""}:${freight.images[0].tag ?? ""}`
    : freight.commits?.[0]?.id?.substring(0, 7)
    ?? freight.charts?.[0]?.version
    ?? "";

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.freightCard} onClick={onClick}>
        <span className={styles.alias}>{name}</span>
        {summary && <span className={styles.summary}>{summary}</span>}
      </div>
    </>
  );
}
