import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Important: we'll use standard supabase client or admin client.

export const metadata: Metadata = {
  title: 'Blog & Actualités | Golden Parc Station GPS',
  description: 'Découvrez les dernières actualités, conseils de voyage, et informations sur notre escale premium à Outat El Haj, près de Missour et Tandit.',
};

// Next.js config for dynamic page cache
export const revalidate = 60; // Revalidate every minute

export default async function BlogPage() {
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const blogPosts = posts || [];

  return (
    <div className="min-h-screen bg-[#070A13] pt-24 pb-32 px-4 relative z-0">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Blog & <span className="text-red-500">Actualités</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Conseils pour les voyageurs sur la RN15, actualités de la station, et guides pour profiter de la région d'Outat El Haj, Missour et Tandit.
          </p>
        </div>

        {blogPosts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            Aucun article n'a été publié pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {blogPosts.map((post: any) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden group hover:border-red-500/50 transition-all duration-500 hover:-translate-y-2 shadow-xl cursor-pointer flex flex-col h-full">
                  {/* Image Container */}
                  <div className="relative w-full h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                    {post.image_url && (
                      <Image 
                        src={post.image_url} 
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full z-20 flex items-center gap-2 border border-white/10">
                      <Calendar className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-white font-medium">
                        {new Date(post.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.isArray(post.keywords) && post.keywords.slice(0, 2).map((kw: string, i: number) => (
                        <span key={i} className="text-[10px] font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-2 py-1 rounded-md">
                          {kw}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-red-500 font-bold text-sm gap-2 mt-auto group-hover:gap-3 transition-all">
                      Lire la suite <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
