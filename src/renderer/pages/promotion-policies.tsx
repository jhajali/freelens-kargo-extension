import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { getAutoPromotionClass, getAutoPromotionText } from "../components/status-conditions";
import { PromotionPolicy, type PromotionPolicyApi } from "../k8s/kargo/promotion-policy-v1alpha1";
import styles from "./promotion-policies.module.scss";
import stylesInline from "./promotion-policies.module.scss?inline";

const {
  Component: { Badge, KubeObjectListLayout, KubeObjectAge, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = PromotionPolicy;
type KubeObject = PromotionPolicy;
type KubeObjectApi = PromotionPolicyApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  stage: (object: KubeObject) => KubeObject.getStage(object),
  autoPromotion: (object: KubeObject) => KubeObject.isAutoPromotionEnabled(object) ? 1 : 0,
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Stage", sortBy: "stage", className: styles.stage },
  { title: "Auto-Promotion", sortBy: "autoPromotion", className: styles.autoPromotion },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const PromotionPoliciesPage = observer(() =>
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
            const autoPromo = KubeObject.isAutoPromotionEnabled(object);
            return [
              <WithTooltip>{object.getName()}</WithTooltip>,
              <NamespaceSelectBadge key="namespace" namespace={object.getNs() ?? ""} />,
              <WithTooltip>{KubeObject.getStage(object)}</WithTooltip>,
              <Badge label={getAutoPromotionText(autoPromo)} className={getAutoPromotionClass(autoPromo)} />,
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
