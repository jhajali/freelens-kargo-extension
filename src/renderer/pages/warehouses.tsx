import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { Warehouse, type WarehouseApi } from "../k8s/kargo/warehouse-v1alpha1";
import styles from "./warehouses.module.scss";
import stylesInline from "./warehouses.module.scss?inline";

const {
  Component: { KubeObjectListLayout, KubeObjectAge, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = Warehouse;
type KubeObject = Warehouse;
type KubeObjectApi = WarehouseApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  policy: (object: KubeObject) => KubeObject.getFreightCreationPolicy(object),
  subscriptions: (object: KubeObject) => KubeObject.getSubscriptionsSummary(object),
  lastFreight: (object: KubeObject) => KubeObject.getLastFreightName(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Freight Creation", sortBy: "policy", className: styles.policy },
  { title: "Subscriptions", sortBy: "subscriptions", className: styles.subscriptions },
  { title: "Last Freight", sortBy: "lastFreight", className: styles.lastFreight },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const WarehousesPage = observer(() =>
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
              <WithTooltip>{KubeObject.getFreightCreationPolicy(object)}</WithTooltip>,
              <WithTooltip>{KubeObject.getSubscriptionsSummary(object)}</WithTooltip>,
              <WithTooltip>{KubeObject.getLastFreightName(object) || "\u2014"}</WithTooltip>,
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
