import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { useEffect, useRef, useState } from "react";
import { KargoEvents } from "../components/kargo-events";
import { InfoPage } from "../components/info-page";
import { StageHealthPieChart, PromotionResultsPieChart } from "../components/pie-chart";
import { PipelineGraph } from "../components/pipeline/pipeline-graph";
import { Freight } from "../k8s/kargo/freight-v1alpha1";
import { Promotion } from "../k8s/kargo/promotion-v1alpha1";
import { Stage } from "../k8s/kargo/stage-v1alpha1";
import { Warehouse } from "../k8s/kargo/warehouse-v1alpha1";
import styles from "./overview.module.scss";
import stylesInline from "./overview.module.scss?inline";

const {
  Component: { NamespaceSelectFilter, TabLayout },
} = Renderer;

const {
  Util: { cssNames },
} = Common;

export const KargoOverviewPage = observer(() => {
  const [loaded, setLoaded] = useState(false);
  const watches = useRef<(() => void)[]>([]);
  const abortController = useRef(new AbortController());

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const namespaceStore = Renderer.K8sApi.namespaceStore;
      await namespaceStore.loadAll({ namespaces: [], reqInit: { signal: abortController.current.signal } });
      watches.current.push(namespaceStore.subscribe());

      const namespaces = namespaceStore.items.map((ns) => ns.getName());

      for (const object of [Stage, Warehouse, Freight, Promotion]) {
        try {
          const store = object.getStore();
          if (!store) continue;
          await store.loadAll({ namespaces, reqInit: { signal: abortController.current.signal } });
          watches.current.push(store.subscribe());
        } catch (_) {
          continue;
        }
      }

      if (isMounted) setLoaded(true);
    })();

    return () => {
      isMounted = false;
      abortController.current.abort();
      watches.current.forEach((w) => w());
      watches.current = [];
    };
  }, []);

  if (!loaded) {
    return <InfoPage message="Loading Kargo components..." />;
  }

  let stages: Stage[] = [];
  let warehouses: Warehouse[] = [];
  let freight: Freight[] = [];
  let promotions: Promotion[] = [];

  try {
    const stageStore = Stage.getStore<Stage>();
    if (stageStore) stages = stageStore.contextItems;
  } catch (_) {}

  try {
    const warehouseStore = Warehouse.getStore<Warehouse>();
    if (warehouseStore) warehouses = warehouseStore.contextItems;
  } catch (_) {}

  try {
    const freightStore = Freight.getStore<Freight>();
    if (freightStore) freight = freightStore.contextItems;
  } catch (_) {}

  try {
    const promotionStore = Promotion.getStore<Promotion>();
    if (promotionStore) promotions = promotionStore.contextItems;
  } catch (_) {}

  return (
    <>
      <style>{stylesInline}</style>
      <TabLayout>
        <div className={styles.kargoContent}>
          <header>
            <h5>Kargo Overview</h5>
            <NamespaceSelectFilter id="kargo-overview-namespace-select-filter-input" />
          </header>

          <div className={styles.pipelineSection}>
            <PipelineGraph stages={stages} warehouses={warehouses} freight={freight} />
          </div>

          <div className={styles.overviewStatuses}>
            <div className={styles.statuses}>
              {stages.length > 0 && (
                <div className={cssNames(styles.chartColumn, "column")}>
                  <StageHealthPieChart title="Stage Health" objects={stages} />
                </div>
              )}
              {promotions.length > 0 && (
                <div className={cssNames(styles.chartColumn, "column")}>
                  <PromotionResultsPieChart title="Promotion Results" objects={promotions} />
                </div>
              )}
            </div>
          </div>

          <KargoEvents compact compactLimit={100} />
        </div>
      </TabLayout>
    </>
  );
});
