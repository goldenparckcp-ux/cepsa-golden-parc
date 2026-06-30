import re

path = 'app/profile/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("import { useAuth } from '@/lib/state/AuthProvider';", "import { useAuth } from '@/lib/state/AuthProvider';\nimport { useCart } from '@/lib/state/CartContext';")

c = c.replace("const { user: authUser, loading: authLoading } = useAuth(); // Global Auth", "const { user: authUser, loading: authLoading } = useAuth(); // Global Auth\n    const { clear, addItem } = useCart();")

old_pencil = r'''onClick={(e) => {
                                                        e.stopPropagation();
                                                        // implement modify functionality
                                                        alert("Redirection vers le panier pour modification...");
                                                    }}'''

new_pencil = '''onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (!confirm(language === 'ar' ? 'هل أنت متأكد أنك تريد تعديل هذا الطلب؟ سيتم إلغاؤه.' : 'Voulez-vous modifier cette commande ? Elle sera annulée et vous serez redirigé vers le panier.')) return;
                                                        try {
                                                            const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
                                                            if (error) throw error;
                                                            clear();
                                                            let itemsList = [];
                                                            try {
                                                                itemsList = typeof order.rawItems === 'string' ? JSON.parse(order.rawItems) : order.rawItems;
                                                            } catch {}
                                                            if (Array.isArray(itemsList)) {
                                                                itemsList.forEach((item: any) => {
                                                                    if (!item.is_meta) {
                                                                        addItem(item);
                                                                    }
                                                                });
                                                            }
                                                            router.push('/restaurant?cart=open');
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert('Erreur lors de la modification');
                                                        }
                                                    }}'''

c = re.sub(old_pencil.replace('(', r'\(').replace(')', r'\)'), new_pencil, c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Done')
