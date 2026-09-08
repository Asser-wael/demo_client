import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaBoxOpen,
  FaFilter,
  FaExclamationTriangle,
} from "react-icons/fa";
import { getProducts, deleteProduct, setEditid } from "../../features/products/productSlice";
import EditProduct from "../../components/products/EditProduct";
import { useNavigate } from "react-router-dom";

const getStock = (product) =>
  product.stock ??
  product.variants?.reduce(
    (sum, v) => sum + v.sizes?.reduce((s, sz) => s + (Number(sz.stock) || 0), 0),
    0
  ) ??
  0;

const getPrice = (product) => product.price ?? product.variants?.[0]?.sizes?.[0]?.price ?? 0;

export default function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { categories } = useSelector((state) => state.categories);
  const { products, editid } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setStatus("");
  };

  const filteredProducts = useMemo(() => {
    return (products || []).filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category ? p.category === category : true;
      const isActive = p.isActive !== false;
      const matchesStatus =
        status === "active" ? isActive : status === "inactive" ? !isActive : true;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  const handleDelete = (id) => {
    dispatch(deleteProduct(id));
    setConfirmDelete(null);
  };

  const handleEdit = (product) => {
    dispatch(setEditid(product._id));
  };

  if (editid) {
    return <EditProduct />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            Catalog
          </p>
          <h1 className="mt-1 text-3xl text-text">All Products</h1>
          <p className="mt-1 text-sm text-muted">Manage and organize everything you sell.</p>
        </div>
        <button
          onClick={() => navigate("add")}
          className="btn-primary flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <FaPlus />
          Add Product
        </button>
      </motion.div>

      {/* Filters */}
      <div className="card p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_160px_140px]">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-border bg-bg px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="">All Categories</option>
            {categories?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-border bg-bg px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-bg"
          >
            <FaFilter className="text-xs" />
            Reset
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card py-20 text-center">
          <FaBoxOpen className="text-4xl text-muted" />
          <p className="font-medium text-text">No products found</p>
          <p className="text-sm text-muted">Try adjusting your filters or add a new product</p>
        </div>
      )}

      {/* Desktop table */}
      {filteredProducts.length > 0 && (
        <div className="card hidden overflow-hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-border">
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                  <th className="px-5 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Price</th>
                  <th className="px-5 py-4 font-semibold">Stock</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Created</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filteredProducts.map((product) => {
                    const stock = getStock(product);
                    const price = getPrice(product);
                    const isActive = product.isActive !== false;
                    const stockColor =
                      stock === 0 ? "bg-red-500" : stock < 10 ? "bg-yellow-500" : "bg-accent";
                    return (
                      <motion.tr
                        key={product._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-b border-border transition-colors last:border-0 hover:bg-bg"
                      >
                        <td className="px-5 py-4">
                          <div
                            className="flex items-center cursor-pointer gap-4"
                            onClick={() => navigate(`${product._id}`)}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-14 w-14 rounded-xl object-cover ring-1 ring-border"
                            />
                            <div className="min-w-0">
                              <h3 className="truncate font-medium text-text">{product.name}</h3>
                              <p className="text-xs text-muted">
                                Product ID #{product._id?.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted">
                          {product.category?.name || product.category}
                        </td>
                        <td className="px-5 py-4 font-semibold text-accent">${price}</td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-2 text-text">
                            <span className={`h-1.5 w-1.5 rounded-full ${stockColor}`} />
                            {stock}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              isActive
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted">
                          {product.createdAt
                            ? new Date(product.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text transition-colors hover:bg-bg"
                            >
                              <FaEdit />
                              Edit
                            </button>
                            <button
                              onClick={() => setConfirmDelete(product)}
                              className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                            >
                              <FaTrash />
                              Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
          <AnimatePresence initial={false}>
            {filteredProducts.map((product) => {
              const stock = getStock(product);
              const price = getPrice(product);
              const isActive = product.isActive !== false;
              const stockColor =
                stock === 0 ? "text-red-500" : stock < 10 ? "text-yellow-500" : "text-muted";
              return (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="card p-4"
                >
                  <div className="flex gap-4" onClick={() => navigate(`${product._id}`)}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-border"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate font-medium text-text">{product.name}</h3>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            isActive
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {product.category?.name || product.category}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="font-semibold text-accent">${price}</span>
                        <span className={stockColor}>Stock: {stock}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-border pt-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm text-text transition-colors hover:bg-bg"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(product)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/30 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-sm p-6 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <FaExclamationTriangle className="text-lg text-red-500" />
              </div>
              <h3 className="mt-4 text-lg text-text">Delete Product?</h3>
              <p className="mt-2 text-sm text-muted">
                Are you sure you want to delete "{confirmDelete.name}"? This can't be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 rounded-xl border border-border py-2.5 font-medium text-text transition-colors hover:bg-bg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete._id)}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 font-medium text-white transition-colors hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}