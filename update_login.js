const fs = require('fs');
let content = fs.readFileSync('app/profile/page.tsx', 'utf8');
const newImports = "import { Smartphone, Check, User, Loader2, ArrowRight, LogOut, Clock, Package, Wifi, Phone, Crown, QrCode, X, Moon, Waves, Trash2, UtensilsCrossed, AlertTriangle, Pencil, Save, Plus, ChevronDown, Facebook, Mail } from 'lucide-react';";
content = content.replace(/import { Smartphone[^}]+} from 'lucide-react';/, newImports);

const regex = /\{step === 'phone' && \([\s\S]*?Google[\s\S]*?<\/button>\s*<\/div>\s*\)\}/;

const newBlock = `{step === 'phone' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 w-full max-w-sm mx-auto">
                                    <div className="text-center mb-6">
                                        <h2 className="text-3xl font-black text-white mb-2">Bienvenue</h2>
                                        <p className="text-gray-400 text-sm">Continuez avec l'une des options suivantes</p>
                                    </div>

                                    <div className="flex gap-3 text-left">
                                        <div className="space-y-1 w-28 shrink-0">
                                            <label className="text-xs font-bold text-gray-400 ml-1">Préfixe</label>
                                            <div className="bg-[#1E293B] border border-white/10 h-[52px] rounded-xl flex items-center justify-between px-3 cursor-pointer hover:bg-white/5 transition-colors">
                                                <span className="text-white font-bold text-sm">MA +212</span>
                                                <ChevronDown className="w-4 h-4 text-gray-500" />
                                            </div>
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <label className="text-xs font-bold text-gray-400 ml-1">Numéro</label>
                                            <div className="bg-[#1E293B] border border-white/10 h-[52px] rounded-xl focus-within:border-[#00A884] focus-within:ring-1 focus-within:ring-[#00A884] transition-all flex items-center px-4">
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={e => setPhone(e.target.value)}
                                                    placeholder="6 00 00 00 00"
                                                    className="bg-transparent outline-none text-white font-bold w-full text-base placeholder:font-normal placeholder:text-gray-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-left text-[11px] text-gray-500 leading-relaxed pt-2">
                                        Le site est protégé par reCAPTCHA et la <span className="text-[#00A884] cursor-pointer hover:underline">politique de confidentialité</span> et les <span className="text-[#00A884] cursor-pointer hover:underline">conditions d'utilisation</span> de Google s'appliquent.
                                    </p>

                                    <button
                                        onClick={handleSendOtp}
                                        disabled={isLoading || phone.length < 9}
                                        className="w-full py-3.5 bg-[#00A884] hover:bg-[#008f6f] rounded-full font-bold text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale mt-2"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continuer avec WhatsApp"}
                                    </button>

                                    <div className="flex items-center gap-4 my-6 opacity-60">
                                        <div className="flex-1 border-t border-white/10"></div>
                                        <span className="text-xs text-gray-400">ou avec</span>
                                        <div className="flex-1 border-t border-white/10"></div>
                                    </div>

                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => {
                                                setIsLoading(true);
                                                const callbackUrl = new URL('/api/auth/callback', window.location.origin);
                                                callbackUrl.searchParams.set('next', '/profile');
                                                supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callbackUrl.toString() } });
                                            }}
                                            className="w-full py-3.5 bg-[#1E293B] border border-white/10 rounded-full font-bold text-white hover:bg-white/5 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Image src="https://www.svgrepo.com/show/475656/google-color.svg" width={20} height={20} className="w-5 h-5" alt="Google" />
                                            Google
                                        </button>
                                        <button className="w-full py-3.5 bg-[#1E293B] border border-white/10 rounded-full font-bold text-white hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                                            <Facebook className="w-5 h-5 text-[#1877F2]" fill="#1877F2" />
                                            Facebook
                                        </button>
                                        <button className="w-full py-3.5 bg-[#1E293B] border border-white/10 rounded-full font-bold text-white hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-300" />
                                            E-mail
                                        </button>
                                    </div>
                                </div>
                            )}`;
content = content.replace(regex, newBlock);
fs.writeFileSync('app/profile/page.tsx', content, 'utf8');
console.log('Login UI updated');
