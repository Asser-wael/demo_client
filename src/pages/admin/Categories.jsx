import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUploadCloud,
  FiLoader,
  FiFolder,
  FiAlertTriangle,
} from "react-icons/fi";

import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../../features/category/categorySlice"; // عدّل المسار حسب مشروعك

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e8e3da'/%3E%3C/svg%3E";

export default function Categories() {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = add, object = edit
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const list = categories || [];
    if (!search.trim()) return list;
    return list.filter((c) =>
      c.name?.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [categories, search]);

  const handleSubmit = async (formData) => {
    if (editing) {
      await dispatch(updateCategory({ id: editing._id, data: formData })).unwrap();
    } else {
      await dispatch(addCategory(formData)).unwrap();
    }
  };

  const handleDelete = async () => {
    await dispatch(deleteCategory(deleteTarget._id)).unwrap();
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl text-text">Categories</h1>
            <p className="mt-1 text-sm text-muted">Manage all product categories.</p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="btn-primary flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            <FiPlus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-6 max-w-md">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-text outline-none"
          />
        </div>

        {/* Grid / states */}
        <div className="mt-8">
          {loading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="aspect-[4/3] w-full animate-pulse bg-border/60" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-3/5 animate-pulse rounded bg-border/60" />
                    <div className="h-3 w-2/5 animate-pulse rounded bg-border/40" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && (categories || []).length === 0 && (
            <div className="card flex flex-col items-center justify-center py-24 text-center">
              <FiFolder className="h-8 w-8 text-muted" />
              <h3 className="mt-4 text-text">No categories yet</h3>
              <p className="mt-1 text-sm text-muted">
                Start organizing your products by creating a category.
              </p>
              <button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
                className="btn-primary mt-6 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              >
                <FiPlus className="h-4 w-4" />
                Create your first category
              </button>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((cat) => (
                  <motion.div
                    key={cat._id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="card group overflow-hidden"
                  >
                    <div className="relative aspect-[5/4] overflow-hidden h-fit w-fit">
                      <img
                        src={cat.image || PLACEHOLDER}
                        alt={cat.name}
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                        className="h-full w-full object-cover transition-transform duration-500 "
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-text font-semibold truncate">{cat.name}</h3>
                      <p className="mt-1 text-xs text-muted">
                        {typeof cat.productsCount === "number" ? cat.productsCount : "--"} products
                      </p>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setEditing(cat);
                            setModalOpen(true);
                          }}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs text-text hover:border-accent"
                        >
                          <FiEdit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs text-red-500 hover:border-red-500"
                        >
                          <FiTrash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add/Edit modal */}
      <CategoryModal
        isOpen={modalOpen}
        category={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-sm p-6 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <FiAlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h2 className="mt-4 text-text font-semibold">
                Are you sure you want to delete this category?
              </h2>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm text-text"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white"
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

function CategoryModal({ isOpen, category, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);
  const isEdit = !!category;

  useEffect(() => {
    if (isOpen) {
      setName(category?.name || "");
      setPreview(category?.image || "");
      setFile(null);
      setErrors({});
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErrors((p) => ({ ...p, image: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Category name is required.";
    if (!file && !(isEdit && preview)) nextErrors.image = "Category image is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const formData = new FormData();
    formData.append("name", name.trim());
    if (file) formData.append("image", file);

    try {
      setSubmitting(true);
      await onSubmit(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
          className="card w-full max-w-md"
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-text font-semibold">{isEdit ? "Edit Category" : "Add Category"}</h2>
            <button onClick={onClose} className="text-muted hover:text-text">
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-5 px-6 py-5">
            <div>
              <label className="mb-1.5 block text-sm text-muted">Category Name</label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="e.g. Jackets"
                className={`w-full rounded-lg border bg-bg px-3.5 py-2.5 text-sm text-text outline-none ${
                  errors.name ? "border-red-500" : "border-border"
                }`}
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-muted">Category Image</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-bg px-4 py-6 ${
                  errors.image ? "border-red-500" : "border-border"
                }`}
              >
                {preview ? (
                  <img src={preview} alt="preview" className="h-28 w-28 rounded-lg object-cover" />
                ) : (
                  <FiUploadCloud className="h-8 w-8 text-muted" />
                )}
                <span className="text-xs text-muted">{preview ? "Change image" : "Click to upload"}</span>
              </button>
              {errors.image && <p className="mt-1.5 text-xs text-red-500">{errors.image}</p>}
            </div>

            <div className="mt-1 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm text-text"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {submitting && <FiLoader className="h-4 w-4 animate-spin" />}
                {isEdit ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}