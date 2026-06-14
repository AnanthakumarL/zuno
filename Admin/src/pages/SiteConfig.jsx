import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { siteConfigAPI } from '../services/api';
import { Save, Loader2, Truck, Crown, Users, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const emptyDelivery = { enabled: false, pins: '' };

const SiteConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const [deliveryNormal,  setDeliveryNormal]  = useState({ ...emptyDelivery });
  const [deliveryPremium, setDeliveryPremium] = useState({ ...emptyDelivery });

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      const response = await siteConfigAPI.get();
      const attrs = response.data.attributes || {};
      // delivery_charge / free_shipping_threshold live in attributes (the JSON
      // column that actually persists) — surface them in the form inputs.
      reset({
        ...response.data,
        delivery_charge:         attrs.delivery_charge         ?? response.data.delivery_charge         ?? '',
        free_shipping_threshold: attrs.free_shipping_threshold ?? response.data.free_shipping_threshold ?? '',
      });
      if (attrs.delivery_normal)  setDeliveryNormal(attrs.delivery_normal);
      if (attrs.delivery_premium) setDeliveryPremium(attrs.delivery_premium);
    } catch {
      toast.error('Failed to load site configuration');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const { delivery_charge, free_shipping_threshold, ...rest } = data;
      const payload = {
        ...rest,
        attributes: {
          ...(data.attributes || {}),
          // Store in attributes (JSON) — the SiteConfig table has no dedicated
          // columns for these, so top-level fields would be silently dropped.
          delivery_charge:         Number(delivery_charge)         || 0,
          free_shipping_threshold: Number(free_shipping_threshold) || 0,
          delivery_normal:  deliveryNormal,
          delivery_premium: deliveryPremium,
        },
      };
      await siteConfigAPI.update(payload);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-violet-100 text-violet-600 rounded-xl">
          <Truck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-heading text-dark-900">Site Settings</h1>
          <p className="text-dark-500 mt-1">Shipping charge and delivery availability</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-dark-100 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">

          {/* ── Shipping Charge ── */}
          <div>
            <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2 border-b border-dark-100 pb-2">
              <Package className="w-5 h-5 text-dark-400" />
              Shipping Charge
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">Delivery Charge (₹)</label>
                <input
                  type="number"
                  step="1"
                  {...register('delivery_charge')}
                  className="input-field"
                  placeholder="49"
                />
                <p className="text-xs text-dark-400 mt-1">Flat delivery fee charged per order</p>
              </div>
              <div>
                <label className="label">Free Shipping Above (₹)</label>
                <input
                  type="number"
                  step="1"
                  {...register('free_shipping_threshold')}
                  className="input-field"
                  placeholder="500"
                />
                <p className="text-xs text-dark-400 mt-1">Orders above this amount get free shipping</p>
              </div>
            </div>
          </div>

          {/* ── Delivery Availability ── */}
          <div>
            <h3 className="text-lg font-bold text-dark-900 mb-1 flex items-center gap-2 border-b border-dark-100 pb-2">
              <Truck className="w-5 h-5 text-dark-400" />
              Delivery Availability
            </h3>
            <p className="text-xs text-dark-400 mb-5">
              Enter comma-separated pin codes (e.g. <code className="bg-dark-100 px-1 rounded">600001, 600002</code>).
              When <strong>enabled</strong> — only listed pins get delivery.
              When <strong>disabled</strong> — listed pins are blocked from delivery.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Normal Users */}
              <div className="border border-dark-200 rounded-2xl overflow-hidden">
                <div className={`flex items-center justify-between px-5 py-4 ${deliveryNormal.enabled ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-dark-50 border-b border-dark-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${deliveryNormal.enabled ? 'bg-emerald-100' : 'bg-dark-200'}`}>
                      <Users className={`w-4 h-4 ${deliveryNormal.enabled ? 'text-emerald-700' : 'text-dark-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark-900">Regular Users</p>
                      <p className={`text-xs font-medium ${deliveryNormal.enabled ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {deliveryNormal.enabled ? 'Delivery enabled at listed pins' : 'Delivery disabled at listed pins'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeliveryNormal(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${deliveryNormal.enabled ? 'bg-emerald-500' : 'bg-dark-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${deliveryNormal.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="px-5 py-4">
                  <label className="block text-xs font-semibold text-dark-600 mb-1.5 uppercase tracking-wide">
                    Pin Codes
                  </label>
                  <textarea
                    value={deliveryNormal.pins}
                    onChange={e => setDeliveryNormal(prev => ({ ...prev, pins: e.target.value }))}
                    rows={3}
                    placeholder="600001, 600002, 600003"
                    className="input-field text-sm font-mono resize-none"
                  />
                  <p className="text-xs text-dark-400 mt-1">
                    {deliveryNormal.enabled
                      ? 'Delivery available only at these pin codes for regular users.'
                      : 'Delivery NOT available at these pin codes for regular users.'}
                  </p>
                </div>
              </div>

              {/* Premium Users */}
              <div className="border border-dark-200 rounded-2xl overflow-hidden">
                <div className={`flex items-center justify-between px-5 py-4 ${deliveryPremium.enabled ? 'bg-amber-50 border-b border-amber-100' : 'bg-dark-50 border-b border-dark-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${deliveryPremium.enabled ? 'bg-amber-100' : 'bg-dark-200'}`}>
                      <Crown className={`w-4 h-4 ${deliveryPremium.enabled ? 'text-amber-700' : 'text-dark-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark-900">Premium Users</p>
                      <p className={`text-xs font-medium ${deliveryPremium.enabled ? 'text-amber-600' : 'text-rose-500'}`}>
                        {deliveryPremium.enabled ? 'Delivery enabled at listed pins' : 'Delivery disabled at listed pins'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeliveryPremium(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${deliveryPremium.enabled ? 'bg-amber-500' : 'bg-dark-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${deliveryPremium.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="px-5 py-4">
                  <label className="block text-xs font-semibold text-dark-600 mb-1.5 uppercase tracking-wide">
                    Pin Codes
                  </label>
                  <textarea
                    value={deliveryPremium.pins}
                    onChange={e => setDeliveryPremium(prev => ({ ...prev, pins: e.target.value }))}
                    rows={3}
                    placeholder="600001, 600002, 600003"
                    className="input-field text-sm font-mono resize-none"
                  />
                  <p className="text-xs text-dark-400 mt-1">
                    {deliveryPremium.enabled
                      ? 'Delivery available only at these pin codes for premium users.'
                      : 'Delivery NOT available at these pin codes for premium users.'}
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-dark-100">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center space-x-2 px-8 py-3 rounded-xl"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteConfig;
