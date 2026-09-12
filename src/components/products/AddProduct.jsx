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
  PiWarningCircleDuotone,
  PiBowlFoodDuotone,
} from "react-icons/pi";
import { getCategories } from "../../features/category/categorySlice";
import { addProduct } from "../../features/products/productSlice";

const emptySize = () => ({
  id: crypto.randomUUID(),
  size: "", // Size name (e.g., Single / Family / Medium)
  stock: "", // Available quantity
  price: "", // Regular Price
  costPrice: "", // Cost Price
  offerPrice: "", // Discount/Offer Price
});

const emptyVariant = () => ({
  id: crypto.randomUUID(),
  color: { name: "" }, // Flavor / Option (e.g., Spicy / Regular)
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

export default function AddProduct({ onDone }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const { categories } = useSelector((state) => state.categories);
  const { actionLoading: creating } = useSelector((state) => state.products);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [variants, setVariants] = useState([emptyVariant()]);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("File must be an image (PNG, JPG)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError("Image size must be less than 10MB");
      return;
    }

    setImageError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);

  const removeVariant = (id) =>
    setVariants((prev) => prev.filter((v) => v.id !== id));

  const updateVariantName = (id, value) =>
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, color: { name: value } } : v))
    );

  const addSize = (variantId) =>
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, sizes: [...v.sizes, emptySize()] } : v
      )
    );

  const removeSize = (variantId, sizeId) =>
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, sizes: v.sizes.filter((s) => s.id !== sizeId) }
          : v
      )
    );

  const updateSizeField = (variantId, sizeId, field, value) =>
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? {
              ...v,
              sizes: v.sizes.map((s) =>
                s.id === sizeId ? { ...s, [field]: value } : s
              ),
            }
          : v
      )
    );

  const onSubmit = (data) => {
    if (!image) {
      setImageError("Meal image is required");
      return;
    }

    const cleanedVariants = variants.map(({ id, sizes, ...rest }) => ({
      ...rest,
      sizes: sizes.map(({ id: sizeId, ...sizeRest }) => sizeRest),
    }));

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("isActive", data.status === "Active");
    formData.append("variants", JSON.stringify(cleanedVariants));
    formData.append("image", image);

    dispatch(addProduct(formData)).then((res) => {
      if (!res.error) {
        onDone ? onDone() : navigate("/admin/products");
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
        <h1 className="text-2xl font-bold text-text sm:text-3xl">Add New Meal</h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Add a new dish or meal to the restaurant menu.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ================= Left / Main Column (Basic Info & Options) ================= */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Information */}
          <SectionCard icon={<PiTagDuotone />} title="Meal Details">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Meal / Dish Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Grilled Chicken Burger"
                  {...register("name", { required: true })}
                  className={`w-full rounded-xl border bg-bg px-4 py-3 text-text outline-none transition focus:ring-2 focus:ring-accent/20 ${
                    errors.name ? "border-red-500" : "border-border focus:border-accent"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                    <PiWarningCircleDuotone /> Meal name is required
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Description & Ingredients
                </label>
                <textarea
                  rows={5}
                  placeholder="Write a description for the meal and main ingredients..."
                  {...register("description")}
                  className="w-full resize-none rounded-xl border border-border bg-bg p-4 text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
          </SectionCard>

          {/* Category & Status */}
          <SectionCard icon={<PiBowlFoodDuotone />} title="Category & Status" delay={0.05}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-text">Food Category</label>
                <select
                  {...register("category", { required: true })}
                  className={`w-full rounded-xl border bg-bg px-4 py-3 text-text outline-none transition focus:ring-2 focus:ring-accent/20 ${
                    errors.category ? "border-red-500" : "border-border focus:border-accent"
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
                <label className="mb-2 block text-sm text-text">Availability Status</label>
                <select
                  {...register("status")}
                  className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="Active">Available for order</option>
                  <option value="Inactive">Currently unavailable</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Options & Sizes (Flavors & Sizes) */}
          <SectionCard icon={<PiPaletteDuotone />} title="Flavors & Sizes" delay={0.1}>
            <div className="-mt-2 mb-5 flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={addVariant}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-accent hover:text-accent"
              >
                <PiPlusBold /> Add Flavor / Option
              </motion.button>
            </div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {variants.map((variant) => (
                  <motion.div
                    key={variant.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 rounded-xl border border-border bg-bg/40 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Meal option/flavor (e.g., Spicy, Regular, No Garlic)"
                        value={variant.color.name}
                        onChange={(e) => updateVariantName(variant.id, e.target.value)}
                        className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-text outline-none focus:border-accent"
                      />
                      {variants.length > 1 && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeVariant(variant.id)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-400/10"
                        >
                          <PiTrashDuotone size={18} />
                        </motion.button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {variant.sizes.map((size) => (
                          <motion.div
                            key={size.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-2 gap-3 rounded-xl bg-card p-3 sm:grid-cols-3 lg:grid-cols-5"
                          >
                            <input
                              placeholder="Size (Single/Medium/Family)"
                              value={size.size}
                              onChange={(e) => updateSizeField(variant.id, size.id, "size", e.target.value)}
                              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                            />
                            <input
                              type="number"
                              placeholder="Available Stock"
                              value={size.stock}
                              onChange={(e) => updateSizeField(variant.id, size.id, "stock", e.target.value)}
                              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                            />
                            <input
                              type="number"
                              placeholder="Price"
                              value={size.price}
                              onChange={(e) => updateSizeField(variant.id, size.id, "price", e.target.value)}
                              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                            />
                            <input
                              type="number"
                              placeholder="Cost Price"
                              value={size.costPrice}
                              onChange={(e) => updateSizeField(variant.id, size.id, "costPrice", e.target.value)}
                              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                            />
                            <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                              <input
                                type="number"
                                placeholder="Offer Price"
                                value={size.offerPrice}
                                onChange={(e) => updateSizeField(variant.id, size.id, "offerPrice", e.target.value)}
                                className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                              />
                              {variant.sizes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSize(variant.id, size.id)}
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
                      onClick={() => addSize(variant.id)}
                      className="flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                    >
                      <PiPlusBold size={14} /> Add Another Size
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SectionCard>
        </div>

        {/* ================= Right / Sidebar Column (Image Upload & Preview) ================= */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Upload Image */}
          <SectionCard icon={<PiImageDuotone />} title="Meal Image" delay={0.05}>
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
                  <p className="font-medium text-text">Upload meal image</p>
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

          {/* Card Preview */}
          <SectionCard icon={<PiCurrencyDollarDuotone />} title="Meal Preview" delay={0.1}>
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="flex h-52 items-center justify-center bg-bg sm:h-60">
                {preview ? (
                  <img src={preview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-5xl">🍔</span>
                )}
              </div>

              <div className="space-y-2 p-5">
                <h3 className="font-semibold text-text">{watch("name") || "Meal Name"}</h3>
                <p className="line-clamp-2 text-sm text-muted">
                  {watch("description") || "Meal description and ingredients..."}
                </p>
                <span className="block pt-2 text-lg font-bold text-accent">
                  ${variants[0]?.sizes[0]?.price || "0.00"}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Action Buttons */}
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
              {creating ? "Publishing..." : "Publish Meal to Menu"}
            </motion.button>

            <motion.button
              onClick={() => navigate(-1)}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
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