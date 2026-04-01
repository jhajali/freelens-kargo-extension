import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { useEffect, useRef, useState } from "react";
import { Freight } from "../../k8s/kargo/freight-v1alpha1";
import { Stage } from "../../k8s/kargo/stage-v1alpha1";
import { Warehouse } from "../../k8s/kargo/warehouse-v1alpha1";
import { FreightCard } from "./freight-card";
import { PromotionOverlay } from "./promotion-overlay";
import { StageNode } from "./stage-node";
import styles from "./pipeline-graph.module.scss";
import stylesInline from "./pipeline-graph.module.scss?inline";

const {
  Component: { NamespaceSelectFilter },
  Navigation: { getDetailsUrl },
} = Renderer;

const {
  Util: { cssNames },
} = Common;

export interface PipelineGraphProps {
  stages: Stage[];
  warehouses: Warehouse[];
  freight: Freight[];
}

export const PipelineGraph = observer(({ stages, warehouses, freight }: PipelineGraphProps) => {
  const navigate = Renderer.Navigation.navigate;

  const handleStageClick = (stage: Stage) => {
    const url = stage.selfLink;
    if (url) navigate(getDetailsUrl(url));
  };

  const handleWarehouseClick = (warehouse: Warehouse) => {
    const url = warehouse.selfLink;
    if (url) navigate(getDetailsUrl(url));
  };

  if (stages.length === 0 && warehouses.length === 0) {
    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.noData}>No Kargo resources found in selected namespace</div>
      </>
    );
  }

  // Build adjacency: warehouse -> stages that subscribe to it, stage -> downstream stages
  const warehouseStages = new Map<string, Stage[]>();
  const rootStages: Stage[] = [];
  const downstreamMap = new Map<string, Stage[]>();

  for (const stage of stages) {
    const warehouseSub = Stage.getWarehouseSubscription(stage);
    if (warehouseSub) {
      const existing = warehouseStages.get(warehouseSub) ?? [];
      existing.push(stage);
      warehouseStages.set(warehouseSub, existing);
    }

    const upstream = Stage.getUpstreamStages(stage);
    if (upstream.length === 0 && !warehouseSub) {
      rootStages.push(stage);
    }

    for (const upName of upstream) {
      const existing = downstreamMap.get(upName) ?? [];
      existing.push(stage);
      downstreamMap.set(upName, existing);
    }
  }

  // Flatten into pipeline rows: warehouse → first-level stages → downstream stages
  const renderPipelineRow = (startStages: Stage[], warehouseName?: string) => {
    const visited = new Set<string>();
    const levels: Stage[][] = [startStages];

    // BFS to build levels
    let currentLevel = startStages;
    while (currentLevel.length > 0) {
      const nextLevel: Stage[] = [];
      for (const s of currentLevel) {
        visited.add(s.getName());
        const downstream = downstreamMap.get(s.getName()) ?? [];
        for (const ds of downstream) {
          if (!visited.has(ds.getName())) {
            nextLevel.push(ds);
          }
        }
      }
      if (nextLevel.length > 0) levels.push(nextLevel);
      currentLevel = nextLevel;
    }

    return (
      <div key={warehouseName ?? "root"} className={styles.pipelineRow}>
        {warehouseName && (
          <>
            {warehouses
              .filter((w) => w.getName() === warehouseName)
              .map((w) => (
                <div
                  key={w.getName()}
                  className={styles.warehouseNode}
                  onClick={() => handleWarehouseClick(w)}
                >
                  <div className={styles.warehouseName}>{w.getName()}</div>
                  <div className={styles.warehouseType}>{Warehouse.getSubscriptionsSummary(w)}</div>
                </div>
              ))}
            <div className={styles.arrow}>{"\u2192"}</div>
          </>
        )}
        {levels.map((level, levelIdx) => (
          <div key={levelIdx} className={styles.stageGroup}>
            {levelIdx > 0 && <div className={styles.arrow}>{"\u2192"}</div>}
            {level.map((stage) => {
              const currentFreight = Stage.getCurrentFreight(stage);
              const currentPromoPhase = (stage.status?.currentPromotion as any)?.phase;
              return (
                <div key={stage.getName()} className={styles.stageWrapper}>
                  <PromotionOverlay phase={currentPromoPhase} />
                  <StageNode stage={stage} onClick={handleStageClick} />
                  {currentFreight?.name && (
                    <div className={styles.freightDock}>
                      <FreightCard
                        freight={currentFreight}
                        onClick={() => {
                          const f = freight.find((fr) => fr.getName() === currentFreight.name);
                          if (f?.selfLink) navigate(getDetailsUrl(f.selfLink));
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.pipelineContainer}>
        {Array.from(warehouseStages.entries()).map(([wName, wStages]) =>
          renderPipelineRow(wStages, wName),
        )}
        {rootStages.length > 0 && renderPipelineRow(rootStages)}
      </div>
    </>
  );
});
