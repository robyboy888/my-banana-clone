'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Save, ArrowLeft, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';

export default function EditPromptPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    original_image_url: '',
    optimized_image_url: '',
    author_name: '',
    author_avatar: ''
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setFormData(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('prompts')
      .update(formData)
      .eq('id', id);

    if (!error) {
      router.push('/admin');
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> 返回列表
        </button>
        <h1 className="text-2xl font-black dark:text-white tracking-tight">编辑提示词记录</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：表单编辑 */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">标题</label>
            <input 
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="输入内容标题..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">优化后的提示词 (Optimized Prompt)</label>
            <textarea 
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white h-32 resize-none transition-all"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> 原始图片 URL
              </label>
              <input 
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-xs transition-all font-mono"
                value={formData.original_image_url}
                onChange={e => setFormData({...formData, original_image_url: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 text-indigo-500">
                <Sparkles className="w-3 h-3" /> 优化后图片 URL
              </label>
              <input 
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-xs transition-all font-mono"
                value={formData.optimized_image_url}
                onChange={e => setFormData({...formData, optimized_image_url: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-sm tracking-widest shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? '正在保存...' : '确认更新记录'}
          </button>
        </form>

        {/* 右侧：实时对比预览 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">实时对比预览 (Live Preview)</label>
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md font-bold">BEFORE / AFTER</span>
          </div>
          
          <div className="sticky top-28 rounded-[32px] overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl aspect-[4/3] bg-slate-200 dark:bg-slate-800 group">
            {formData.original_image_url && formData.optimized_image_url ? (
              <ReactCompareSlider
                itemOne={<ReactCompareSliderImage src={formData.original_image_url} alt="Original" className="object-cover h-full" />}
                itemTwo={<ReactCompareSliderImage src={formData.optimized_image_url} alt="Optimized" className="object-cover h-full" />}
                className="h-full w-full"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <ImageIcon className="w-12 h-12 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-tighter opacity-50">等待输入图片地址...</p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-center text-slate-400 italic font-medium">拖动中间的滑块实时查看图片差异</p>
        </div>
      </div>
    </div>
  );
}