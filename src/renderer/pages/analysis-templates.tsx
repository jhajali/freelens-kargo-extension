import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { AnalysisTemplate, type AnalysisTemplateApi } from "../k8s/kargo/analysis-template-v1alpha1";
import styles from "./analysis-templates.module.scss";
import stylesInline from "./analysis-templates.module.scss?inline";

const {
  Component: { KubeObjectListLayout, KubeObjectAge, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = AnalysisTemplate;
type KubeObject = AnalysisTemplate;
type KubeObjectApi = AnalysisTemplateApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  metrics: (object: KubeObject) => KubeObject.getMetricsCount(object),
  args: (object: KubeObject) => KubeObject.getArgsCount(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Metrics", sortBy: "metrics", className: styles.metrics },
  { title: "Args", sortBy: "args", className: styles.args },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const AnalysisTemplatesPage = observer(() =>
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
              KubeObject.getMetricsCount(object),
              KubeObject.getArgsCount(object),
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
