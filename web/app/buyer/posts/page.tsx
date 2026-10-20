// ============================================================
// 买家评价 - 点赞评论互动
// ============================================================

"use client";

import Link from "next/link";
import { useState } from "react";

type Post = {
  id: number;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  date: string;
  liked: boolean;
  commentList: { id: number; user: string; text: string }[];
};

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: "小明同学",
    avatar: "🧑‍🎓",
    content: "这个笔记库真的很棒！帮我找到了很多学习资料，推荐给大家～",
    likes: 42,
    comments: 8,
    shares: 5,
    date: "2小时前",
    liked: false,
    commentList: [
      { id: 1, user: "小红", text: "确实很好用！" },
      { id: 2, user: "小刚", text: "赞同，内容很丰富" },
    ],
  },
  {
    id: 2,
    author: "学霸小李",
    avatar: "👩‍🎓",
    content: "知识图谱功能太实用了，帮我理清了很多知识点之间的关系，学习效率提升了不少！",
    likes: 89,
    comments: 15,
    shares: 12,
    date: "5小时前",
    liked: false,
    commentList: [
      { id: 1, user: "学渣小王", text: "能详细说说怎么用吗？" },
    ],
  },
  {
    id: 3,
    author: "数学达人",
    avatar: "🎓",
    content: "AI 客服响应很快，有问题随时都能解答，体验非常好！",
    likes: 67,
    comments: 10,
    shares: 8,
    date: "昨天",
    liked: false,
    commentList: [],
  },
  {
    id: 4,
    author: "英语爱好者",
    avatar: "📚",
    content: "买的英语语法笔记，内容很详细，价格也很实惠，性价比超高！",
    likes: 134,
    comments: 23,
    shares: 18,
    date: "2天前",
    liked: false,
    commentList: [
      { id: 1, user: "考研党", text: "对考研有帮助吗？" },
      { id: 2, user: "英语爱好者", text: "有的，基础语法讲得很清楚" },
    ],
  },
];

export default function BuyerPosts() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});

  // 点赞
  const toggleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    }));
  };

  // 添加评论
  const addComment = (postId: number) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1,
          commentList: [...post.commentList, { id: Date.now(), user: "我", text }],
        };
      }
      return post;
    }));

    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  // 分享
  const sharePost = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 };
      }
      return post;
    }));
    alert("已分享到剪贴板！");
  };

  // 切换评论显示
  const toggleComments = (postId: number) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部导航 */}
        <header className="glass-effect border-b border-white/40 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/buyer" className="text-gray-600 hover:text-gray-900 text-lg">←</Link>
              <span className="text-2xl">📝</span>
              <h1 className="text-lg font-bold warm-gradient-text">评价</h1>
            </div>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">买家视角</span>
          </div>
        </header>

        <main className="flex-1 py-6 px-4">
          <div className="max-w-4xl mx-auto space-y-5">
            {posts.map((post) => (
              <div key={post.id} className="friendly-card rounded-2xl p-5">
                {/* 头部 */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-2xl">
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{post.author}</div>
                    <div className="text-xs text-gray-500">{post.date}</div>
                  </div>
                </div>

                {/* 内容 */}
                <div className="text-gray-700 mb-4 leading-relaxed">{post.content}</div>

                {/* 互动按钮 */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      post.liked
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-lg">{post.liked ? "❤️" : "🤍"}</span>
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-lg">💬</span>
                    <span className="text-sm font-medium">{post.comments}</span>
                  </button>

                  <button
                    onClick={() => sharePost(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-lg">🔗</span>
                    <span className="text-sm font-medium">{post.shares}</span>
                  </button>
                </div>

                {/* 评论区 */}
                {showComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {/* 已有评论 */}
                    <div className="space-y-3 mb-3">
                      {post.commentList.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center text-xs text-white font-semibold">
                            {comment.user[0]}
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                            <div className="text-xs font-semibold text-gray-700 mb-0.5">{comment.user}</div>
                            <div className="text-sm text-gray-600">{comment.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 输入评论 */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && addComment(post.id)}
                        placeholder="写评论..."
                        className="flex-1 bg-white/70 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
                      />
                      <button
                        onClick={() => addComment(post.id)}
                        className="btn-warm rounded-lg px-4 py-2 text-sm font-medium"
                      >
                        发送
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
