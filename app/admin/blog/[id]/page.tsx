"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    keywords: "",
    is_published: true
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setFormData({
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            image_url: data.image_url,
            keywords: Array.isArray(data.keywords) ? data.keywords.join(', ') : "",
            is_published: data.is_published
          });
        }
      } catch (err: any) {
        console.error(err);
        alert("Erreur lors du chargement de l'article");
      } finally {
        setFetching(false);
      }
    };
    
    fetchPost();
  }, [params.id]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      // only auto-update slug if they're editing the title and want to change it
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const keywordsArray = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          image_url: formData.image_url,
          keywords: keywordsArray,
          is_published: formData.is_published
        })
        .eq('id', params.id);

      if (error) {
        if (error.code === '23505') {
          throw new Error("Un article avec ce lien (slug) existe déjà.");
        }
        throw error;
      }

      router.push('/admin/blog');
      router.refresh();
    } catch (error: any) {
      console.error("Error updating post:", error);
      alert(error.message || "Erreur lors de la mise à jour de l'article");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/blog"
          className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Modifier l'Article</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111827] border border-white/10 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Titre de l'article *</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Lien URL (Slug) *</label>
            <input 
              type="text" 
              required
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-400 focus:outline-none focus:border-red-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Image de couverture (URL) *</label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ImageIcon className="h-5 w-5 text-gray-500" />
              </div>
              <input 
                type="url" 
                required
                value={formData.image_url}
                onChange={e => setFormData({...formData, image_url: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Résumé (Excerpt) *</label>
          <textarea 
            required
            rows={2}
            value={formData.excerpt}
            onChange={e => setFormData({...formData, excerpt: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex justify-between">
            <span>Contenu de l'article *</span>
            <span className="text-xs text-gray-500">HTML autorisé (&lt;br/&gt;, &lt;b&gt;)</span>
          </label>
          <textarea 
            required
            rows={12}
            value={formData.content}
            onChange={e => setFormData({...formData, content: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-all font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Mots-clés SEO (séparés par des virgules)</label>
          <input 
            type="text" 
            value={formData.keywords}
            onChange={e => setFormData({...formData, keywords: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={formData.is_published}
              onChange={e => setFormData({...formData, is_published: e.target.checked})}
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-300">
              {formData.is_published ? "Publier immédiatement" : "Sauvegarder comme brouillon"}
            </span>
          </label>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Mettre à jour l'article</span>
          </button>
        </div>
      </form>
    </div>
  );
}
