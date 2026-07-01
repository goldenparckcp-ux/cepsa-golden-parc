import os
import re

hero_carousel_template = """
            {/* HERO CAROUSEL */}
            {heroSlides.length > 0 && (
                <div className="px-4 max-w-7xl mx-auto mt-2 relative group mb-6">
                    <div 
                        id="hero-carousel-container"
                        onScroll={(e) => {
                            const target = e.currentTarget as any;
                            if (target._isScrolling) return;
                            target._isScrolling = true;
                            setTimeout(() => {
                                target._isScrolling = false;
                                const index = Math.round(target.scrollLeft / target.clientWidth);
                                const dots = document.querySelectorAll('.hero-dot');
                                dots.forEach((dot, idx) => {
                                    if (idx === index) {
                                        dot.classList.add('bg-orange-500', 'w-6');
                                        dot.classList.remove('bg-white/30', 'w-2');
                                    } else {
                                        dot.classList.remove('bg-orange-500', 'w-6');
                                        dot.classList.add('bg-white/30', 'w-2');
                                    }
                                });
                            }, 100);
                        }}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-4 scrollbar-hide w-full rounded-[2rem] scroll-smooth"
                    >
                        {heroSlides.map((slide, sIdx) => {
                            return (
                                <div 
                                    key={slide.id || sIdx}
                                    className="relative w-full h-[180px] sm:h-[240px] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl flex items-center justify-between px-5 md:px-8 shrink-0 snap-center select-none"
                                    style={{ minWidth: '100%' }}
                                >
                                    {/* Background Image */}
                                    {slide.image_url && (
                                        <Image 
                                            src={slide.image_url} 
                                            alt={slide.title || "Slide"}
                                            fill
                                            className="object-cover group-hover:scale-[1.01] transition-transform duration-700 font-bold pointer-events-none"
                                        />
                                    )}
                                    {/* Dark/Gradient Overlay */}
                                    <div className="absolute inset-0 bg-black/55" />
                                    
                                    {/* Content Overlay */}
                                    <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                        <div className="flex flex-col gap-0.5 flex-1 min-w-0 text-left">
                                            {slide.badge_text && (
                                                <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1 shadow-lg w-fit">
                                                    {slide.badge_text}
                                                </span>
                                            )}
                                            <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight drop-shadow-md truncate">
                                                {slide.title}
                                            </h2>
                                            {slide.subtitle && (
                                                <p className="text-white/70 text-[9px] sm:text-xs font-semibold line-clamp-1 sm:line-clamp-2 drop-shadow leading-normal max-w-md">
                                                    {slide.subtitle}
                                                </p>
                                            )}
                                        </div>
                                        
                                        {/* CTA */}
                                        {slide.cta_text && (
                                            <div className="flex items-center gap-2 shrink-0 justify-start sm:justify-end mt-1 sm:mt-0">
                                                <button 
                                                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-orange-500/30 active:scale-95 whitespace-nowrap group-hover:scale-105 pointer-events-none"
                                                >
                                                    <span className="inline">{slide.cta_text}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Pagination Dots Indicator */}
                    {heroSlides.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                            {heroSlides.map((_, idx) => (
                                <span 
                                    key={idx} 
                                    className={`hero-dot h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-orange-500 w-6' : 'bg-white/30 w-2'}`} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}"""

def fix_restaurant():
    path = 'app/restaurant/RestaurantClient.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()

    # Remove the old Featured Special Carousel completely
    pattern = r'\{\/\* Featured Special Carousel \*\/\}.*?\}\)\(\)\}'
    c = re.sub(pattern, '', c, flags=re.DOTALL)

    # Insert the new HERO CAROUSEL just before {/* Categories & Search */}
    # First, let's remove any existing HERO CAROUSEL if I accidentally added it before
    c = re.sub(r'\{\/\* HERO CAROUSEL \*\/\}.*?\}\)', '', c, flags=re.DOTALL)
    
    if "Categories & Search" in c:
        c = c.replace('{/* Categories & Search */}', hero_carousel_template + '\n            {/* Categories & Search */}')
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Fixed Restaurant")

def fix_pool():
    path = 'app/services/pool/page.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()

    # Replace the old HERO CAROUSEL
    # Pool currently has:
    # {/* HERO CAROUSEL */}
    # {heroSlides.length > 0 ? (
    # ...
    # ) : null}
    pattern = r'\{\/\* HERO CAROUSEL \*\/\}.*?(?=\{\/\* Header / Back Button \*\/\})'
    
    if re.search(pattern, c, re.DOTALL):
        c = re.sub(pattern, hero_carousel_template + '\n\n            ', c, flags=re.DOTALL)
    else:
        # Fallback
        c = c.replace('{/* Header / Back Button */}', hero_carousel_template + '\n            {/* Header / Back Button */}')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Fixed Pool")

def fix_lubrifiants():
    path = 'app/services/lubrifiants/page.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()

    pattern = r'\{\/\* HERO CAROUSEL \*\/\}.*?(?=\{\/\* Header / Back Button \*\/\})'
    if re.search(pattern, c, re.DOTALL):
        c = re.sub(pattern, hero_carousel_template + '\n\n            ', c, flags=re.DOTALL)
    else:
        c = c.replace('{/* Header / Back Button */}', hero_carousel_template + '\n            {/* Header / Back Button */}')
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Fixed Lubrifiants")

fix_restaurant()
fix_pool()
fix_lubrifiants()
