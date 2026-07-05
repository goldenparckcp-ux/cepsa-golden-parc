import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ChevronLeft, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  params: { slug: string };
};

export const revalidate = 60; // Revalidate every minute

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!post) return { title: 'Article introuvable | Golden Parc Station' };

  return {
    title: `${post.title} | Golden Parc Station`,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image_url],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#070A13] pt-24 pb-32 relative z-0">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <article className="max-w-4xl mx-auto px-4">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 font-medium">
          <ChevronLeft className="w-4 h-4" /> Retour aux articles
        </Link>

        {/* Header */}
        <header className="space-y-6 mb-12">
          <div className="flex flex-wrap gap-2">
            {Array.isArray(post.keywords) && post.keywords.map((kw: string, i: number) => (
              <span key={i} className="text-xs font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                {kw}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-6 text-gray-400 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              {new Date(post.created_at).toLocaleDateString('fr-FR')}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              Outat El Haj, RN15
            </div>
          </div>
        </header>

        {/* Hero Image */}
        {post.image_url && (
          <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl border border-white/10">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content (Plain Text) */}
        <div 
          className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:text-white prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-4 prose-h3:text-2xl prose-h3:text-red-100 prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-red-400 prose-a:no-underline hover:prose-a:underline prose-li:text-gray-300 prose-strong:text-white whitespace-pre-wrap text-[1.1rem] leading-8 font-sans"
        >
          {post.content}
        </div>

        {/* Call to action */}
        {(!post.cta_type || post.cta_type !== 'none') && (
          <div className="mt-16 bg-[#111827] border border-white/5 p-8 rounded-3xl text-center space-y-4">
            <h3 className="text-2xl font-bold text-white">
              {post.cta_type === 'hotel' && "Besoin d'une bonne nuit de sommeil ?"}
              {(!post.cta_type || post.cta_type === 'restaurant') && "Prêt pour un repas inoubliable ?"}
              {post.cta_type === 'pool' && "Envie de vous rafraîchir ?"}
            </h3>
            <p className="text-gray-400">Passez nous voir au Golden Parc Station sur la RN15.</p>
            <div className="flex justify-center gap-4 pt-4">
              {post.cta_type === 'hotel' && (
                <Link href="/hotel" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold transition-all">
                  Réserver une chambre
                </Link>
              )}
              {(!post.cta_type || post.cta_type === 'restaurant') && (
                <Link href="/restaurant" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold transition-all">
                  Voir le Menu
                </Link>
              )}
              {post.cta_type === 'pool' && (
                <Link href="/services/pool" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold transition-all">
                  Découvrir la Piscine
                </Link>
              )}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
