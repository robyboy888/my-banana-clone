import type { Metadata } from "next";
import VisualOSClient from "./VisualOSClient";

export const metadata: Metadata = {
  title: "视觉内容生成操作系统 V1.0 | Banana Clone",
  description: "爆款视觉模板库、标题系统和文案引擎的一体化工作台。",
};

export default function VisualOSPage() {
  return <VisualOSClient />;
}
