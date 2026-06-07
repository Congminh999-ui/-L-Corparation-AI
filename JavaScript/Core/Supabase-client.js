/**
 * L-Corparation — Supabase Client Setup
 * File: JavaScript/Core/Supabase-client.js
 *
 * ⚠️  QUAN TRỌNG — Load thứ tự:
 *   1. <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   2. <script src="../JavaScript/Core/Supabase-client.js"></script>
 *
 * Các key PUBLIC (anon key) được phép để trong file này vì chúng
 * chỉ cấp quyền theo Row Level Security (RLS) của Supabase.
 * SUPABASE_SERVICE_KEY tuyệt đối CHỈ dùng phía server (.env).
 */

(function () {
  'use strict';

  // ============================================================
  // CẤU HÌNH — Lấy tại: Supabase Dashboard → Project Settings → API
  // ============================================================
  const SUPABASE_URL = 'https://egfjnhhkewpyxtkcpoqc.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZmpuaGhrZXdweXh0a2Nwb3FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDU0NDMsImV4cCI6MjA5Mzc4MTQ0M30.Vk_h6iv7KSfTWPEENq95Idqk51LoVd2RGlTQiSSodNI';

  // ============================================================
  // KHỞI TẠO CLIENT
  // ============================================================
  if (typeof window.supabase === 'undefined') {
    console.error(
      '[Supabase] CDN chưa được load. Thêm vào HTML trước file này:\n' +
      '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script>'
    );
    return;
  }

  window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

  // ============================================================
  // HELPER CHUNG — xử lý lỗi & log
  // ============================================================
  function handleError(error, context) {
    console.error(`[Supabase][${context}]`, error?.message || error);
    return null;
  }

  // ============================================================
  // PRODUCTS API
  // ============================================================
  window.ProductsAPI = {

    /**
     * Lấy tất cả sản phẩm active.
     * @param {object} opts - categorySlug, vehicleType, isNew, isFeatured, search, limit, offset
     */
    async getAll({ categorySlug, vehicleType, isNew, isFeatured, search, limit, offset } = {}) {
      try {
        let q = window.db
          .from('products')
          .select('*, categories(name, slug, icon)')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (categorySlug) {
          const { data: cat } = await window.db
            .from('categories').select('id').eq('slug', categorySlug).single();
          if (cat) q = q.eq('category_id', cat.id);
        }
        if (vehicleType) q = q.eq('vehicle_type', vehicleType);
        if (isNew) q = q.eq('is_new', true);
        if (isFeatured) q = q.eq('is_featured', true);
        if (search) q = q.ilike('name', `%${search}%`);
        if (limit) q = q.limit(limit);
        if (offset) q = q.range(offset, offset + (limit || 10) - 1);

        const { data, error } = await q;
        if (error) return handleError(error, 'products.getAll');
        return data;
      } catch (e) {
        return handleError(e, 'products.getAll');
      }
    },

    /** Lấy 1 sản phẩm theo product_code */
    async getByCode(code) {
      try {
        const { data, error } = await window.db
          .from('products')
          .select('*, categories(name, slug), vehicle_specs(label, value, sort_order)')
          .eq('product_code', code)
          .single();
        if (error) return handleError(error, 'products.getByCode');
        return data;
      } catch (e) {
        return handleError(e, 'products.getByCode');
      }
    },

    /** Lấy 1 sản phẩm theo id */
    async getById(id) {
      try {
        const { data, error } = await window.db
          .from('products')
          .select('*, categories(name, slug), vehicle_specs(label, value, sort_order)')
          .eq('id', id)
          .single();
        if (error) return handleError(error, 'products.getById');
        return data;
      } catch (e) {
        return handleError(e, 'products.getById');
      }
    },

    /** Tạo sản phẩm mới — cần quyền admin */
    async create(payload) {
      try {
        const { data, error } = await window.db
          .from('products').insert(payload).select().single();
        if (error) return handleError(error, 'products.create');
        return data;
      } catch (e) {
        return handleError(e, 'products.create');
      }
    },

    /** Cập nhật sản phẩm — cần quyền admin */
    async update(id, payload) {
      try {
        const { data, error } = await window.db
          .from('products').update(payload).eq('id', id).select().single();
        if (error) return handleError(error, 'products.update');
        return data;
      } catch (e) {
        return handleError(e, 'products.update');
      }
    },

    /** Soft-delete (ẩn sản phẩm) — cần quyền admin */
    async delete(id) {
      try {
        const { error } = await window.db
          .from('products').update({ is_active: false }).eq('id', id);
        if (error) { handleError(error, 'products.delete'); return false; }
        return true;
      } catch (e) {
        handleError(e, 'products.delete');
        return false;
      }
    },

    async getCars() { return this.getAll({ categorySlug: 'car' }); },
    async getScooters() { return this.getAll({ categorySlug: 'scooter' }); },

    async getAccessories({ category, isNew, search, page = 1, pageSize = 8 } = {}) {
      try {
        const ids = await this._getAccessoryCategoryIds();
        let q = window.db
          .from('products')
          .select('*, categories(name, slug)', { count: 'exact' })
          .eq('is_active', true)
          .in('category_id', ids);

        if (category && category !== 'all') {
          const { data: cat } = await window.db
            .from('categories').select('id').eq('slug', category).single();
          if (cat) q = q.eq('category_id', cat.id);
        }
        if (category === 'new' || isNew) q = q.eq('is_new', true);
        if (search) q = q.ilike('name', `%${search}%`);
        q = q.range((page - 1) * pageSize, page * pageSize - 1);

        const { data, error, count } = await q;
        if (error) return handleError(error, 'products.getAccessories');
        return { data, count };
      } catch (e) {
        return handleError(e, 'products.getAccessories');
      }
    },

    async _getAccessoryCategoryIds() {
      const { data } = await window.db
        .from('categories').select('id')
        .in('slug', ['car_acc', 'scooter_acc', 'lifestyle']);
      return (data || []).map(c => c.id);
    },
  };

  // ============================================================
  // VEHICLE SPECS API
  // ============================================================
  window.SpecsAPI = {
    async getByProduct(productId) {
      try {
        const { data, error } = await window.db
          .from('vehicle_specs').select('*')
          .eq('product_id', productId).order('sort_order');
        if (error) return [];
        return data;
      } catch (_) { return []; }
    },

    async upsert(productId, specsArray) {
      try {
        await window.db.from('vehicle_specs').delete().eq('product_id', productId);
        const rows = specsArray.map((s, i) => ({
          product_id: productId, ...s, sort_order: i + 1,
        }));
        const { error } = await window.db.from('vehicle_specs').insert(rows);
        if (error) { handleError(error, 'specs.upsert'); return false; }
        return true;
      } catch (e) {
        handleError(e, 'specs.upsert');
        return false;
      }
    },
  };

  // ============================================================
  // ORDERS API
  // ============================================================
  window.OrdersAPI = {
    async create({ customerName, customerPhone, customerEmail, customerAddress,
      paymentMethod, items, notes }) {
      try {
        const totalAmount = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
        const userId = (await window.db.auth.getUser()).data?.user?.id || null;

        const { data: order, error: oErr } = await window.db
          .from('orders')
          .insert({
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail,
            customer_address: customerAddress,
            payment_method: paymentMethod,
            total_amount: totalAmount,
            notes,
            customer_id: userId,
          })
          .select().single();
        if (oErr) return handleError(oErr, 'orders.create');

        const itemRows = items.map(i => ({
          order_id: order.id,
          product_id: i.product_id || null,
          product_name: i.name,
          unit_price: i.unit_price,
          quantity: i.quantity,
        }));
        const { error: iErr } = await window.db.from('order_items').insert(itemRows);
        if (iErr) handleError(iErr, 'order_items.create');

        return order;
      } catch (e) {
        return handleError(e, 'orders.create');
      }
    },

    async getAll({ status, page = 1, pageSize = 20 } = {}) {
      try {
        let q = window.db
          .from('orders')
          .select('*, order_items(product_name, quantity, unit_price, subtotal)', { count: 'exact' })
          .order('created_at', { ascending: false });
        if (status) q = q.eq('status', status);
        q = q.range((page - 1) * pageSize, page * pageSize - 1);
        const { data, error, count } = await q;
        if (error) return handleError(error, 'orders.getAll');
        return { data, count };
      } catch (e) {
        return handleError(e, 'orders.getAll');
      }
    },

    async updateStatus(id, status) {
      try {
        const { data, error } = await window.db
          .from('orders').update({ status }).eq('id', id).select().single();
        if (error) return handleError(error, 'orders.updateStatus');
        return data;
      } catch (e) {
        return handleError(e, 'orders.updateStatus');
      }
    },
  };

  // ============================================================
  // AUTH API — Supabase Auth (thay thế hoàn toàn localStorage users)
  // ============================================================
  window.AuthAPI = {

    /** Đăng ký tài khoản mới */
    async register(email, password, fullName) {
      try {
        const { data, error } = await window.db.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) { handleError(error, 'auth.register'); return null; }
        return data;
      } catch (e) {
        handleError(e, 'auth.register');
        return null;
      }
    },

    /** Đăng nhập bằng email + password */
    async login(email, password) {
      try {
        const { data, error } = await window.db.auth.signInWithPassword({ email, password });
        if (error) { handleError(error, 'auth.login'); return null; }
        return data;
      } catch (e) {
        handleError(e, 'auth.login');
        return null;
      }
    },

    /** Đăng xuất */
    async logout() {
      try {
        await window.db.auth.signOut();
      } catch (e) {
        handleError(e, 'auth.logout');
      }
    },

    /** Lấy user đang đăng nhập (từ session hiện tại) */
    async getUser() {
      try {
        const { data, error } = await window.db.auth.getUser();
        if (error || !data?.user) return null;
        return data.user;
      } catch (_) {
        return null;
      }
    },

    /** Lấy profile từ bảng profiles (chứa role, dob, cccd, address...) */
    async getProfile() {
      try {
        const user = await this.getUser();
        if (!user) return null;
        const { data, error } = await window.db
          .from('profiles').select('*').eq('id', user.id).single();
        if (error) return null;
        return data;
      } catch (_) {
        return null;
      }
    },

    /** Cập nhật thông tin profile */
    async updateProfile(payload) {
      try {
        const user = await this.getUser();
        if (!user) return null;
        const { data, error } = await window.db
          .from('profiles').update(payload).eq('id', user.id).select().single();
        if (error) { handleError(error, 'auth.updateProfile'); return null; }
        return data;
      } catch (e) {
        handleError(e, 'auth.updateProfile');
        return null;
      }
    },

    /** Lắng nghe thay đổi trạng thái Auth (login / logout) */
    onAuthChange(callback) {
      return window.db.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
    },
  };

  // ============================================================
  // CONSULTATIONS API
  // ============================================================
  window.ConsultAPI = {
    async submit({ fullName, phone, email, productName, message }) {
      try {
        const { error } = await window.db.from('consultations').insert({
          full_name: fullName, phone, email,
          product_name: productName, message,
        });
        if (error) { handleError(error, 'consult.submit'); return false; }
        return true;
      } catch (e) {
        handleError(e, 'consult.submit');
        return false;
      }
    },
  };

  // ============================================================
  // CATEGORIES API
  // ============================================================
  window.CategoriesAPI = {
    async getAll() {
      try {
        const { data, error } = await window.db
          .from('categories').select('*').order('id');
        if (error) { handleError(error, 'categories.getAll'); return []; }
        return data;
      } catch (_) {
        return [];
      }
    },
  };

  console.log('[L-Corp] Supabase client ready ✅');
  document.dispatchEvent(new CustomEvent('supabaseReady'));
})();