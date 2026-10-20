"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import WorkbenchLayout from "@/components/WorkbenchLayout";
import { KNOWLEDGE_BASE } from "@/lib/knowledgeBase";

// ============================================================
// 知识图谱页面
// 从知识库笔记中提取知识点，生成可视化网络
// 节点=知识点，边=关联关系，颜色按学科区分
// ============================================================

// 学科 → 知识点提取（手动定义关联，MVP 阶段；以后可从笔记内容自动提取）
const KNOWLEDGE_POINTS: {
  id: string;
  label: string;
  subject: string;
  connections: string[];
}[] = [
  // 数学
  { id: "m1", label: "导数", subject: "数学", connections: ["m2", "m3", "m4"] },
  { id: "m2", label: "微分", subject: "数学", connections: ["m1", "m5"] },
  { id: "m3", label: "极限", subject: "数学", connections: ["m1", "m2"] },
  { id: "m4", label: "积分", subject: "数学", connections: ["m1", "m5"] },
  { id: "m5", label: "微积分", subject: "数学", connections: ["m2", "m4"] },
  { id: "m6", label: "切线方程", subject: "数学", connections: ["m1"] },
  { id: "m7", label: "单调性", subject: "数学", connections: ["m1", "m3"] },
  // 英语
  { id: "e1", label: "定语从句", subject: "英语", connections: ["e2", "e3"] },
  { id: "e2", label: "关系代词", subject: "英语", connections: ["e1", "e4"] },
  { id: "e3", label: "关系副词", subject: "英语", connections: ["e1"] },
  { id: "e4", label: "非限制性从句", subject: "英语", connections: ["e2"] },
  { id: "e5", label: "词汇记忆", subject: "英语", connections: ["e6"] },
  { id: "e6", label: "语境记忆法", subject: "英语", connections: ["e5"] },
  // 物理
  { id: "p1", label: "电磁学", subject: "物理", connections: ["p2", "p3", "p4"] },
  { id: "p2", label: "静电场", subject: "物理", connections: ["p1", "p5"] },
  { id: "p3", label: "恒定电流", subject: "物理", connections: ["p1", "p5"] },
  { id: "p4", label: "电磁感应", subject: "物理", connections: ["p1", "p6"] },
  { id: "p5", label: "库仑定律", subject: "物理", connections: ["p2"] },
  { id: "p6", label: "楞次定律", subject: "物理", connections: ["p4"] },
];

// 学科颜色
const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  数学: { bg: "#7c3aed", border: "#6d28d9", text: "#fff" },
  英语: { bg: "#059669", border: "#047857", text: "#fff" },
  物理: { bg: "#2563eb", border: "#1d4ed8", text: "#fff" },
};

// 从知识点生成 ReactFlow 节点
function buildNodes(filterSubject: string | null): Node[] {
  const filtered = filterSubject
    ? KNOWLEDGE_POINTS.filter((p) => p.subject === filterSubject)
    : KNOWLEDGE_POINTS;

  const subjects = [...new Set(filtered.map((p) => p.subject))];
  const cols = 4;
  const spacingX = 200;
  const spacingY = 130;

  return filtered.map((point, index) => {
    const subjectIndex = subjects.indexOf(point.subject);
    const row = Math.floor(index / cols);
    const col = index % cols;
    const colors = SUBJECT_COLORS[point.subject] || {
      bg: "#6b7280",
      border: "#4b5563",
      text: "#fff",
    };

    return {
      id: point.id,
      data: { label: point.label },
      position: {
        x: col * spacingX + subjectIndex * 80,
        y: row * spacingY + subjectIndex * 40,
      },
      style: {
        background: colors.bg,
        color: colors.text,
        padding: "10px 18px",
        borderRadius: "12px",
        fontWeight: 600,
        fontSize: "13px",
        border: `2px solid ${colors.border}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        cursor: "grab",
      },
    };
  });
}

// 从知识点连接关系生成边
function buildEdges(filterSubject: string | null): Edge[] {
  const filtered = filterSubject
    ? KNOWLEDGE_POINTS.filter((p) => p.subject === filterSubject)
    : KNOWLEDGE_POINTS;

  const edges: Edge[] = [];
  const seen = new Set<string>();

  filtered.forEach((point) => {
    point.connections.forEach((targetId) => {
      const key = [point.id, targetId].sort().join("-");
      if (!seen.has(key)) {
        seen.add(key);
        edges.push({
          id: `e-${point.id}-${targetId}`,
          source: point.id,
          target: targetId,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#d1d5db", strokeWidth: 1.5 },
        });
      }
    });
  });

  return edges;
}

export default function GraphPage() {
  const [filterSubject, setFilterSubject] = useState<string | null>(null);

  const initialNodes = useMemo(() => buildNodes(filterSubject), [filterSubject]);
  const initialEdges = useMemo(() => buildEdges(filterSubject), [filterSubject]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => [
        ...eds,
        { ...params, type: "smoothstep", animated: true, style: { stroke: "#a78bfa", strokeWidth: 2 } } as Edge,
      ]),
    [setEdges]
  );

  const subjects = [...new Set(KNOWLEDGE_POINTS.map((p) => p.subject))];

  return (
    <WorkbenchLayout>
      <div className="flex h-full flex-col">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold">🧠 知识图谱</h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              从笔记中提取知识点，生成可视化知识网络 · 共 {KNOWLEDGE_POINTS.length} 个知识点
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">筛选：</span>
            <button
              onClick={() => setFilterSubject(null)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                !filterSubject
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              全部
            </button>
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSubject(s)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filterSubject === s
                    ? "text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
                style={
                  filterSubject === s
                    ? { backgroundColor: SUBJECT_COLORS[s]?.bg }
                    : {}
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 图谱区域 */}
        <div className="flex-1 bg-neutral-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#f3f4f6" gap={16} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const kp = KNOWLEDGE_POINTS.find((p) => p.id === node.id);
                return SUBJECT_COLORS[kp?.subject || ""]?.bg || "#6b7280";
              }}
              maskColor="rgba(0,0,0,0.05)"
            />
          </ReactFlow>
        </div>

        {/* 底部图例 + 关联笔记 */}
        <div className="flex items-center gap-6 border-t border-neutral-200 bg-white px-6 py-3">
          <span className="text-sm text-neutral-500">图例：</span>
          {subjects.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: SUBJECT_COLORS[s]?.bg }}
              />
              <span className="text-sm text-neutral-600">{s}</span>
              <span className="text-xs text-neutral-400">
                ({KNOWLEDGE_POINTS.filter((p) => p.subject === s).length}个)
              </span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <div className="h-0.5 w-8 bg-neutral-300" />
            <span className="text-sm text-neutral-400">知识点关联</span>
          </div>
        </div>
      </div>
    </WorkbenchLayout>
  );
}
