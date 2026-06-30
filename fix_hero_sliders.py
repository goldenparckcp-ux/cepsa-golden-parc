import re
import os

lube_path = 'app/services/lubrifiants/page.tsx'
with open(lube_path, 'r', encoding='utf-8') as f:
    c = f.read()

# Update Lubrifiants hero section layout (when sliders exist)
c = c.replace(
    'className="p-3 md:p-6 max-w-7xl mx-auto mb-2 relative z-10"',
    'className="px-0 md:px-6 pt-0 md:pt-6 pb-2 md:pb-6 max-w-7xl mx-auto mb-2 relative z-10"'
)
c = c.replace(
    'className="relative w-full h-[300px] sm:h-[400px] rounded-[2.5rem] overflow-hidden border border-white/10',
    'className="relative w-full h-[300px] sm:h-[400px] rounded-b-[2rem] md:rounded-[2.5rem] overflow-hidden border-b md:border border-white/10'
)

# Update Lubrifiants hero section layout (fallback)
c = c.replace(
    'className="relative h-[300px] md:h-[400px] w-full overflow-hidden border-b border-white/5 group"',
    'className="relative h-[300px] md:h-[400px] w-full max-w-7xl mx-auto rounded-b-[2rem] md:rounded-[2.5rem] md:mt-6 overflow-hidden border-b md:border border-white/5 group z-10"'
)

with open(lube_path, 'w', encoding='utf-8') as f:
    f.write(c)


# Now for the RestaurantClient.tsx
resto_path = 'app/restaurant/RestaurantClient.tsx'
with open(resto_path, 'r', encoding='utf-8') as f:
    c = f.read()

# I need to insert the HERO CAROUSEL right above the Special Offers / Categories.
# Let's find where to insert it.
# It should be after "className="relative min-h-screen pt-24 md:pt-28 pb-32"
# which is the main wrapper, or just below the header.
# Actually, wait, let's insert it right before: "{/* Categories & Search */}" or "{/* Auto-scroll logic for Special Offers"

hero_jsx = """
            {/* HERO CAROUSEL */}
            {heroSlides.length > 0 && (
                <div className="px-0 md:px-6 pt-0 md:pt-6 pb-2 md:pb-6 max-w-7xl mx-auto mb-2 relative z-10">
                    <div className="relative w-full h-[300px] sm:h-[400px] rounded-b-[2rem] md:rounded-[2.5rem] overflow-hidden border-b md:border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
                        <div 
                            onScroll={(e) => {
                                const target = e.target as HTMLElement;
                                const index = Math.round(target.scrollLeft / target.clientWidth);
                                const dots = document.querySelectorAll('.resto-hero-dot');
                                dots.forEach((dot, idx) => {
                                    if (idx === index) {
                                        dot.classList.add('bg-orange-500', 'w-6');
                                        dot.classList.remove('bg-white/30', 'w-2');
                                    } else {
                                        dot.classList.remove('bg-orange-500', 'w-6');
                                        dot.classList.add('bg-white/30', 'w-2');
                                    }
                                });
                            }}
                            className="flex overflow-x-auto snap-x snap-mandatory gap-0 scrollbar-hide w-full h-full scroll-smooth"
                        >
                            {heroSlides.map((slide, idx) => (
                                <div key={slide.id || idx} className="relative w-full h-full shrink-0 snap-center flex flex-col justify-end p-6 md:p-12 select-none" style={{ minWidth: '100%' }}>
                                    {slide.image_url && <Image src={slide.image_url} alt={slide.title} fill priority={idx === 0} className="object-cover absolute inset-0 -z-10 brightness-[0.5] saturate-150 transition-transform duration-[20s] ease-linear hover:scale-110 pointer-events-none" />}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent -z-10" />
                                    
                                    {slide.badge_text && (
                                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full w-fit mb-4 flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                                            {slide.badge_text}
                                        </div>
                                    )}
                                    <h2 className="text-4xl md:text-6xl font-black mb-3 uppercase tracking-tighter leading-none drop-shadow-2xl text-white">
                                        {slide.title}
                                    </h2>
                                    <p className="text-gray-400 max-w-xl font-medium leading-relaxed text-sm md:text-base">
                                        {slide.subtitle}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {heroSlides.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                                {heroSlides.map((_, idx) => (
                                    <span key={idx} className={`resto-hero-dot h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-orange-500 w-6' : 'bg-white/30 w-2'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
"""

if "HERO CAROUSEL" not in c:
    c = c.replace('{/* Categories & Search */}', hero_jsx + '\n            {/* Categories & Search */}')

with open(resto_path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Hero sliders fixed.')
