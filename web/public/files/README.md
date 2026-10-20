# 笔记 PDF 存放目录

把真实的笔记 PDF 放到这个目录下，聊天里发送的预览版/完整版链接才能打开。

文件命名与 `lib/knowledgeBase.ts` 中的假数据对应：

| 文件 | 用途 |
|---|---|
| `sx-gao2-daoshu-preview.pdf` | 高二数学导数笔记 · 预览版（可发给买家） |
| `sx-gao2-daoshu-full.pdf` | 高二数学导数笔记 · 完整版（只能卖家发） |
| `yy-gao1-bixiu1-preview.pdf` | 高一英语词汇手册 · 预览版 |
| `yy-gao1-bixiu1-full.pdf` | 高一英语词汇手册 · 完整版 |
| `wl-gao3-dcixue-preview.pdf` | 高三物理电磁学 · 预览版 |
| `wl-gao3-dcixue-full.pdf` | 高三物理电磁学 · 完整版 |

> MVP 阶段没有真实 PDF 也能跑通：点击卡片会 404，但不影响聊天流程。
> 想快速验证效果，随便放一个测试 PDF 进去并改成上面的名字即可。
