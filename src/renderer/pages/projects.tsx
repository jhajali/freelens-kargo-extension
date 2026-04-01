import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { getProjectPhaseClass, getProjectPhaseText } from "../components/status-conditions";
import { Project, type ProjectApi } from "../k8s/kargo/project-v1alpha1";
import styles from "./projects.module.scss";
import stylesInline from "./projects.module.scss?inline";

const {
  Component: { Badge, KubeObjectListLayout, KubeObjectAge, WithTooltip },
} = Renderer;

const KubeObject = Project;
type KubeObject = Project;
type KubeObjectApi = ProjectApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  phase: (object: KubeObject) => KubeObject.getPhase(object),
  policies: (object: KubeObject) => KubeObject.getPromotionPoliciesCount(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Phase", sortBy: "phase", className: styles.phase },
  { title: "Promotion Policies", sortBy: "policies", className: styles.policies },
  { title: "Age", sortBy: "age", className: styles.age },
];

export const ProjectsPage = observer(() =>
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
            const phase = KubeObject.getPhase(object);
            return [
              <WithTooltip>{object.getName()}</WithTooltip>,
              <Badge label={getProjectPhaseText(phase)} className={getProjectPhaseClass(phase)} />,
              KubeObject.getPromotionPoliciesCount(object),
              <KubeObjectAge object={object} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
