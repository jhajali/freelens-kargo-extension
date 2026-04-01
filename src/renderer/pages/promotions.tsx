import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { getPromotionPhaseClass, getPromotionPhaseText } from "../components/status-conditions";
import { Promotion, type PromotionApi } from "../k8s/kargo/promotion-v1alpha1";
import styles from "./promotions.module.scss";
import stylesInline from "./promotions.module.scss?inline";

const {
  Component: { Badge, KubeObjectListLayout, KubeObjectAge, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = Promotion;
type KubeObject = Promotion;
type KubeObjectApi = PromotionApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  stage: (object: KubeObject) => KubeObject.getTargetStage(object),
  freight: (object: KubeObject) => KubeObject.getFreightRef(object),
  phase: (object: KubeObject) => KubeObject.getPhase(object),
  message: (object: KubeObject) => KubeObject.getMessage(object),
  finished: (object: KubeObject) => KubeObject.getFinishedAt(object) ?? "",
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Stage", sortBy: "stage", className: styles.stage },
  { title: "Freight", sortBy: "freight", className: styles.freight },
  { title: "Phase", sortBy: "phase", className: styles.phase },
  { title: "Message", sortBy: "message", className: styles.message },
  { title: "Finished", sortBy: "finished", className: styles.finished },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const PromotionsPage = observer(() =>
  withErrorPage(() => {
    const store = KubeObject.getStore<KubeObject>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<KubeObject, KubeObjectApi>
          tableId={`${KubeObject.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => {
            return [
              <WithTooltip>{object.getName()}</WithTooltip>,
              <NamespaceSelectBadge key="namespace" namespace={object.getNs() ?? ""} />,
              <WithTooltip>{KubeObject.getTargetStage(object)}</WithTooltip>,
              <WithTooltip>{KubeObject.getFreightRef(object)}</WithTooltip>,
              <Badge
                label={getPromotionPhaseText(object.status?.phase)}
                className={getPromotionPhaseClass(object.status?.phase)}
              />,
              <WithTooltip>{KubeObject.getMessage(object) || "\u2014"}</WithTooltip>,
              <WithTooltip>{KubeObject.getFinishedAt(object) || "\u2014"}</WithTooltip>,
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
