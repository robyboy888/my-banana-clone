import type { Metadata } from "next";
import VisualOSClient from "./VisualOSClient";

export const metadata: Metadata = {
  title: "视觉内容生成操作系统 V1.0 | Banana Clone",
  description: "视觉隐喻模型库、提示词模板、模型参数组和可售卖视觉模板的一体化工作台。",
};

export default function VisualOSPage() {
  return <VisualOSClient />;
}
