import { Renderer } from "@freelensapp/extensions";
import styles from "./pie-chart.module.scss";
import stylesInline from "./pie-chart.module.scss?inline";

import type React from "react";

import type { Promotion } from "../k8s/kargo/promotion-v1alpha1";
import type { Stage } from "../k8s/kargo/stage-v1alpha1";

const getStageHealthStats = (objects: Stage[]) => {
  const healthy = objects.filter((o) => o.status?.health?.status === "Healthy").length;
  const unhealthy = objects.filter((o) => o.status?.health?.status === "Unhealthy").length;
  const progressing = objects.filter((o) => o.status?.health?.status === "Progressing").length;
  const unknown = objects.length - healthy - unhealthy - progressing;
  return { healthy, unhealthy, progressing, unknown };
};

const getPromotionStats = (objects: Promotion[]) => {
  const succeeded = objects.filter((o) => o.status?.phase === "Succeeded").length;
  const failed = objects.filter((o) => o.status?.phase === "Failed" || o.status?.phase === "Errored").length;
  const aborted = objects.filter((o) => o.status?.phase === "Aborted").length;
  const running = objects.filter((o) => o.status?.phase === "Running").length;
  const pending = objects.filter((o) => o.status?.phase === "Pending").length;
  return { succeeded, failed, aborted, running, pending };
};

export interface StageHealthPieChartProps {
  objects: Stage[];
  title: string;
}

export function StageHealthPieChart(props: StageHealthPieChartProps): React.ReactElement {
  const { objects, title } = props;
  const { healthy, unhealthy, progressing, unknown } = getStageHealthStats(objects);

  const chartData = {
    datasets: [
      {
        data: [healthy, unhealthy, progressing, unknown],
        backgroundColor: ["#43a047", "#ce3933", "#FF6600", "#3a3a3c"],
        tooltipLabels: [
          (percent: string) => `Healthy: ${percent}`,
          (percent: string) => `Unhealthy: ${percent}`,
          (percent: string) => `Progressing: ${percent}`,
          (percent: string) => `Unknown: ${percent}`,
        ],
      },
    ],
    labels: [
      `Healthy: ${healthy}`,
      `Unhealthy: ${unhealthy}`,
      `Progressing: ${progressing}`,
      `Unknown: ${unknown}`,
    ],
  } as unknown as Renderer.Component.PieChartData;

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.title}>
        <span>{title} ({objects.length})</span>
      </div>
      <Renderer.Component.PieChart data={chartData} />
    </>
  );
}

export interface PromotionResultsPieChartProps {
  objects: Promotion[];
  title: string;
}

export function PromotionResultsPieChart(props: PromotionResultsPieChartProps): React.ReactElement {
  const { objects, title } = props;
  const { succeeded, failed, aborted, running, pending } = getPromotionStats(objects);

  const chartData = {
    datasets: [
      {
        data: [succeeded, failed, aborted, running, pending],
        backgroundColor: ["#43a047", "#ce3933", "#9c27b0", "#FF6600", "#3d90ce"],
        tooltipLabels: [
          (percent: string) => `Succeeded: ${percent}`,
          (percent: string) => `Failed/Errored: ${percent}`,
          (percent: string) => `Aborted: ${percent}`,
          (percent: string) => `Running: ${percent}`,
          (percent: string) => `Pending: ${percent}`,
        ],
      },
    ],
    labels: [
      `Succeeded: ${succeeded}`,
      `Failed/Errored: ${failed}`,
      `Aborted: ${aborted}`,
      `Running: ${running}`,
      `Pending: ${pending}`,
    ],
  } as unknown as Renderer.Component.PieChartData;

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.title}>
        <span>{title} ({objects.length})</span>
      </div>
      <Renderer.Component.PieChart data={chartData} />
    </>
  );
}
