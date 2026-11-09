import { Renderer } from "@freelensapp/extensions";
import { AnalysisTemplateDetails } from "./components/details/analysis-template-details";
import { FreightDetails } from "./components/details/freight-details";
import { ProjectDetails } from "./components/details/project-details";
import { PromotionDetails } from "./components/details/promotion-details";
import { PromotionPolicyDetails } from "./components/details/promotion-policy-details";
import { StageDetails } from "./components/details/stage-details";
import { WarehouseDetails } from "./components/details/warehouse-details";
import {
  withDetailsErrorBoundary,
  withMenuItemErrorBoundary,
  withPageErrorBoundary,
} from "./components/error-boundary";
import svgIcon from "./icons/kargo.svg?raw";
import { AnalysisTemplate } from "./k8s/kargo/analysis-template-v1alpha1";
import { Freight } from "./k8s/kargo/freight-v1alpha1";
import { Project } from "./k8s/kargo/project-v1alpha1";
import { PromotionPolicy } from "./k8s/kargo/promotion-policy-v1alpha1";
import { Promotion } from "./k8s/kargo/promotion-v1alpha1";
import { Stage } from "./k8s/kargo/stage-v1alpha1";
import { Warehouse } from "./k8s/kargo/warehouse-v1alpha1";
import { AbortPromotionMenuItem } from "./menus/abort-promotion-menu-item";
import { ApproveFreightMenuItem } from "./menus/approve-freight-menu-item";
import { PromoteFreightMenuItem } from "./menus/promote-freight-menu-item";
import { RefreshWarehouseMenuItem } from "./menus/refresh-warehouse-menu-item";
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
  clusterPages: Renderer.LensExtension["clusterPages"] = [
    {
      id: "kargo-dashboard",
      components: {
        Page: () => <KargoOverviewPage />,
      },
    },
    {
      id: "kargo-projects",
      components: {
        Page: () => <ProjectsPage />,
      },
    },
    {
      id: "kargo-stages",
      components: {
        Page: () => <StagesPage />,
      },
    },
    {
      id: "kargo-freight",
      components: {
        Page: () => <FreightPage />,
      },
    },
    {
      id: "kargo-warehouses",
      components: {
        Page: () => <WarehousesPage />,
      },
    },
    {
      id: "kargo-promotions",
      components: {
        Page: () => <PromotionsPage />,
      },
    },
    {
      id: "kargo-promotion-policies",
      components: {
        Page: () => <PromotionPoliciesPage />,
      },
    },
    {
      id: "kargo-analysis-templates",
      components: {
        Page: () => <AnalysisTemplatesPage />,
      },
    },
  ].map((registration) => withPageErrorBoundary(this, registration));

  clusterPageMenus = [
    {
      id: "kargo",
      title: "Kargo",
      target: { pageId: "kargo-dashboard" },
      components: {
        Icon: KargoIcon,
      },
    },
    {
      id: "kargo-dashboard",
      parentId: "kargo",
      target: { pageId: "kargo-dashboard" },
      title: "Overview",
      components: {},
    },
    {
      id: "kargo-projects",
      parentId: "kargo",
      target: { pageId: "kargo-projects" },
      title: Project.crd.title,
      components: {},
    },
    {
      id: "kargo-stages",
      parentId: "kargo",
      target: { pageId: "kargo-stages" },
      title: Stage.crd.title,
      components: {},
    },
    {
      id: "kargo-freight",
      parentId: "kargo",
      target: { pageId: "kargo-freight" },
      title: Freight.crd.title,
      components: {},
    },
    {
      id: "kargo-warehouses",
      parentId: "kargo",
      target: { pageId: "kargo-warehouses" },
      title: Warehouse.crd.title,
      components: {},
    },
    {
      id: "kargo-promotions",
      parentId: "kargo",
      target: { pageId: "kargo-promotions" },
      title: Promotion.crd.title,
      components: {},
    },
    {
      id: "kargo-promotion-policies",
      parentId: "kargo",
      target: { pageId: "kargo-promotion-policies" },
      title: PromotionPolicy.crd.title,
      components: {},
    },
    {
      id: "kargo-analysis-templates",
      parentId: "kargo",
      target: { pageId: "kargo-analysis-templates" },
      title: AnalysisTemplate.crd.title,
      components: {},
    },
  ];

  kubeObjectDetailItems: Renderer.LensExtension["kubeObjectDetailItems"] = [
    Renderer.K8sApi.detailsFor(Project, { priority: 10, Details: ProjectDetails }),
    Renderer.K8sApi.detailsFor(Stage, { priority: 10, Details: StageDetails }),
    Renderer.K8sApi.detailsFor(Freight, { priority: 10, Details: FreightDetails }),
    Renderer.K8sApi.detailsFor(Warehouse, { priority: 10, Details: WarehouseDetails }),
    Renderer.K8sApi.detailsFor(Promotion, { priority: 10, Details: PromotionDetails }),
    Renderer.K8sApi.detailsFor(PromotionPolicy, { priority: 10, Details: PromotionPolicyDetails }),
    Renderer.K8sApi.detailsFor(AnalysisTemplate, { priority: 10, Details: AnalysisTemplateDetails }),
  ].map((registration) => withDetailsErrorBoundary(this, registration));

  kubeObjectMenuItems: Renderer.LensExtension["kubeObjectMenuItems"] = [
    Renderer.K8sApi.menuItemFor(Stage, { MenuItem: PromoteFreightMenuItem }),
    Renderer.K8sApi.menuItemFor(Warehouse, { MenuItem: RefreshWarehouseMenuItem }),
    Renderer.K8sApi.menuItemFor(Freight, { MenuItem: ApproveFreightMenuItem }),
    Renderer.K8sApi.menuItemFor(Promotion, { MenuItem: AbortPromotionMenuItem }),
  ].map((registration) => withMenuItemErrorBoundary(this, registration));

  // Every kind has a page of its own, so the Custom Resources tree of the cluster sidebar does not list it again.
  customResources = [Project, Stage, Freight, Warehouse, Promotion, PromotionPolicy, AnalysisTemplate];
}
