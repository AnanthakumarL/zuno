import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { productsAPI, categoriesAPI, sectionsAPI } from '../services/api';
import { Plus, Edit2, Trash2, X, Search, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const CATEGORY_ORDER = ['50ml Cups', '100ml Cups', '4 Litre Bulk', 'Add-ons'];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [premiumPrice, setPremiumPrice] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, sectionsRes] = await Promise.all([
        productsAPI.list({ page: 1, page_size: 200 }),
        categoriesAPI.list(),
        sectionsAPI.list(),
      ]);
      setProducts(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
      setSections(sectionsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { fetchData(); return; }
    try {
      const response = await productsAPI.search(searchQuery);
      setProducts(Array.isArray(response.data) ? response.data : (response.data?.data || []));
    } catch (error) {
      toast.error('Search failed');
      console.error(error);
    }
  };

  const openModal = (product = null) => {
    setEditingProduct(product);
    setImageFile(null);
    setPremiumPrice(product ? (product.attributes?.premium_price ?? '') : '99');
    reset(product || { name: '', description: '', price: 0, compare_at_price: 0, category_id: '', section_id: '', inventory_quantity: 0, min_order_quantity: 1, order_multiple: 1, is_active: true, featured: false });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingProduct(null); setImageFile(null); setPremiumPrice(''); reset(); };

  const onSubmit = async (data) => {
    try {
      data.category_id = data.category_id || null;
      data.section_id = data.section_id || null;
      data.price = parseFloat(data.price);
      data.compare_at_price = data.compare_at_price ? parseFloat(data.compare_at_price) : null;
      data.inventory_quantity = parseInt(data.inventory_quantity);
      data.min_order_quantity = Math.max(1, parseInt(data.min_order_quantity) || 1);
      data.order_multiple = Math.max(1, parseInt(data.order_multiple) || 1);
      data.attributes = {
        ...(editingProduct?.attributes || {}),
        premium_price: premiumPrice !== '' ? parseFloat(premiumPrice) : null,
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, data);
        if (imageFile) await productsAPI.uploadImage(editingProduct.id, imageFile);
        toast.success('Product updated!');
      } else {
        if (!imageFile) { toast.error('Please upload a product image'); return; }
        await productsAPI.createWithImage(data, imageFile);
        toast.success('Product created!');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error('Failed to save product');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted!');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error(error);
    }
  };

  // Group products by category, sorted by CATEGORY_ORDER
  const grouped = useMemo(() => {
    const catMap = {};
    categories.forEach(c => { catMap[c.id] = c.name; });

    const filtered = searchQuery.trim()
      ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : products;

    const groups = {};
    filtered.forEach(p => {
      const catName = catMap[p.category_id] || 'Uncategorized';
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(p);
    });

    return CATEGORY_ORDER
      .filter(name => groups[name])
      .map(name => ({ name, products: groups[name] }))
      .concat(
        Object.keys(groups)
          .filter(name => !CATEGORY_ORDER.includes(name))
          .map(name => ({ name, products: groups[name] }))
      );
  }, [products, categories, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-dark-900">Products</h1>
          <p className="text-dark-500 mt-1">{products.length} products across {categories.length} categories</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-dark-100 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-50 border border-dark-200 rounded-lg focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-dark-400" />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSearch} className="px-4 py-2.5 bg-dark-900 text-white rounded-lg hover:bg-dark-800 transition-colors font-medium">Search</button>
          <button onClick={() => { setSearchQuery(''); fetchData(); }} className="px-4 py-2.5 bg-white border border-dark-200 text-dark-700 rounded-lg hover:bg-dark-50 transition-colors font-medium">Clear</button>
        </div>
      </div>

      {/* Category Sections */}
      {grouped.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-dark-100 px-6 py-16 text-center text-dark-500">
          <Search className="w-10 h-10 mx-auto mb-3 text-dark-300" />
          <p className="text-lg font-medium text-dark-900">No products found</p>
          <p className="text-sm mt-1">Try adjusting your search or add a new product.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ name, products: groupProducts }) => (
            <div key={name} className="bg-white rounded-xl shadow-sm border border-dark-100 overflow-hidden">
              {/* Category Header */}
              <div className="px-6 py-3 bg-violet-50 border-b border-violet-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-violet-800">🍦 {name}</span>
                  <span className="text-xs font-medium px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full">
                    {groupProducts.length} items
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-dark-100">
                  <thead className="bg-dark-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Order Rules</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-100">
                    {groupProducts.map((product) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-dark-50/50 transition-colors group"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-dark-100 border border-dark-200 overflow-hidden flex items-center justify-center">
                              {product.image_url ? (
                                <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-[10px] text-dark-400">No img</span>
                              )}
                            </div>
                            <span className="text-sm font-medium text-dark-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="text-sm font-semibold text-dark-900">₹{Number(product.price).toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className={clsx('text-sm font-medium', product.inventory_quantity > 0 ? 'text-dark-700' : 'text-red-600')}>
                            {product.inventory_quantity.toLocaleString()} units
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="text-xs text-dark-600">
                            Min <span className="font-semibold">{product.min_order_quantity ?? 1}</span>
                            {' · '}×<span className="font-semibold">{product.order_multiple ?? 1}</span>
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={clsx('px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full w-fit',
                              product.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-dark-100 text-dark-600')}>
                              {product.is_active ? 'Active' : 'Draft'}
                            </span>
                            {product.featured && (
                              <span className="px-2 py-0.5 inline-flex text-[10px] font-semibold rounded-full w-fit bg-amber-50 text-amber-700 border border-amber-100">
                                Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openModal(product)} className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} className="absolute inset-0 bg-dark-900/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

              <div className="flex justify-between items-center p-6 border-b border-dark-100">
                <h2 className="text-xl font-bold font-heading text-dark-900">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={closeModal} className="p-2 text-dark-400 hover:text-dark-600 hover:bg-dark-50 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="label">Product Name</label>
                      <input type="text" {...register('name', { required: 'Name is required' })} className="input-field" placeholder="e.g. Vanilla Cup (100ml)" />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="label">Category</label>
                      <div className="relative">
                        <select {...register('category_id')} className="input-field appearance-none">
                          <option value="">No category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-dark-400">
                          <MoreHorizontal className="w-4 h-4 rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="label">Section</label>
                      <div className="relative">
                        <select {...register('section_id')} className="input-field appearance-none">
                          <option value="">No section</option>
                          {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-dark-400">
                          <MoreHorizontal className="w-4 h-4 rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="label">Description</label>
                      <textarea {...register('description')} className="input-field min-h-[80px]" rows="3" placeholder="Describe your product..." />
                    </div>

                    <div>
                      <label className="label">Price (₹)</label>
                      <input type="number" step="0.01" {...register('price', { required: 'Price is required' })} className="input-field" placeholder="0.00" />
                      {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                    </div>

                    <div>
                      <label className="label">Original Price (₹) <span className="text-dark-400 font-normal">(crossed-out "was" price)</span></label>
                      <input type="number" step="0.01" {...register('compare_at_price')} className="input-field" placeholder="0.00" />
                    </div>

                    <div className="col-span-2">
                      <label className="label flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                          👑 Premium Price (₹)
                        </span>
                        <span className="text-dark-400 font-normal text-xs">optional — shown as members-only offer on product page</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={premiumPrice}
                        onChange={e => setPremiumPrice(e.target.value)}
                        className="input-field"
                        placeholder="e.g. 199 — leave blank to hide the offer"
                      />
                      <p className="text-xs text-dark-400 mt-1">When set, a &quot;Buy for ₹X — Premium members only&quot; radio button appears on the product page.</p>
                    </div>

                    <div>
                      <label className="label">Inventory</label>
                      <input type="number" {...register('inventory_quantity', { required: 'Quantity is required' })} className="input-field" placeholder="0" />
                      {errors.inventory_quantity && <p className="text-red-500 text-sm mt-1">{errors.inventory_quantity.message}</p>}
                    </div>

                    <div>
                      <label className="label">Min. Order Qty</label>
                      <input type="number" min="1" {...register('min_order_quantity', { required: true, min: 1 })} className="input-field" placeholder="1" />
                      <p className="text-xs text-dark-400 mt-1">Smallest quantity a customer can order</p>
                    </div>

                    <div>
                      <label className="label">Order Multiple</label>
                      <input type="number" min="1" {...register('order_multiple', { required: true, min: 1 })} className="input-field" placeholder="1" />
                      <p className="text-xs text-dark-400 mt-1">Qty must be a multiple of this (e.g. 24 → 24, 48, 72…)</p>
                    </div>

                    <div className="col-span-2">
                      <label className="label">Product Image</label>
                      <div className="flex items-center gap-3">
                        <label className="btn-secondary cursor-pointer">
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                          Upload image
                        </label>
                        <span className="text-sm text-dark-500">
                          {imageFile ? imageFile.name : editingProduct?.image_url ? 'Current image kept' : 'No file selected'}
                        </span>
                      </div>
                      {!editingProduct && <p className="text-xs text-dark-500 mt-1">Image is required for new products.</p>}
                    </div>

                    <div className="col-span-2 flex gap-6 p-4 bg-dark-50 rounded-xl border border-dark-100">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" {...register('is_active')} className="w-5 h-5 text-violet-600 border-dark-300 rounded focus:ring-violet-500" />
                        <span className="text-sm font-medium text-dark-700">Active Product</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" {...register('featured')} className="w-5 h-5 text-violet-600 border-dark-300 rounded focus:ring-violet-500" />
                        <span className="text-sm font-medium text-dark-700">Featured Product</span>
                      </label>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-dark-100 bg-dark-50/50 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" form="product-form" className="btn-primary">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
