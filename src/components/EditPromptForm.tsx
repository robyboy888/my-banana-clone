// src/components/EditPromptForm.tsx 部分核心修改
// ... 保留之前的 imports 和 interface ...

export default function EditPromptForm({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        content: initialData.content || '',
        optimized_prompt: initialData.optimized_prompt || '',
        source_x_account: initialData.source_x_account || '', // 新增字段
        admin_notes: initialData.admin_notes || '',           // 新增字段
    });

    // ... 保留 previews, files 状态和 handleFileChange, handleSubmit 逻辑 ...
    // 注意：handleSubmit 里的 dataToSubmit 会自动包含 formData 里的这两个新字段

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            {/* 基础信息 Section */}
            <section>
                <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <h2 className="text-2xl font-black text-slate-800">基础信息</h2>
                    
                    {/* X 账号跳转链接 */}
                    {formData.source_x_account && (
                        <a 
                            href={`https://x.com/${formData.source_x_account.replace('@', '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 px-4 py-1.5 bg-sky-500 text-white rounded-full text-xs font-bold hover:bg-sky-600 transition shadow-sm"
                        >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            <span>访问 X 个人主页</span>
                        </a>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* 标题 */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-2">内容标题</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                        />
                    </div>

                    {/* X 账号输入框 */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-gray-700 mb-2">来源 X 账号 (Handle)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                            <input
                                type="text"
                                placeholder="elonmusk"
                                value={formData.source_x_account}
                                onChange={(e) => setFormData({ ...formData, source_x_account: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">原始提示词 (Content)</label>
                    <textarea
                        rows={5}
                        required
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                    />
                </div>
            </section>

            {/* 优化信息 Section ... 保持不变 */}

            {/* 管理员备注 Section (新增) */}
            <section className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                <div className="flex items-center space-x-2 mb-4">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <h2 className="text-xl font-black text-amber-800 uppercase tracking-wider text-sm">仅管理员可见备注</h2>
                </div>
                <textarea
                    rows={3}
                    placeholder="在此输入只有后台管理员能看到的私密备注..."
                    value={formData.admin_notes}
                    onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                    className="w-full px-4 py-3 bg-white/80 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-50 transition-all outline-none text-amber-900 placeholder:text-amber-300"
                />
            </section>

            {/* 图片资源 Section ... 保持不变 */}
            
            {/* ... 其余按钮和 ImageUploadBox 逻辑 ... */}
        </form>
    );
}