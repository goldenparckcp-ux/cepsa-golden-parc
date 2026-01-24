'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Minus, Coffee, Leaf } from 'lucide-react';
import PriceTag from '@/components/ui/PriceTag';
import type { MenuItem } from '@/lib/menuTypes';

interface ProductConfiguratorProps {
    item: MenuItem;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (item: MenuItem, customizations: any, finalPrice: number) => void;
}

export default function ProductConfigurator({
    item,
    isOpen,
    onClose,
    onAddToCart,
}: ProductConfiguratorProps) {
    // Barista states
    const [sugarLevel, setSugarLevel] = useState(2);
    const [milkEnabled, setMilkEnabled] = useState(false);
    const [milkRatio, setMilkRatio] = useState(50); // 0-100 for milk percentage
    const [teaHerb, setTeaHerb] = useState<'na3na3' | 'chiba' | 'khalouta'>('na3na3');

    // Beldi states
    const [portionIndex, setPortionIndex] = useState(0);

    // Garniture states
    const [sideDish, setSideDish] = useState('Frites');

    // Toppings states
    const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

    // Bread states
    const [selectedBread, setSelectedBread] = useState('');

    // Pasta states
    const [selectedPasta, setSelectedPasta] = useState('');
    const [selectedSauce, setSelectedSauce] = useState('');

    // Generic parameters state (for new parameter system)
    const [genericParams, setGenericParams] = useState<{ [key: string]: any }>({});

    // General states
    const [quantity, setQuantity] = useState(1);

    // Calculate final price based on configurator type
    const calculatePrice = () => {
        let basePrice = item.price;

        if (item.options?.type === 'beldi') {
            const portion = item.options.portions[portionIndex];
            basePrice += portion.priceAdd;
        }

        if (item.options?.type === 'toppings' && item.options.availableToppings) {
            const toppingPrices = selectedToppings.reduce((total, toppingName) => {
                const topping = item.options?.type === 'toppings'
                    ? item.options.availableToppings.find((t: any) => t.name === toppingName)
                    : null;
                return total + (topping?.price || 0);
            }, 0);
            basePrice += toppingPrices;
        }

        return basePrice * quantity;
    };

    const finalPrice = calculatePrice();

    const handleAddToCart = () => {
        const customizations: any = { quantity };

        if (item.options?.type === 'barista') {
            customizations.sugarLevel = sugarLevel;
            if (item.options.milkToggle) {
                customizations.milk = milkEnabled;
            }
            if (item.options.milkRatio) {
                customizations.milkRatio = milkRatio;
            }
            if (item.options.teaHerbs) {
                customizations.teaHerb = teaHerb;
            }
        } else if (item.options?.type === 'beldi') {
            customizations.portion = item.options.portions[portionIndex];
        } else if (item.options?.type === 'garniture') {
            customizations.sideDish = sideDish;
        } else if (item.options?.type === 'toppings') {
            customizations.toppings = selectedToppings;
        } else if (item.options?.type === 'bread') {
            customizations.breadType = selectedBread;
        } else if (item.options?.type === 'pasta') {
            customizations.pastaType = selectedPasta;
            customizations.sauce = selectedSauce;
        }

        onAddToCart(item, customizations, finalPrice);
        onClose();
    };

    // Reset customizations when modal opens
    useEffect(() => {
        if (isOpen) {
            setSugarLevel(2);
            setMilkEnabled(false);
            setTeaHerb('na3na3');
            setPortionIndex(0);
            setSideDish('Frites');
            setQuantity(1);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-surface-dark rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-custom animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-surface-dark border-b border-white/10 p-6 flex items-start justify-between z-10">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-1">{item.name}</h2>
                        <p className="text-sm text-text-secondary">{item.description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-surface-lighter hover:bg-cepsa-red transition-colors flex items-center justify-center ml-4"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Image Placeholder */}
                    <div className="w-full h-48 rounded-xl bg-surface-lighter flex items-center justify-center overflow-hidden">
                        <div className="text-6xl">
                            {item.category === 'drinks' ? '☕' :
                                item.category === 'beldi' ? '🍲' :
                                    item.category === 'grill' ? '🍖' : '🍔'}
                        </div>
                    </div>

                    {/* TYPE A: BARISTA INTERFACE */}
                    {item.options?.type === 'barista' && (
                        <>
                            {/* Sugar Control */}
                            {item.options.sugarControl && (
                                <div className="card bg-surface-lighter">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Coffee className="w-5 h-5 text-premium-gold" />
                                        <h3 className="font-bold text-xl">Skar (Sugar Cubes)</h3>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => setSugarLevel(Math.max(0, sugarLevel - 1))}
                                            disabled={sugarLevel === 0}
                                            className="w-20 h-20 rounded-2xl bg-surface-dark hover:bg-premium-gold hover:text-bg-dark disabled:opacity-30 disabled:hover:bg-surface-dark disabled:hover:text-text-primary transition-all flex items-center justify-center text-2xl font-bold"
                                        >
                                            <Minus className="w-8 h-8" />
                                        </button>

                                        <div className="flex-1 text-center">
                                            <div className="text-6xl font-bold text-premium-gold mb-3">
                                                {sugarLevel}
                                            </div>
                                            <div className="flex gap-2 justify-center">
                                                {[0, 1, 2, 3, 4].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`w-4 h-4 rounded-full transition-all ${level < sugarLevel
                                                            ? 'bg-premium-gold scale-125 shadow-lg shadow-premium-gold/50'
                                                            : 'bg-surface-dark'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSugarLevel(Math.min(4, sugarLevel + 1))}
                                            disabled={sugarLevel === 4}
                                            className="w-20 h-20 rounded-2xl bg-surface-dark hover:bg-premium-gold hover:text-bg-dark disabled:opacity-30 disabled:hover:bg-surface-dark disabled:hover:text-text-primary transition-all flex items-center justify-center text-2xl font-bold"
                                        >
                                            <Plus className="w-8 h-8" />
                                        </button>
                                    </div>

                                    <p className="text-sm text-text-muted text-center mt-4 font-medium">
                                        {sugarLevel === 0 && 'Bla Skar (No sugar)'}
                                        {sugarLevel === 1 && 'Chwiya (Light)'}
                                        {sugarLevel === 2 && '3adi (Normal)'}
                                        {sugarLevel === 3 && 'Mezyan (Sweet)'}
                                        {sugarLevel === 4 && 'Bzaf (Very sweet)'}
                                    </p>
                                </div>
                            )}

                            {/* Milk Toggle */}
                            {item.options.milkToggle && (
                                <div className="card bg-surface-lighter">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-xl mb-1">{item.options.milkToggle.label}</h3>
                                            <p className="text-sm text-text-muted">Add milk for extra creaminess</p>
                                        </div>
                                        <button
                                            onClick={() => setMilkEnabled(!milkEnabled)}
                                            className={`relative w-20 h-10 rounded-full transition-all ${milkEnabled ? 'bg-premium-gold' : 'bg-surface-dark'
                                                }`}
                                        >
                                            <div className={`absolute top-1 left-1 w-8 h-8 rounded-full bg-white transition-transform ${milkEnabled ? 'translate-x-10' : 'translate-x-0'
                                                }`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Tea Herbs Selector */}
                            {item.options.teaHerbs && (
                                <div className="card bg-surface-lighter">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Leaf className="w-5 h-5 text-premium-gold" />
                                        <h3 className="font-bold text-xl">Naw3 (Tea Type)</h3>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setTeaHerb('na3na3')}
                                            className={`p-4 rounded-xl border-2 transition-all ${teaHerb === 'na3na3'
                                                ? 'border-premium-gold bg-premium-gold/10 shadow-lg shadow-premium-gold/30'
                                                : 'border-white/10 bg-surface-dark hover:border-premium-gold/50'
                                                }`}
                                        >
                                            <div className="text-3xl mb-2">🌿</div>
                                            <p className="font-bold text-sm">Na3na3</p>
                                            <p className="text-xs text-text-muted">Mint</p>
                                        </button>

                                        <button
                                            onClick={() => setTeaHerb('chiba')}
                                            className={`p-4 rounded-xl border-2 transition-all ${teaHerb === 'chiba'
                                                ? 'border-premium-gold bg-premium-gold/10 shadow-lg shadow-premium-gold/30'
                                                : 'border-white/10 bg-surface-dark hover:border-premium-gold/50'
                                                }`}
                                        >
                                            <div className="text-3xl mb-2">🍃</div>
                                            <p className="font-bold text-sm">Chiba</p>
                                            <p className="text-xs text-text-muted">Wormwood</p>
                                        </button>

                                        <button
                                            onClick={() => setTeaHerb('khalouta')}
                                            className={`p-4 rounded-xl border-2 transition-all ${teaHerb === 'khalouta'
                                                ? 'border-premium-gold bg-premium-gold/10 shadow-lg shadow-premium-gold/30'
                                                : 'border-white/10 bg-surface-dark hover:border-premium-gold/50'
                                                }`}
                                        >
                                            <div className="text-3xl mb-2">🌾</div>
                                            <p className="font-bold text-sm">Khalouta</p>
                                            <p className="text-xs text-text-muted">Mixed</p>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* TYPE B: BELDI PORTION SELECTOR */}
                    {item.options?.type === 'beldi' && (
                        <div className="card bg-surface-lighter">
                            <h3 className="font-bold text-xl mb-4">7jm (Portion Size)</h3>

                            <div className="space-y-3">
                                {item.options.portions.map((portion, index) => {
                                    const portionPrice = item.price + portion.priceAdd;
                                    const isSelected = portionIndex === index;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setPortionIndex(index)}
                                            className={`w-full p-6 rounded-2xl border-2 transition-all ${isSelected
                                                ? 'border-premium-gold bg-premium-gold/10 shadow-xl shadow-premium-gold/30 scale-105'
                                                : 'border-white/10 bg-surface-dark hover:border-premium-gold/50 hover:scale-102'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="text-left">
                                                    <p className="font-bold text-2xl mb-1">{portion.label}</p>
                                                    <p className="text-sm text-text-muted">
                                                        {portion.multiplier === 0.25 && 'Perfect for one'}
                                                        {portion.multiplier === 0.5 && 'Great for sharing'}
                                                        {portion.multiplier === 1 && 'Family size feast'}
                                                    </p>
                                                </div>
                                                <div className={`font-bold text-3xl ${isSelected ? 'text-premium-gold' : 'text-text-secondary'}`}>
                                                    {portionPrice.toFixed(2)}
                                                    <span className="text-sm ml-1">MAD</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TYPE C: GARNITURE SELECTOR */}
                    {item.options?.type === 'garniture' && (
                        <div className="card bg-surface-lighter">
                            <h3 className="font-bold text-xl mb-4">Garniture (Side Dish)</h3>

                            <div className="space-y-2">
                                {item.options.sideDishes.map((dish) => (
                                    <button
                                        key={dish}
                                        onClick={() => setSideDish(dish)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${sideDish === dish
                                            ? 'border-premium-gold bg-premium-gold/10 shadow-lg shadow-premium-gold/20'
                                            : 'border-white/10 bg-surface-dark hover:border-premium-gold/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-lg">{dish}</span>
                                            {sideDish === dish && (
                                                <div className="w-6 h-6 rounded-full bg-premium-gold flex items-center justify-center">
                                                    <div className="text-bg-dark text-sm">✓</div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TYPE D: MILK RATIO SLIDER (for Cappuccino, Latte, etc.) */}
                    {item.options?.type === 'barista' && item.options.milkRatio && (
                        <div className="card bg-surface-lighter">
                            <h3 className="font-bold text-xl mb-4">Milk Ratio</h3>
                            <div className="space-y-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={milkRatio}
                                    onChange={(e) => setMilkRatio(parseInt(e.target.value))}
                                    className="w-full h-2 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-premium-gold"
                                />
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">More Coffee</span>
                                    <span className="font-bold text-premium-gold">{milkRatio}% Milk</span>
                                    <span className="text-text-muted">More Milk</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TYPE E: TOPPINGS SELECTOR */}
                    {item.options?.type === 'toppings' && (
                        <div className="card bg-surface-lighter">
                            <h3 className="font-bold text-xl mb-4">
                                Toppings {item.options.maxSelections && `(Max ${item.options.maxSelections})`}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {item.options.availableToppings.map((topping: any) => {
                                    const isSelected = selectedToppings.includes(topping.name);
                                    const maxSelections = item.options?.type === 'toppings' && item.options.maxSelections ? item.options.maxSelections : 999;
                                    const canSelect = selectedToppings.length < maxSelections;

                                    return (
                                        <button
                                            key={topping.name}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedToppings(prev => prev.filter(t => t !== topping.name));
                                                } else if (canSelect) {
                                                    setSelectedToppings(prev => [...prev, topping.name]);
                                                }
                                            }}
                                            disabled={!isSelected && !canSelect}
                                            className={`p-4 rounded-xl border-2 transition-all ${isSelected
                                                ? 'border-premium-gold bg-premium-gold/10 shadow-lg'
                                                : 'border-white/10 bg-surface-dark hover:border-premium-gold/50'
                                                } disabled:opacity-50`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold">{topping.name}</span>
                                                {isSelected && <span className="text-premium-gold">✓</span>}
                                            </div>
                                            <span className="text-sm text-premium-gold">+{topping.price} MAD</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TYPE F: BREAD TYPE SELECTOR */}
                    {item.options?.type === 'bread' && (
                        <div className="card bg-surface-lighter">
                            <h3 className="font-bold text-xl mb-4">Bread Type</h3>
                            <div className="space-y-2">
                                {item.options.breadTypes.map((bread) => (
                                    <button
                                        key={bread}
                                        onClick={() => setSelectedBread(bread)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedBread === bread
                                            ? 'border-premium-gold bg-premium-gold/10 shadow-lg'
                                            : 'border-white/10 bg-surface-dark hover:border-premium-gold/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-lg">{bread}</span>
                                            {selectedBread === bread && (
                                                <div className="w-6 h-6 rounded-full bg-premium-gold flex items-center justify-center">
                                                    <div className="text-bg-dark text-sm">✓</div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TYPE G: PASTA CONFIGURATOR */}
                    {item.options?.type === 'pasta' && (
                        <div className="space-y-4">
                            <div className="card bg-surface-lighter">
                                <h3 className="font-bold text-xl mb-4">Pasta Type</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {item.options.pastaTypes.map((pasta) => (
                                        <button
                                            key={pasta}
                                            onClick={() => setSelectedPasta(pasta)}
                                            className={`p-4 rounded-xl border-2 transition-all ${selectedPasta === pasta
                                                ? 'border-premium-gold bg-premium-gold/10 shadow-lg'
                                                : 'border-white/10 bg-surface-dark hover:border-premium-gold/50'
                                                }`}
                                        >
                                            <span className="font-bold">{pasta}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="card bg-surface-lighter">
                                <h3 className="font-bold text-xl mb-4">Sauce</h3>
                                <div className="space-y-2">
                                    {item.options.sauces.map((sauce) => (
                                        <button
                                            key={sauce}
                                            onClick={() => setSelectedSauce(sauce)}
                                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedSauce === sauce
                                                ? 'border-premium-gold bg-premium-gold/10 shadow-lg'
                                                : 'border-white/10 bg-surface-dark hover:border-premium-gold/50'
                                                }`}
                                        >
                                            <span className="font-bold">{sauce}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TYPE H: GENERIC PARAMETERS (New System) */}
                    {item.options?.type === 'generic' && item.options.parameters && (
                        <div className="space-y-4">
                            {item.options.parameters.map((param: any, index: number) => {
                                // STEPPER TYPE (for Sugar, Quantity, etc.)
                                if (param.type === 'stepper') {
                                    const value = genericParams[param.label] ?? param.default ?? param.min;
                                    return (
                                        <div key={index} className="card bg-surface-lighter">
                                            <h3 className="font-bold text-xl mb-4">{param.label}</h3>
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => setGenericParams(prev => ({
                                                        ...prev,
                                                        [param.label]: Math.max(param.min, value - (param.step || 1))
                                                    }))}
                                                    disabled={value <= param.min}
                                                    className="w-16 h-16 rounded-xl bg-surface-dark hover:bg-premium-gold hover:text-bg-dark disabled:opacity-30 transition-all flex items-center justify-center"
                                                >
                                                    <Minus className="w-6 h-6" />
                                                </button>

                                                <div className="text-4xl font-bold text-premium-gold">
                                                    {value}
                                                </div>

                                                <button
                                                    onClick={() => setGenericParams(prev => ({
                                                        ...prev,
                                                        [param.label]: Math.min(param.max, value + (param.step || 1))
                                                    }))}
                                                    disabled={value >= param.max}
                                                    className="w-16 h-16 rounded-xl bg-surface-dark hover:bg-premium-gold hover:text-bg-dark disabled:opacity-30 transition-all flex items-center justify-center"
                                                >
                                                    <Plus className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                // SELECT TYPE (for Cuisson, Coffee Type, etc.)
                                if (param.type === 'select') {
                                    const value = genericParams[param.label] ?? param.default ?? param.options[0];
                                    return (
                                        <div key={index} className="card bg-surface-lighter">
                                            <h3 className="font-bold text-xl mb-4">{param.label}</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {param.options.map((option: string) => (
                                                    <button
                                                        key={option}
                                                        onClick={() => setGenericParams(prev => ({
                                                            ...prev,
                                                            [param.label]: option
                                                        }))}
                                                        className={`p-4 rounded-xl border-2 transition-all ${value === option
                                                            ? 'border-premium-gold bg-premium-gold/10 shadow-lg'
                                                            : 'border-white/10 bg-surface-dark hover:border-premium-gold/50'
                                                            }`}
                                                    >
                                                        <span className="font-bold">{option}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }

                                // VARIANT TYPE (for Portions with price modifiers)
                                if (param.type === 'variant') {
                                    const value = genericParams[param.label] ?? param.default ?? param.options[0]?.label;
                                    return (
                                        <div key={index} className="card bg-surface-lighter">
                                            <h3 className="font-bold text-xl mb-4">{param.label}</h3>
                                            <div className="space-y-3">
                                                {param.options.map((option: any) => {
                                                    const isSelected = value === option.label;
                                                    const displayPrice = item.price + option.priceModifier;
                                                    return (
                                                        <button
                                                            key={option.label}
                                                            onClick={() => setGenericParams(prev => ({
                                                                ...prev,
                                                                [param.label]: option.label
                                                            }))}
                                                            className={`w-full p-6 rounded-2xl border-2 transition-all ${isSelected
                                                                ? 'border-premium-gold bg-premium-gold/10 shadow-xl scale-105'
                                                                : 'border-white/10 bg-surface-dark hover:border-premium-gold/50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="text-left">
                                                                    <p className="font-bold text-2xl mb-1">{option.label}</p>
                                                                    {option.priceModifier !== 0 && (
                                                                        <p className="text-sm text-text-muted">
                                                                            {option.priceModifier > 0 ? '+' : ''}{option.priceModifier} MAD
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className={`font-bold text-3xl ${isSelected ? 'text-premium-gold' : 'text-text-secondary'}`}>
                                                                    {displayPrice.toFixed(2)}
                                                                    <span className="text-sm ml-1">MAD</span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }

                                // MULTI TYPE (for Toppings with checkboxes)
                                if (param.type === 'multi') {
                                    const selectedItems = genericParams[param.label] ?? [];
                                    return (
                                        <div key={index} className="card bg-surface-lighter">
                                            <h3 className="font-bold text-xl mb-4">
                                                {param.label} {param.maxSelections && `(Max ${param.maxSelections})`}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {param.options.map((option: any) => {
                                                    const isSelected = selectedItems.includes(option.name);
                                                    const canSelect = !param.maxSelections || selectedItems.length < param.maxSelections;

                                                    return (
                                                        <button
                                                            key={option.name}
                                                            onClick={() => {
                                                                setGenericParams(prev => {
                                                                    const current = prev[param.label] || [];
                                                                    if (isSelected) {
                                                                        return {
                                                                            ...prev,
                                                                            [param.label]: current.filter((item: string) => item !== option.name)
                                                                        };
                                                                    } else if (canSelect) {
                                                                        return {
                                                                            ...prev,
                                                                            [param.label]: [...current, option.name]
                                                                        };
                                                                    }
                                                                    return prev;
                                                                });
                                                            }}
                                                            disabled={!isSelected && !canSelect}
                                                            className={`p-4 rounded-xl border-2 transition-all ${isSelected
                                                                ? 'border-premium-gold bg-premium-gold/10 shadow-lg'
                                                                : 'border-white/10 bg-surface-dark hover:border-premium-gold/50'
                                                                } disabled:opacity-50`}
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-bold">{option.name}</span>
                                                                {isSelected && <span className="text-premium-gold">✓</span>}
                                                            </div>
                                                            <span className="text-sm text-premium-gold">+{option.price} MAD</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }

                                return null;
                            })}
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="card bg-surface-lighter">
                        <h3 className="font-bold text-xl mb-4">Quantity</h3>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity === 1}
                                className="w-16 h-16 rounded-xl bg-surface-dark hover:bg-premium-gold hover:text-bg-dark disabled:opacity-30 disabled:hover:bg-surface-dark disabled:hover:text-text-primary transition-all flex items-center justify-center"
                            >
                                <Minus className="w-6 h-6" />
                            </button>

                            <div className="text-4xl font-bold text-premium-gold">
                                {quantity}
                            </div>

                            <button
                                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                disabled={quantity === 10}
                                className="w-16 h-16 rounded-xl bg-surface-dark hover:bg-premium-gold hover:text-bg-dark disabled:opacity-30 disabled:hover:bg-surface-dark disabled:hover:text-text-primary transition-all flex items-center justify-center"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer - Add to Cart Button */}
                <div className="sticky bottom-0 bg-surface-dark border-t border-white/10 p-6">
                    <button
                        onClick={handleAddToCart}
                        className="btn-primary w-full flex items-center justify-between text-xl py-5"
                    >
                        <span className="font-bold">Add to Cart</span>
                        <span className="font-bold text-2xl">{finalPrice.toFixed(2)} MAD</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
