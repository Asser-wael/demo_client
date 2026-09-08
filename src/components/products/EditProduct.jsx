import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  PiImageDuotone,
  PiPaletteDuotone,
  PiPlusBold,
  PiTrashDuotone,
  PiTagDuotone,
  PiCurrencyDollarDuotone,
  PiRocketLaunchDuotone,
  PiFloppyDiskDuotone,
  PiWarningCircleDuotone,
} from "react-icons/pi";
import { getCategories } from "../../features/category/categorySlice";
import { addProduct, clearEditid, updateProduct } from "../../features/products/productSlice";

const emptySize = () => ({
  size: "",
  stock: "",
  price: "",
  costPrice: "",
  offerPrice: "",
});

const emptyVariant = () => ({
  color: { name: "" },
  sizes: [emptySize()],
});

const SectionCard = ({ icon, title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow)] sm:p-6"
  >
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg text-primary">
        {icon}
      </span>
      <h2 className="text-lg font-semibold text-text sm:text-xl">{title}</h2>
    </div>
    {children}
  </motion.div>
);

export default function EditProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();

  const { categories } = useSelector((state) => state.categories);
  const { actionLoading: creating, products, editid } = useSelector((state) => state.products);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [variants, setVariants] = useState([emptyVariant()]);

  const product = products?.find((i) => i._id === editid);


  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);
  useEffect(() => {
    if (!product) return;


    setImage(product.image);
    setPreview(product.image);

    setVariants(
      (product.variants || []).map((variant) => ({
        color: {
          name: variant.color?.name || "",
        },
        sizes: (variant.sizes || []).map((size) => ({
          size: size.size || "",
          stock: size.stock || "",
          price: size.price || "",
          costPrice: size.costPrice || "",
          offerPrice: size.offerPrice || "",
        })),
      }))
    );

    reset({
      name: product.name || "",
      description: product.description || "",
      category:
        product.category?._id ||
        product.category ||
        "",
      status: product.isActive ? "Active" : "Inactive",
    });
  }, [product, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("File must be an image");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError("Image must be under 10MB");
      return;
    }

    setImageError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const addColor = () => setVariants((prev) => [...prev, emptyVariant()]);

  const removeColor = (variantIndex) =>
    setVariants((prev) => prev.filter((_, i) => i !== variantIndex));

  const updateColorName = (variantIndex, value) =>
    setVariants((prev) =>
      prev.map((v, i) => (i === variantIndex ? { ...v, color: { name: value } } : v))
    );

  const addSize = (variantIndex) =>
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex ? { ...v, sizes: [...v.sizes, emptySize()] } : v
      )
    );

  const removeSize = (variantIndex, sizeIndex) =>
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? { ...v, sizes: v.sizes.filter((_, si) => si !== sizeIndex) }
          : v
      )
    );

  const updateSizeField = (variantIndex, sizeIndex, field, value) =>
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? {
            ...v,
            sizes: v.sizes.map((s, si) =>
              si === sizeIndex ? { ...s, [field]: value } : s
            ),
          }
          : v
      )
    );

  const onSubmit = (data) => {
    if (!image) {
      setImageError("Product image is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("isActive", data.status === "Active");
    formData.append("variants", JSON.stringify(variants));
    formData.append("image", image);

    dispatch(updateProduct({ editid, formData })).then((res) => {
      if (!res.error) {
        dispatch(clearEditid());
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-text sm:text-3xl">Edit Product</h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Edit a new product for your store.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ================= Left ================= */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <SectionCard icon={<PiTagDuotone />} title="Basic Information">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="Oversized Hoodie"
                  {...register("name", { required: true })}
                  className={`w-full rounded-xl border bg-bg px-4 py-3 text-text outline-none transition focus:ring-2 focus:ring-accent/20 ${errors.name ? "border-red-500" : "border-border focus:border-accent"
                    }`}
                />
                {errors.name && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                    <PiWarningCircleDuotone /> Product name is required
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Write product description..."
                  {...register("description")}
                  className="w-full resize-none rounded-xl border border-border bg-bg p-4 text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
          </SectionCard>

          {/* Category & Status */}
          <SectionCard icon={<PiTagDuotone />} title="Organization" delay={0.05}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-text">Category</label>
                <select
                  {...register("category", { required: true })}
                  className={`w-full rounded-xl border bg-bg px-4 py-3 text-text outline-none transition focus:ring-2 focus:ring-accent/20 ${errors.category ? "border-red-500" : "border-border focus:border-accent"
                    }`}
                >
                  <option value="">Select Category</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                    <PiWarningCircleDuotone /> Please select a category
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-text">Status</label>
                <select
                  {...register("status")}
                  className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Variants (Colors + Sizes) */}
          <SectionCard icon={<PiPaletteDuotone />} title="Colors & Sizes" delay={0.1}>
            <div className="-mt-2 mb-5 flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={addColor}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-accent hover:text-accent"
              >
                <PiPlusBold /> Add Color
              </motion.button>
            </div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {variants.map((variant, vi) => (
                  <motion.div
                    key={vi}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 rounded-xl border border-border bg-bg/40 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border border-border"
                        style={{
                          backgroundColor: variant.color.name?.toLowerCase() || "transparent",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Color name (e.g. Black)"
                        value={variant.color.name}
                        onChange={(e) => updateColorName(vi, e.target.value)}
                        className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-text outline-none focus:border-accent"
                      />
                      {variants.length > 1 && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeColor(vi)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-400/10"
                        >
                          <PiTrashDuotone size={18} />
                        </motion.button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {variant.sizes.map((size, si) => (
                          <motion.div
                            key={si}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-2 gap-3 rounded-xl bg-card p-3 sm:grid-cols-3 lg:grid-cols-5"
                          >
                            <input
                              placeholder="Size (S/M/L)"
                              value={size.size}
                              onChange={(e) => updateSizeField(vi, si, "size", e.target.value)}
                              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                            />
                            <input
                              type="number"
                              placeholder="Stock"
                              value={size.stock}
                              onChange={(e) => updateSizeField(vi, si, "stock", +e.target.value)}
                              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                            />
                            <input
                              type="number"
                              placeholder="Price"
                              value={size.price}
                              onChange={(e) => updateSizeField(vi, si, "price", +e.target.value)}
                              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                            />
                            <input
                              type="number"
                              placeholder="Cost Price"
                              value={size.costPrice}
                              onChange={(e) => updateSizeField(vi, si, "costPrice", +e.target.value)}
                              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                            />
                            <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                              <input
                                type="number"
                                placeholder="Offer Price"
                                value={size.offerPrice}
                                onChange={(e) => updateSizeField(vi, si, "offerPrice", +e.target.value)}
                                className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                              />
                              {variant.sizes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSize(vi, si)}
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-400 hover:bg-red-400/10"
                                >
                                  <PiTrashDuotone size={15} />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <button
                      type="button"
                      onClick={() => addSize(vi)}
                      className="flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                    >
                      <PiPlusBold size={14} /> Add Size
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SectionCard>
        </div>

        {/* ================= Right ================= */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Upload */}
          <SectionCard icon={<PiImageDuotone />} title="Product Image" delay={0.05}>
            <label className="group flex h-48 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-bg transition hover:border-accent sm:h-56">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
                    <PiImageDuotone />
                  </div>
                  <p className="font-medium text-text">Upload Image</p>
                  <p className="mt-2 text-sm text-muted">PNG, JPG up to 10MB</p>
                </div>
              )}
            </label>
            {imageError && (
              <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                <PiWarningCircleDuotone /> {imageError}
              </p>
            )}
          </SectionCard>

          {/* Preview */}
          <SectionCard icon={<PiCurrencyDollarDuotone />} title="Product Preview" delay={0.1}>
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="flex h-52 items-center justify-center bg-bg sm:h-60">
                {preview ? (
                  <img src={preview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-5xl">🛍️</span>
                )}
              </div>

              <div className="space-y-2 p-5">
                <h3 className="font-semibold text-text">{watch("name") || "Product Name"}</h3>
                <p className="line-clamp-2 text-sm text-muted">
                  {watch("description") || "Product description..."}
                </p>
                <span className="block pt-2 text-lg font-bold text-accent">
                  ${variants[0]?.sizes[0]?.price || "0.00"}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Publish */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]"
          >
            <motion.button
              type="submit"
              disabled={creating}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              <PiRocketLaunchDuotone size={18} />
              {creating ? "Publishing..." : "Publish Product"}
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                dispatch(clearEditid())
                navigate(-1)
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 font-medium text-text transition hover:bg-bg"
            >
              Back
            </motion.button>
          </motion.div>
        </div>
      </div>
    </form>
  );
}