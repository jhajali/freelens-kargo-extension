import { Renderer } from "@freelensapp/extensions";
import { AnalysisTemplateDetails } from "./components/details/analysis-template-details";
import { FreightDetails } from "./components/details/freight-details";
import { ProjectDetails } from "./components/details/project-details";
import { PromotionDetails } from "./components/details/promotion-details";
import { PromotionPolicyDetails } from "./components/details/promotion-policy-details";
import { StageDetails } from "./components/details/stage-details";
import { WarehouseDetails } from "./components/details/warehouse-details";
import svgIcon from "./icons/kargo.svg?raw";
import { AnalysisTemplate } from "./k8s/kargo/analysis-template-v1alpha1";
import { Freight } from "./k8s/kargo/freight-v1alpha1";
import { Project } from "./k8s/kargo/project-v1alpha1";
import { Promotion } from "./k8s/kargo/promotion-v1alpha1";
import { PromotionPolicy } from "./k8s/kargo/promotion-policy-v1alpha1";
import { Stage } from "./k8s/kargo/stage-v1alpha1";
import { Warehouse } from "./k8s/kargo/warehouse-v1alpha1";
import { AbortPromotionMenuItem, type AbortPromotionMenuItemProps } from "./menus/abort-promotion-menu-item";
import { ApproveFreightMenuItem, type ApproveFreightMenuItemProps } from "./menus/approve-freight-menu-item";
import { PromoteFreightMenuItem, type PromoteFreightMenuItemProps } from "./menus/promote-freight-menu-item";
import { RefreshWarehouseMenuItem, type RefreshWarehouseMenuItemProps } from "./menus/refresh-warehouse-menu-item";
import { AnalysisTemplatesPage } from "./pages/analysis-templates";
import { FreightPage } from "./pages/freight";
import { KargoOverviewPage } from "./pages/overview";
import { ProjectsPage } from "./pages/projects";
import { PromotionPoliciesPage } from "./pages/promotion-policies";
import { PromotionsPage } from "./pages/promotions";
import { StagesPage } from "./pages/stages";
import { WarehousesPage } from "./pages/warehouses";

const {
  Component: { Icon },
} = Renderer;

export function KargoIcon(props: Renderer.Component.IconProps) {
  return <Icon {...props} svg={svgIcon} />;
}

export default class KargoExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: "dashboard",
      components: {
        Page: () => <KargoOverviewPage />,
      },
    },
    {
      id: "projects",
      components: {
        Page: () => <ProjectsPage />,
      },
    },
    {
      id: "stages",
      components: {
        Page: () => <StagesPage />,
      },
    },
    {
      id: "freight",
      components: {
        Page: () => <FreightPage />,
      },
    },
    {
      id: "warehouses",
      components: {
        Page: () => <WarehousesPage />,
      },
    },
    {
      id: "promotions",
      components: {
        Page: () => <PromotionsPage />,
      },
    },
    {
      id: "promotion-policies",
      components: {
        Page: () => <PromotionPoliciesPage />,
      },
    },
    {
      id: "analysis-templates",
      components: {
        Page: () => <AnalysisTemplatesPage />,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: "kargo",
      title: "Kargo",
      target: { pageId: "dashboard" },
      components: {
        Icon: KargoIcon,
      },
    },
    {
      id: "dashboard",
      parentId: "kargo",
      target: { pageId: "dashboard" },
      title: "Overview",
      components: {},
    },
    {
      id: "projects",
      parentId: "kargo",
      target: { pageId: "projects" },
      title: Project.crd.title,
      components: {},
    },
    {
      id: "stages",
      parentId: "kargo",
      target: { pageId: "stages" },
      title: Stage.crd.title,
      components: {},
    },
    {
      id: "freight",
      parentId: "kargo",
      target: { pageId: "freight" },
      title: Freight.crd.title,
      components: {},
    },
    {
      id: "warehouses",
      parentId: "kargo",
      target: { pageId: "warehouses" },
      title: Warehouse.crd.title,
      components: {},
    },
    {
      id: "promotions",
      parentId: "kargo",
      target: { pageId: "promotions" },
      title: Promotion.crd.title,
      components: {},
    },
    {
      id: "promotion-policies",
      parentId: "kargo",
      target: { pageId: "promotion-policies" },
      title: PromotionPolicy.crd.title,
      components: {},
    },
    {
      id: "analysis-templates",
      parentId: "kargo",
      target: { pageId: "analysis-templates" },
      title: AnalysisTemplate.crd.title,
      components: {},
    },
  ];

  kubeObjectDetailItems = [
    {
      kind: Project.kind,
      apiVersions: Project.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Project>) => <ProjectDetails {...props} />,
      },
    },
    {
      kind: Stage.kind,
      apiVersions: Stage.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Stage>) => <StageDetails {...props} />,
      },
    },
    {
      kind: Freight.kind,
      apiVersions: Freight.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Freight>) => <FreightDetails {...props} />,
      },
    },
    {
      kind: Warehouse.kind,
      apiVersions: Warehouse.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Warehouse>) => <WarehouseDetails {...props} />,
      },
    },
    {
      kind: Promotion.kind,
      apiVersions: Promotion.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Promotion>) => <PromotionDetails {...props} />,
      },
    },
    {
      kind: PromotionPolicy.kind,
      apiVersions: PromotionPolicy.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<PromotionPolicy>) => (
          <PromotionPolicyDetails {...props} />
        ),
      },
    },
    {
      kind: AnalysisTemplate.kind,
      apiVersions: AnalysisTemplate.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<AnalysisTemplate>) => (
          <AnalysisTemplateDetails {...props} />
        ),
      },
    },
  ];

  kubeObjectMenuItems = [
    {
      kind: Stage.kind,
      apiVersions: Stage.crd.apiVersions,
      components: {
        MenuItem: (props: PromoteFreightMenuItemProps) => (
          <PromoteFreightMenuItem {...props} resource={Stage} />
        ),
      },
    },
    {
      kind: Warehouse.kind,
      apiVersions: Warehouse.crd.apiVersions,
      components: {
        MenuItem: (props: RefreshWarehouseMenuItemProps) => (
          <RefreshWarehouseMenuItem {...props} resource={Warehouse} />
        ),
      },
    },
    {
      kind: Freight.kind,
      apiVersions: Freight.crd.apiVersions,
      components: {
        MenuItem: (props: ApproveFreightMenuItemProps) => (
          <ApproveFreightMenuItem {...props} resource={Freight} />
        ),
      },
    },
    {
      kind: Promotion.kind,
      apiVersions: Promotion.crd.apiVersions,
      components: {
        MenuItem: (props: AbortPromotionMenuItemProps) => (
          <AbortPromotionMenuItem {...props} resource={Promotion} />
        ),
      },
    },
  ];
}
