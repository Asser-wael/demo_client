import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
    FiPlus,
    FiX,
    FiSearch,
    FiTrash2,
    FiPackage,
    FiStar,
} from "react-icons/fi";
import { PiCrownSimpleFill } from "react-icons/pi";
import {
    getPopularProducts,
    addPopularProduct,
    deletePopularProduct,
} from "../../features/popular/popularSlice.js";
import { getProducts } from "../../features/products/productSlice";

export default function Popular() {
    const dispatch = useDispatch();

    const { products: popularProducts, loading, actionLoading } = useSelector(
        (state) => state.popular
    );
    const { products: allProducts } = useSelector((state) => state.products);

    const [modalOpen, setModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [removingId, setRemovingId] = useState(null);

    useEffect(() => {
        dispatch(getPopularProducts());
        dispatch(getProducts());
    }, [dispatch]);

    const popularIds = useMemo(
        () => new Set(popularProducts.map((item) => item.id?._id || item.id).filter(Boolean)),
        [popularProducts]
    );

    const availableProducts = useMemo(() => {
        return (allProducts || [])
            .filter((p) => !popularIds.has(p._id))
            .filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));
    }, [allProducts, popularIds, search]);

    // دالة استخراج الصورة والتأكد من إرجاع مسار صالح
    const getImage = (product) => {
        if (!product) return null;
        if (typeof product.image === "string") return product.image;
        if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
        return null;
    };

    // دالة استخراج أقل سعر للعرض
    const getDisplayPrice = (product) => {
        if (!product) return null;
        if (product.price) return product.price;
        if (product.variants?.length > 0) {
            const sizes = product.variants.flatMap((v) => v.sizes || []);
            const minPrice = sizes.length > 0 ? Math.min(...sizes.map((s) => s.offerPrice || s.price)) : null;
            return minPrice;
        }
        return null;
    };

    const handleAdd = async (productId) => {
        const res = await dispatch(addPopularProduct(productId));
        if (addPopularProduct.fulfilled.match(res)) {
            dispatch(getPopularProducts());
        }
    };

    const handleRemove = async (productId) => {
        setRemovingId(productId);
        await dispatch(deletePopularProduct(productId));
        setRemovingId(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full"
        >
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
                <div>
                    <h1 className="flex gap-2 items-center font-bold text-2xl text-[var(--text)]">
                        <PiCrownSimpleFill className="text-[var(--primary)] text-3xl" />
                        Popular Products
                    </h1>
                    <p className="text-[var(--muted)] text-sm mt-1">
                        Curate the products featured as popular on your storefront.
                    </p>
                </div>

                <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setModalOpen(true)}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm shadow-md"
                >
                    <FiPlus className="text-base" />
                    Add Product
                </motion.button>
            </div>

            {/* Grid */}
            <div className="card p-6 border border-[var(--border)] rounded-3xl">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-[3/4] rounded-2xl animate-pulse bg-[var(--border)]"
                            />
                        ))}
                    </div>
                ) : popularProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[var(--border)]/50"
                        >
                            <FiStar className="text-2xl text-[var(--primary)]" />
                        </div>
                        <h3 className="font-semibold text-lg text-[var(--text)]">
                            No popular products yet
                        </h3>
                        <p className="text-[var(--muted)] text-sm mt-1 max-w-sm">
                            Add your best sellers here so they stand out to your customers.
                        </p>
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: {},
                            show: { transition: { staggerChildren: 0.06 } },
                        }}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
                    >
                        <AnimatePresence mode="popLayout">
                            {popularProducts.map((item) => {
                                const product = item.id || item;
                                if (!product || typeof product !== "object") return null;
                                const img = getImage(product);
                                const price = getDisplayPrice(product);
                                const isRemoving = removingId === (product._id || item._id) && actionLoading;

                                return (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        variants={{
                                            hidden: { opacity: 0, y: 16 },
                                            show: { opacity: 1, y: 0 },
                                        }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                                        className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg)] group flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {/* Badge */}
                                        <div
                                            className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[var(--accent)] text-black shadow-sm"
                                        >
                                            <FiStar className="text-[10px] fill-current" />
                                            Popular
                                        </div>

                                        {/* Delete Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            disabled={actionLoading}
                                            onClick={() => handleRemove(product._id || item._id)}
                                            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-black/60 text-white backdrop-blur-md opacity-0 opacity-100 transition-opacity"
                                        >
                                            {isRemoving ? (
                                                <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                            ) : (
                                                <FiTrash2 className="text-sm" />
                                            )}
                                        </motion.button>

                                        {/* Image Container with Proper Aspect Ratio */}
                                        <div className="relative w-full aspect-[3/4] bg-[var(--card)] overflow-hidden flex items-center justify-center">
                                            {img ? (
                                                <img
                                                    src={img}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                />
                                            ) : (
                                                <FiPackage className="text-4xl text-[var(--muted)]" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 border-t border-[var(--border)] flex flex-col gap-1 bg-[var(--bg)]">
                                            <h3 className="font-semibold text-sm text-[var(--text)] truncate">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm font-bold text-[var(--primary)]">
                                                {price ? `EGP ${price}` : "—"}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 260, damping: 24 }}
                            onClick={(e) => e.stopPropagation()}
                            className="card w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                                <h2 className="font-bold text-lg text-[var(--text)]">Add Popular Product</h2>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--border)]/50 hover:bg-[var(--border)] transition-colors"
                                >
                                    <FiX className="text-[var(--text)]" />
                                </button>
                            </div>

                            <div className="p-5 pb-3">
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--border)] bg-[var(--card)]">
                                    <FiSearch className="text-[var(--muted)]" />
                                    <input
                                        autoFocus
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search products..."
                                        className="bg-transparent w-full text-sm outline-none border-none text-[var(--text)] placeholder-[var(--muted)]"
                                    />
                                </div>
                            </div>

                            <div className="overflow-y-auto px-5 pb-5 flex flex-col gap-2">
                                {availableProducts.length === 0 ? (
                                    <p className="text-[var(--muted)] text-sm text-center py-8">
                                        No products found.
                                    </p>
                                ) : (
                                    availableProducts.map((product) => {
                                        const img = getImage(product);
                                        const price = getDisplayPrice(product);
                                        return (
                                            <motion.div
                                                key={product._id}
                                                whileHover={{ x: -2 }}
                                                className="flex items-center gap-3 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 hover:bg-[var(--card)] transition-colors"
                                            >
                                                <div className="w-12 h-14 rounded-lg overflow-hidden flex items-center justify-center shrink-0 bg-[var(--bg)] border border-[var(--border)]">
                                                    {img ? (
                                                        <img src={img} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FiPackage className="text-[var(--muted)]" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-[var(--text)] truncate">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-[var(--primary)] font-bold">
                                                        {price ? `EGP ${price}` : ""}
                                                    </p>
                                                </div>

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    disabled={actionLoading}
                                                    onClick={() => handleAdd(product._id)}
                                                    className="btn-primary text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm"
                                                >
                                                    <FiPlus />
                                                    Add
                                                </motion.button>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}