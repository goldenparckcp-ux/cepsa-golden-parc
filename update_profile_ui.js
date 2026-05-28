const fs = require('fs');
let content = fs.readFileSync('app/profile/page.tsx', 'utf8');

if (!content.includes("const [orderTab, setOrderTab] = useState<'active' | 'history'>('active');")) {
    content = content.replace("const [isLoading, setIsLoading] = useState(false);", "const [isLoading, setIsLoading] = useState(false);\n    const [orderTab, setOrderTab] = useState<'active' | 'history'>('active');");
}

const uiOld = {orders.length > 0 && <span className="text-xs font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-lg">{orders.length} commandes</span>}
                          </div>

                          {loadingOrders ? (;

const uiNew = {orders.length > 0 && <span className="text-xs font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-lg">{orders.length} commandes</span>}
                          </div>

                          {/* Orders Tabs */}
                          <div className="flex gap-2 mb-6 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                              <button 
                                  onClick={() => setOrderTab('active')}
                                  className={\lex-1 py-2.5 rounded-xl text-sm font-bold transition-all \\}
                              >
                                  En cours
                              </button>
                              <button 
                                  onClick={() => setOrderTab('history')}
                                  className={\lex-1 py-2.5 rounded-xl text-sm font-bold transition-all \\}
                              >
                                  Historique
                              </button>
                          </div>

                          {loadingOrders ? (;

content = content.replace(uiOld, uiNew);

// Replace orders.map with filtered map
const mapOld = ) : (
                                <div className="space-y-4 pb-8">
                                    {orders.map((order, idx) => (;

const mapNew = ) : (
                                <div className="space-y-4 pb-8">
                                    {orders.filter(o => orderTab === 'active' ? ['pending', 'confirmed'].includes(o.status) : ['completed', 'cancelled'].includes(o.status)).map((order, idx) => (;

content = content.replace(mapOld, mapNew);

// Wait, what if orders.length === 0? 
// We should check the filtered array length. Let's do it safely.
const noActivityOld = ) : orders.length === 0 ? (;
const noActivityNew = ) : orders.filter(o => orderTab === 'active' ? ['pending', 'confirmed'].includes(o.status) : ['completed', 'cancelled'].includes(o.status)).length === 0 ? (;

content = content.replace(noActivityOld, noActivityNew);

fs.writeFileSync('app/profile/page.tsx', content, 'utf8');
console.log('Profile orders updated');
