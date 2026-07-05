"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Erreur lors de la mise à jour");
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet article ? Cette action est irréversible.")) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestion du Blog</h1>
        <Link 
          href="/admin/blog/new" 
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Article</span>
        </Link>
      </div>

      <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium text-white">Article</th>
                <th className="px-6 py-4 font-medium text-white">Date</th>
                <th className="px-6 py-4 font-medium text-white">Statut</th>
                <th className="px-6 py-4 font-medium text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Aucun article trouvé. Commencez par en créer un !
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                          {post.image_url && (
                            <Image src={post.image_url} alt={post.title} fill className="object-cover" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white mb-1">{post.title}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[300px]">{post.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(post.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => togglePublish(post.id, post.is_published)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          post.is_published 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}
                      >
                        {post.is_published ? (
                          <><Eye className="w-3 h-3" /> Publié</>
                        ) : (
                          <><EyeOff className="w-3 h-3" /> Brouillon</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/blog/${post.id}`}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => deletePost(post.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
