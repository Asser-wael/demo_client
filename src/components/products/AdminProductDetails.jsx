import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaTag,
  FaBoxOpen,
  FaLayerGroup,
  FaCalendarAlt,
} from "react-icons/fa";
import { getProducts } from "../../features/products/productSlice";

export default function AdminProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { products } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

  const product = products?.find((p) => p._id === id);

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(getProducts());
    }
  }, [dispatch, products]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card py-20 text-center">
        <FaBoxOpen className="text-4xl text-muted" />
        <p className="font-medium text-text">Product not found</p>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary mt-2 rounded-xl px-5 py-2 text-sm font-semibold"
        >
          <FaArrowLeft className="mr-2 inline" />
          Back
        </button>
      </div>
    );
  }

  const categoryName =
    product.category?.name ||
    categories?.find((c) => c._id === product.category)?.name ||
    "-";

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-text"
        >
          <FaArrowLeft />
          Back to products
        </button>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${product.isActive !== false
              ? "bg-green-500/10 text-green-500"
              : "bg-red-500/10 text-red-500"
            }`}
        >
          {product.isActive !== false ? "Active" : "Inactive"}
        </span>
      </motion.div>

      {/* Main info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <div className="card overflow-hidden p-4">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full rounded-2xl object-cover ring-1 ring-border"
          />
        </div>

        <div className="card space-y-5 p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              {categoryName}
            </p>
            <h1 className="mt-1 text-3xl text-text">{product.name}</h1>
            <p className="mt-1 text-xs text-muted">
              Product ID #{product._id}
            </p>
          </div>

          {product.description && (
            <p className="text-sm leading-relaxed text-muted">
              {product.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-3">
              <p className="flex items-center gap-1 text-xs text-muted">
                <FaCalendarAlt /> Created
              </p>
              <p className="mt-1 text-sm font-medium text-text">
                {product.createdAt
                  ? new Date(product.createdAt).toLocaleString()
                  : "-"}
              </p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="flex items-center gap-1 text-xs text-muted">
                <FaCalendarAlt /> Updated
              </p>
              <p className="mt-1 text-sm font-medium text-text">
                {product.updatedAt
                  ? new Date(product.updatedAt).toLocaleString()
                  : "-"}
              </p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted">Variants</p>
              <p className="mt-1 text-sm font-medium text-text">
                {product.variants?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Variants & sizes */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg text-text">
          <FaLayerGroup className="text-accent" />
          Variants & Sizes
        </h2>

        {product.variants?.length ? (
          product.variants.map((variant, vi) => (
            <div key={vi} className="card p-5">
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="mx-2 px-3 py-1 rounded-br-2xl inline-block border "
                  style={{
                    backgroundColor: variant?.color?.name || "#000000", // استخدم اسم اللون أو كود الـ Hex
                    color: variant?.color?.name || "#000000" // استخدم اسم اللون أو كود الـ Hex
                  }}
                >
                  .
                </span>
                <h3 className="font-medium text-text">
                  {variant.color?.name}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="border-b border-border">
                    <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                      <th className="px-4 py-2 font-semibold">Size</th>
                      <th className="px-4 py-2 font-semibold">Stock</th>
                      <th className="px-4 py-2 font-semibold">Price</th>
                      <th className="px-4 py-2 font-semibold">Cost Price</th>
                      <th className="px-4 py-2 font-semibold">Offer Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variant.sizes?.map((sz, si) => (
                      <tr
                        key={si}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 text-text">{sz.size}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2 text-text">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${sz.stock === 0
                                  ? "bg-red-500"
                                  : sz.stock < 10
                                    ? "bg-yellow-500"
                                    : "bg-accent"
                                }`}
                            />
                            {sz.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-accent">
                          ${sz.price}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          ${sz.costPrice}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {sz.offerPrice ? `$${sz.offerPrice}` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="card p-6 text-center text-sm text-muted">
            No variants added
          </div>
        )}
      </div>
    </div>
  );
}