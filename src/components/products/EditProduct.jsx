import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  PiImageDuotone,
  PiBowlFoodDuotone,
  PiPlusBold,
  PiTrashDuotone,
  PiTagDuotone,
  PiCurrencyDollarDuotone,
  PiRocketLaunchDuotone,
  PiWarningCircleDuotone,
  PiTimerDuotone,
  PiFlameDuotone,
} from "react-icons/pi";
import { getCategories } from "../../features/category/categorySlice";
import { updateProduct, clearEditid } from "../../features/products/productSlice";

const emptyPortion = () => ({
  size: "", // e.g., Regular, Medium, Large, Half, Full
  price: "",
  costPrice: "",
  offerPrice: "",
  prepTime: "", // in minutes
  calories: "", // in kcal
});

const emptyAddon = () => ({
  name: "", // e.g., Extra Cheese
  price: "",
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

export default function EditMenuItem() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();

  const { categories } = useSelector((state) => state.categories);
  const { actionLoading: updating, products, editid } = useSelector((state) => state.products);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [portions, setPortions] = useState([emptyPortion()]);
  const [addons, setAddons] = useState([]);

  const menuItem = products?.find((i) => i._id === editid);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (preview && typeof preview === "string" && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    if (!menuItem) return;

    setImage(menuItem.image);
    setPreview(menuItem.image);

    if (menuItem.portions && menuItem.portions.length > 0) {
      setPortions(
        menuItem.portions.map((p) => ({
          size: p.size || "",
          price: p.price || "",
          costPrice: p.costPrice || "",
          offerPrice: p.offerPrice || "",
          prepTime: p.prepTime || "",
          calories: p.calories || "",
        }))
      );
    }

    if (menuItem.addons && menuItem.addons.length > 0) {
      setAddons(
        menuItem.addons.map((a) => ({
          name: a.name || "",
          price: a.price || "",
        }))
      );
    }

    reset({
      name: menuItem.name || "",
      description: menuItem.description || "",
      category: menuItem.category?._id || menuItem.category || "",
      status: menuItem.isActive ? "Active" : "Unavailable",
      isSpicy: menuItem.isSpicy || false,
      isVegetarian: menuItem.isVegetarian || false,
    });
  }, [menuItem, reset]);

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

  /* Portion handlers */
  const addPortion = () => setPortions((prev) => [...prev, emptyPortion()]);
  const removePortion = (index) => setPortions((prev) => prev.filter((_, i) => i !== index));
  const updatePortionField = (index, field, value) => {
    setPortions((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  /* Add-on handlers */
  const addAddon = () => setAddons((prev) => [...prev, emptyAddon()]);
  const removeAddon = (index) => setAddons((prev) => prev.filter((_, i) => i !== index));
  const updateAddonField = (index, field, value) => {
    setAddons((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  const onSubmit = (data) => {
    if (!image) {
      setImageError("Item image is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("isActive", data.status === "Active");
    formData.append("isSpicy", data.isSpicy);
    formData.append("isVegetarian", data.isVegetarian);
    formData.append("portions", JSON.stringify(portions));
    formData.append("addons", JSON.stringify(addons));

    if (image instanceof File) {
      formData.append("image", image);
    }

    dispatch(updateProduct({ editid, formData })).then((res) => {
      if (!res.error) {
        dispatch(clearEditid());
        navigate(-1);
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
        <h1 className="text-2xl font-bold text-text sm:text-3xl">Edit Menu Item</h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Update pricing, portions, and details for this menu item.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* General Information */}
          <SectionCard icon={<PiBowlFoodDuotone />} title="General Information">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Signature Truffle Burger"
                  {...register("name", { required: true })}
                  className={`w-full rounded-xl border bg-bg px-4 py-3 text-text outline-none transition focus:ring-2 focus:ring-accent/20 ${
                    errors.name ? "border-red-500" : "border-border focus:border-accent"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                    <PiWarningCircleDuotone /> Item name is required
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Description & Ingredients
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe ingredients, allergens, or special instructions..."
                  {...register("description")}
                  className="w-full resize-none rounded-xl border border-border bg-bg p-4 text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isSpicy")}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-accent"
                  />
                  Spicy Item 🌶️
                </label>
                <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isVegetarian")}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-accent"
                  />
                  Vegetarian 🌱
                </label>
              </div>
            </div>
          </SectionCard>

          {/* Menu Category & Availability */}
          <SectionCard icon={<PiTagDuotone />} title="Menu Organization" delay={0.05}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-text">Menu Category</label>
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
                <label className="mb-2 block text-sm text-text">Status</label>
                <select
                  {...register("status")}
                  className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="Active">Active (Available)</option>
                  <option value="Unavailable">Out of Stock / Unavailable</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {/* Portions & Pricing */}
          <SectionCard icon={<PiCurrencyDollarDuotone />} title="Portions & Pricing" delay={0.1}>
            <div className="-mt-2 mb-5 flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={addPortion}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-accent hover:text-accent"
              >
                <PiPlusBold /> Add Portion Variant
              </motion.button>
            </div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {portions.map((portion, pi) => (
                  <motion.div
                    key={pi}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3 rounded-xl border border-border bg-bg/40 p-4"
                  >
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                      <input
                        placeholder="Portion (e.g. Medium / 500g)"
                        value={portion.size}
                        onChange={(e) => updatePortionField(pi, "size", e.target.value)}
                        className="col-span-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-accent sm:col-span-1"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price ($)"
                        value={portion.price}
                        onChange={(e) => updatePortionField(pi, "price", e.target.value)}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-accent"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Cost Price ($)"
                        value={portion.costPrice}
                        onChange={(e) => updatePortionField(pi, "costPrice", e.target.value)}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-accent"
                      />
                      <input
                        type="number"
                        placeholder="Prep Time (mins)"
                        value={portion.prepTime}
                        onChange={(e) => updatePortionField(pi, "prepTime", e.target.value)}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-accent"
                      />
                      <input
                        type="number"
                        placeholder="Calories (kcal)"
                        value={portion.calories}
                        onChange={(e) => updatePortionField(pi, "calories", e.target.value)}
                        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-accent"
                      />
                      <div className="col-span-2 flex items-center justify-end gap-2 sm:col-span-1">
                        {portions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePortion(pi)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 hover:bg-red-400/10"
                          >
                            <PiTrashDuotone size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SectionCard>

          {/* Add-ons / Customizations */}
          <SectionCard icon={<PiPlusBold />} title="Add-ons & Extras" delay={0.15}>
            <div className="-mt-2 mb-5 flex justify-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={addAddon}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-accent hover:text-accent"
              >
                <PiPlusBold /> Add Extra Ingredient
              </motion.button>
            </div>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {addons.map((addon, ai) => (
                  <motion.div
                    key={ai}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-bg/40 p-3"
                  >
                    <input
                      placeholder="Add-on Name (e.g. Extra Cheese)"
                      value={addon.name}
                      onChange={(e) => updateAddonField(ai, "name", e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-accent"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price ($)"
                      value={addon.price}
                      onChange={(e) => updateAddonField(ai, "price", e.target.value)}
                      className="w-32 rounded-lg border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => removeAddon(ai)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-400 hover:bg-red-400/10"
                    >
                      <PiTrashDuotone size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Upload Image */}
          <SectionCard icon={<PiImageDuotone />} title="Item Photo" delay={0.05}>
            <label className="group flex h-48 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-bg transition hover:border-accent sm:h-56">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {preview ? (
                <img
                  src={preview}
                  alt="Food preview"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
                    <PiImageDuotone />
                  </div>
                  <p className="font-medium text-text">Upload Dish Image</p>
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

          {/* Menu Card Preview */}
          <SectionCard icon={<PiCurrencyDollarDuotone />} title="Menu Card Preview" delay={0.1}>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex h-48 items-center justify-center bg-bg sm:h-52">
                {preview ? (
                  <img src={preview} alt="Dish Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-5xl">🍔</span>
                )}
              </div>

              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text">{watch("name") || "Dish Name"}</h3>
                  <span className="text-base font-bold text-accent">
                    ${portions[0]?.price || "0.00"}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-muted">
                  {watch("description") || "Delicious dish description..."}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted">
                  {portions[0]?.prepTime && (
                    <span className="flex items-center gap-1">
                      <PiTimerDuotone /> {portions[0].prepTime} mins
                    </span>
                  )}
                  {portions[0]?.calories && (
                    <span className="flex items-center gap-1">
                      <PiFlameDuotone /> {portions[0].calories} kcal
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Publish / Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow)]"
          >
            <motion.button
              type="submit"
              disabled={updating}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              <PiRocketLaunchDuotone size={18} />
              {updating ? "Saving Changes..." : "Save Menu Item"}
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                dispatch(clearEditid());
                navigate(-1);
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 font-medium text-text transition hover:bg-bg"
            >
              Cancel
            </motion.button>
          </motion.div>
        </div>
      </div>
    </form>
  );
}