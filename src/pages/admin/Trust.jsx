import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaExclamationTriangle,
  FaShieldAlt,
  FaImage,
  FaCloudUploadAlt,
} from "react-icons/fa";
import {
  getTrustItems,
  addTrustItem,
  updateTrustItem,
  deleteTrustItem,
} from "../../features/trust/trustSlice";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
};

const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalPanel = {
  hidden: { opacity: 0, scale: 0.92, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 340, damping: 26 },
  },
  exit: { opacity: 0, scale: 0.94, y: 10, transition: { duration: 0.15 } },
};

export default function Trust() {
  const dispatch = useDispatch();
  const { trustItems, loading, actionLoading } = useSelector(
    (state) => state.trust
  );

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    dispatch(getTrustItems());
  }, [dispatch]);

  const openAddForm = () => {
    setEditTarget(null);
    setTitle("");
    setImage(null);
    setPreview(null);
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditTarget(item);
    setTitle(item.title);
    setImage(null);
    setPreview(item.image);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditTarget(null);
    setTitle("");
    setImage(null);
    setPreview(null);
    setIsDragging(false);
  };

  const setFile = (file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => setFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setFile(e.dataTransfer.files?.[0]);
  };

  const removeImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImage(null);
    setPreview(editTarget ? editTarget.image : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formData = new FormData();
    formData.append("title", title);
    if (image) formData.append("image", image);

    if (editTarget) {
      if (!image && !editTarget.image) return;
      await dispatch(updateTrustItem({ id: editTarget._id, formData }));
    } else {
      if (!image) return;
      await dispatch(addTrustItem(formData));
    }
    closeForm();
  };

  const handleDelete = (id) => {
    dispatch(deleteTrustItem(id));
    setConfirmDelete(null);
  };

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
            Home Page
          </p>
          <h1 className="mt-1 text-3xl text-text">Trust Badges</h1>
          <p className="mt-1 text-sm text-muted">
            Manage the trust strip shown on the homepage.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAddForm}
          className="btn-primary flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <FaPlus />
          Add Badge
        </motion.button>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl bg-border/50"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && trustItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card py-20 text-center"
        >
          <FaShieldAlt className="text-4xl text-muted" />
          <p className="font-medium text-text">No trust badges yet</p>
          <p className="text-sm text-muted">
            Add one to show it on the homepage
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAddForm}
            className="btn-primary mt-2 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            <FaPlus /> Add Badge
          </motion.button>
        </motion.div>
      )}

      {/* Grid */}
      {!loading && trustItems.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {trustItems.map((item) => (
              <motion.div
                key={item._id}
                layout
                variants={cardVariants}
                exit="exit"
                whileHover={{ y: -4 }}
                className="card group relative flex flex-col items-center gap-3 overflow-hidden p-5 text-center transition-shadow hover:shadow-lg"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="flex  items-center justify-center rounded-2xl bg-accent/10"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className=" object-contain rounded-3xl"
                  />
                </motion.div>

                <h3 className="line-clamp-2 text-sm font-medium text-text">
                  {item.title}
                </h3>

                <div className="mt-1 flex w-full gap-2 opacity-90 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => openEditForm(item)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs text-text transition-colors hover:border-accent hover:text-accent"
                  >
                    <FaEdit /> Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setConfirmDelete(item)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500/30 py-2 text-xs text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <FaTrash /> Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add / Edit form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={closeForm}
          >
            <motion.div
              variants={modalPanel}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-sm p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg text-text">
                  {editTarget ? "Edit Badge" : "Add Badge"}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeForm}
                  className="text-muted transition-colors hover:text-text"
                >
                  <FaTimes />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Free Shipping"
                    className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">
                    Icon / Image
                  </label>
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-6 transition-colors ${
                      isDragging
                        ? "border-accent bg-accent/10"
                        : "border-border bg-bg hover:bg-border/20"
                    }`}
                  >
                    {preview ? (
                      <div className="relative">
                        <motion.img
                          key={preview}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          src={preview}
                          alt="preview"
                          className="h-14 w-14 object-contain"
                        />
                        {image && (
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow-sm transition-transform hover:scale-110"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    ) : (
                      <FaCloudUploadAlt
                        className={`text-2xl transition-colors ${
                          isDragging ? "text-accent" : "text-muted"
                        }`}
                      />
                    )}
                    <span className="text-xs text-muted">
                      {preview
                        ? "Click or drop to change image"
                        : "Click or drop an image here"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={closeForm}
                    className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-text transition-colors hover:bg-bg"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: actionLoading ? 1 : 1.02 }}
                    whileTap={{ scale: actionLoading ? 1 : 0.98 }}
                    type="submit"
                    disabled={actionLoading}
                    className="btn-primary flex-1 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60"
                  >
                    {actionLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            ease: "linear",
                          }}
                          className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white"
                        />
                        Saving...
                      </span>
                    ) : editTarget ? (
                      "Save Changes"
                    ) : (
                      "Add Badge"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              variants={modalPanel}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-sm p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10"
              >
                <FaExclamationTriangle className="text-lg text-red-500" />
              </motion.div>
              <h3 className="mt-4 text-lg text-text">Delete Badge?</h3>
              <p className="mt-2 text-sm text-muted">
                Are you sure you want to delete "{confirmDelete.title}"? This
                can't be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 rounded-xl border border-border py-2.5 font-medium text-text transition-colors hover:bg-bg"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(confirmDelete._id)}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 font-medium text-white transition-colors hover:bg-red-600"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}