import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import {
  getStageHealthClass,
  getStageHealthText,
  getStagePhaseClass,
  getStagePhaseText,
} from "../components/status-conditions";
import { Stage, type StageApi } from "../k8s/kargo/stage-v1alpha1";
import styles from "./stages.module.scss";
import stylesInline from "./stages.module.scss?inline";

const {
  Component: { Badge, KubeObjectListLayout, KubeObjectAge, NamespaceSelectBadge, WithTooltip },
} = Renderer;

const KubeObject = Stage;
type KubeObject = Stage;
type KubeObjectApi = StageApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  project: (object: KubeObject) => KubeObject.getProject(object),
  phase: (object: KubeObject) => KubeObject.getPhase(object),
  health: (object: KubeObject) => KubeObject.getHealth(object),
  freight: (object: KubeObject) => KubeObject.getCurrentFreightName(object),
  upstream: (object: KubeObject) => KubeObject.getUpstreamStages(object).join(","),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Project", sortBy: "project", className: styles.project },
  { title: "Phase", sortBy: "phase", className: styles.phase },
  { title: "Health", sortBy: "health", className: styles.health },
  { title: "Current Freight", sortBy: "freight", className: styles.freight },
  { title: "Upstream Stages", sortBy: "upstream", className: styles.upstream },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const StagesPage = observer(() =>
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
              <WithTooltip>{KubeObject.getProject(object)}</WithTooltip>,
              <Badge
                label={getStagePhaseText(object.status?.phase)}
                className={getStagePhaseClass(object.status?.phase)}
              />,
              <Badge
                label={getStageHealthText(object.status?.health?.status)}
                className={getStageHealthClass(object.status?.health?.status)}
              />,
              <WithTooltip>{KubeObject.getCurrentFreightName(object)}</WithTooltip>,
              <WithTooltip>{KubeObject.getUpstreamStages(object).join(", ") || "\u2014"}</WithTooltip>,
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
