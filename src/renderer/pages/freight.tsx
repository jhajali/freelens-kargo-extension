import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { Freight, type FreightApi } from "../k8s/kargo/freight-v1alpha1";
import styles from "./freight.module.scss";
import stylesInline from "./freight.module.scss?inline";

const {
  Component: { KubeObjectListLayout, KubeObjectAge, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = Freight;
type KubeObject = Freight;
type KubeObjectApi = FreightApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  warehouse: (object: KubeObject) => KubeObject.getOriginWarehouse(object),
  alias: (object: KubeObject) => KubeObject.getAlias(object),
  commits: (object: KubeObject) => KubeObject.getCommits(object).length,
  images: (object: KubeObject) => KubeObject.getImages(object).length,
  charts: (object: KubeObject) => KubeObject.getCharts(object).length,
  verified: (object: KubeObject) => KubeObject.getVerifiedInCount(object),
  approved: (object: KubeObject) => KubeObject.getApprovedForCount(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Warehouse", sortBy: "warehouse", className: styles.warehouse },
  { title: "Alias", sortBy: "alias", className: styles.alias },
  { title: "Commits", sortBy: "commits", className: styles.commits },
  { title: "Images", sortBy: "images", className: styles.images },
  { title: "Charts", sortBy: "charts", className: styles.charts },
  { title: "Verified In", sortBy: "verified", className: styles.verified },
  { title: "Approved For", sortBy: "approved", className: styles.approved },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const FreightPage = observer(() =>
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
              <WithTooltip>{KubeObject.getOriginWarehouse(object)}</WithTooltip>,
              <WithTooltip>{KubeObject.getAlias(object)}</WithTooltip>,
              <WithTooltip>{KubeObject.getCommitsSummary(object) || "\u2014"}</WithTooltip>,
              <WithTooltip>{KubeObject.getImagesSummary(object) || "\u2014"}</WithTooltip>,
              <WithTooltip>{KubeObject.getChartsSummary(object) || "\u2014"}</WithTooltip>,
              KubeObject.getVerifiedInCount(object),
              KubeObject.getApprovedForCount(object),
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
