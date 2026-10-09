// "use client";

// import { useEffect, useState } from "react";
// import { Loader2, Save, X } from "lucide-react";

// import type { Store } from "@/lib/hooks/useStores";

// interface Category {
//   id: string;
//   name: string;
//   slug: string;
// }

// interface StoreFormProps {
//   store?: Store | null;
//   onSubmit: (data: Record<string, unknown>) => Promise<void>;
//   onCancel: () => void;
//   submitting?: boolean;
// }

// interface FormState {
//   name: string;
//   slug: string;
//   description: string;
//   logo: string;
//   storeBanner: string;
//   websiteUrl: string;
//   affiliateUrl: string;
//   country: string;
//   category: string;
//   isActive: boolean;
//   isFeatured: boolean;
//   sortOrder: string;
// }

// const EMPTY_FORM: FormState = {
//   name: "",
//   slug: "",
//   description: "",
//   logo: "",
//   storeBanner: "",
//   websiteUrl: "",
//   affiliateUrl: "",
//   country: "",
//   category: "",
//   isActive: true,
//   isFeatured: false,
//   sortOrder: "0",
// };

// function createFormFromStore(store?: Store | null): FormState {
//   if (!store) {
//     return EMPTY_FORM;
//   }

//   return {
//     name: store.name,
//     slug: store.slug,
//     description: store.description || "",
//     logo: store.logo || "",
//     storeBanner: store.storeBanner || "",
//     websiteUrl: store.websiteUrl || "",
//     affiliateUrl: store.affiliateUrl || "",
//     country: store.country || "",
//     category: store.category?.id || "",
//     isActive: store.isActive,
//     isFeatured: store.isFeatured,
//     sortOrder: String(store.sortOrder ?? 0),
//   };
// }

// export default function StoreForm({
//   store,
//   onSubmit,
//   onCancel,
//   submitting = false,
// }: StoreFormProps) {
//   const [form, setForm] = useState<FormState>( createFormFromStore(store) );

//   const [categories, setCategories] = useState<Category[]>([]);
//   const [categoriesLoading, setCategoriesLoading] =
//     useState(true);

//   const [error, setError] = useState<string | null>(null);
//   const [slugTouched, setSlugTouched] = useState(!!store);

//   const isEditMode = !!store;

//   useEffect(() => {
//     setForm(createFormFromStore(store));
//     setSlugTouched(!!store);
//     setError(null);
//   }, [store]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         setCategoriesLoading(true);

//         const response = await fetch(
//           "/api/admin/categories?type=store&isActive=true&limit=100",
//           {
//             method: "GET",
//             credentials: "include",
//             cache: "no-store",
//           }
//         );

//         const data = await response.json();

//         if (!response.ok || !data.success) {
//           throw new Error(
//             data.message || "Failed to load categories"
//           );
//         }

//         setCategories(data.categories || []);
//       } catch (error) {
//         console.error(
//           "Failed to load store categories:",
//           error
//         );

//         setCategories([]);
//       } finally {
//         setCategoriesLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   const updateField = <K extends keyof FormState>(
//     field: K,
//     value: FormState[K]
//   ) => {
//     setForm((previous) => ({
//       ...previous,
//       [field]: value,
//     }));
//   };

//   const generateSlug = (value: string) => {
//     return value
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9\s-]/g, "")
//       .replace(/\s+/g, "-")
//       .replace(/-+/g, "-");
//   };

//   const handleNameChange = (value: string) => {
//     updateField("name", value);

//     if (!slugTouched) {
//       updateField("slug", generateSlug(value));
//     }
//   };

//   const handleSlugChange = (value: string) => {
//     setSlugTouched(true);

//     updateField("slug", generateSlug(value));
//   };

//   const handleSubmit = async (
//     event: React.SubmitEvent<HTMLFormElement>
//   ) => {
//     event.preventDefault();

//     setError(null);

//     const name = form.name.trim();
//     const slug = form.slug.trim();

//     if (!name) {
//       setError("Store name is required.");
//       return;
//     }

//     if (!slug) {
//       setError("Store slug is required.");
//       return;
//     }

//     if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
//       setError(
//         "Slug can only contain lowercase letters, numbers, and hyphens."
//       );
//       return;
//     }

//     if (
//       form.country.trim() &&
//       !/^[a-zA-Z]{2}$/.test(form.country.trim())
//     ) {
//       setError("Country must be a 2-letter country code.");
//       return;
//     }

//     const sortOrder = Number(form.sortOrder);

//     if (
//       !Number.isInteger(sortOrder) ||
//       sortOrder < 0
//     ) {
//       setError(
//         "Sort order must be a whole number greater than or equal to 0."
//       );
//       return;
//     }

//     try {
//       await onSubmit({
//         name,
//         slug,
//         description: form.description.trim() || undefined,
//         logo: form.logo.trim() || undefined,
//         storeBanner:
//           form.storeBanner.trim() || undefined,
//         websiteUrl:
//           form.websiteUrl.trim() || undefined,
//         affiliateUrl:
//           form.affiliateUrl.trim() || undefined,
//         country:
//           form.country.trim().toUpperCase() || undefined,
//         category: form.category || undefined,
//         isActive: form.isActive,
//         isFeatured: form.isFeatured,
//         sortOrder,
//       });
//     } catch (error) {
//       setError(
//         error instanceof Error
//           ? error.message
//           : "Failed to save store."
//       );
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="space-y-6"
//     >
//       {/* Header */}
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h2 className="text-lg font-semibold text-gray-900">
//             {isEditMode ? "Edit Store" : "Create Store"}
//           </h2>

//           <p className="mt-1 text-sm text-gray-500">
//             {isEditMode
//               ? "Update the store information and settings."
//               : "Add a new store to CouponsNext."}
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={onCancel}
//           disabled={submitting}
//           className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
//           aria-label="Close form"
//         >
//           <X size={19} />
//         </button>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {/* Basic information */}
//       <section className="space-y-4">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">
//             Basic information
//           </h3>

//           <p className="mt-1 text-xs text-gray-500">
//             Core information used to identify and display the
//             store.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           {/* Name */}
//           <div>
//             <label
//               htmlFor="store-name"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Store name <span className="text-red-500">*</span>
//             </label>

//             <input
//               id="store-name"
//               type="text"
//               value={form.name}
//               onChange={(event) =>
//                 handleNameChange(event.target.value)
//               }
//               placeholder="Nike"
//               maxLength={100}
//               disabled={submitting}
//               className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
//             />
//           </div>

//           {/* Slug */}
//           <div>
//             <label
//               htmlFor="store-slug"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Slug <span className="text-red-500">*</span>
//             </label>

//             <div className="flex">
//               <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
//                 /store/
//               </span>

//               <input
//                 id="store-slug"
//                 type="text"
//                 value={form.slug}
//                 onChange={(event) =>
//                   handleSlugChange(event.target.value)
//                 }
//                 placeholder="nike"
//                 maxLength={120}
//                 disabled={submitting}
//                 className="min-w-0 flex-1 rounded-r-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
//               />
//             </div>

//             <p className="mt-1 text-xs text-gray-400">
//               Lowercase letters, numbers and hyphens only.
//             </p>
//           </div>

//           {/* Description */}
//           <div className="md:col-span-2">
//             <label
//               htmlFor="store-description"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Description
//             </label>

//             <textarea
//               id="store-description"
//               value={form.description}
//               onChange={(event) =>
//                 updateField(
//                   "description",
//                   event.target.value
//                 )
//               }
//               placeholder="Short description about this store..."
//               maxLength={2000}
//               rows={4}
//               disabled={submitting}
//               className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
//             />

//             <p className="mt-1 text-right text-xs text-gray-400">
//               {form.description.length}/2000
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Images */}
//       <section className="space-y-4 border-t border-gray-100 pt-6">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">
//             Store images
//           </h3>

//           <p className="mt-1 text-xs text-gray-500">
//             Add the logo and banner URLs for the store.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           {/* Logo */}
//           <div>
//             <label
//               htmlFor="store-logo"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Logo URL
//             </label>

//             <input
//               id="store-logo"
//               type="url"
//               value={form.logo}
//               onChange={(event) =>
//                 updateField("logo", event.target.value)
//               }
//               placeholder="https://example.com/logo.png"
//               disabled={submitting}
//               className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
//             />
//           </div>

//           {/* Banner */}
//           <div>
//             <label
//               htmlFor="store-banner"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Store banner URL
//             </label>

//             <input
//               id="store-banner"
//               type="url"
//               value={form.storeBanner}
//               onChange={(event) =>
//                 updateField(
//                   "storeBanner",
//                   event.target.value
//                 )
//               }
//               placeholder="https://example.com/banner.jpg"
//               disabled={submitting}
//               className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
//             />
//           </div>
//         </div>
//       </section>

//       {/* URLs */}
//       <section className="space-y-4 border-t border-gray-100 pt-6">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">
//             Store links
//           </h3>

//           <p className="mt-1 text-xs text-gray-500">
//             Website and affiliate URLs used for store traffic
//             and monetization.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           {/* Website */}
//           <div>
//             <label
//               htmlFor="store-website"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Website URL
//             </label>

//             <input
//               id="store-website"
//               type="url"
//               value={form.websiteUrl}
//               onChange={(event) =>
//                 updateField(
//                   "websiteUrl",
//                   event.target.value
//                 )
//               }
//               placeholder="https://www.nike.com"
//               disabled={submitting}
//               className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
//             />
//           </div>

//           {/* Affiliate */}
//           <div>
//             <label
//               htmlFor="store-affiliate"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Affiliate URL
//             </label>

//             <input
//               id="store-affiliate"
//               type="url"
//               value={form.affiliateUrl}
//               onChange={(event) =>
//                 updateField(
//                   "affiliateUrl",
//                   event.target.value
//                 )
//               }
//               placeholder="https://affiliate.example.com/..."
//               disabled={submitting}
//               className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
//             />
//           </div>
//         </div>
//       </section>

//       {/* Classification */}
//       <section className="space-y-4 border-t border-gray-100 pt-6">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">
//             Classification
//           </h3>

//           <p className="mt-1 text-xs text-gray-500">
//             Assign the store to a category and country.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           {/* Category */}
//           <div>
//             <label
//               htmlFor="store-category"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Category
//             </label>

//             <select
//               id="store-category"
//               value={form.category}
//               onChange={(event) =>
//                 updateField(
//                   "category",
//                   event.target.value
//                 )
//               }
//               disabled={
//                 submitting || categoriesLoading
//               }
//               className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
//             >
//               <option value="">
//                 {categoriesLoading
//                   ? "Loading categories..."
//                   : "No category"}
//               </option>

//               {categories.map((category) => (
//                 <option
//                   key={category.id}
//                   value={category.id}
//                 >
//                   {category.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Country */}
//           <div>
//             <label
//               htmlFor="store-country"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Country
//             </label>

//             <input
//               id="store-country"
//               type="text"
//               value={form.country}
//               onChange={(event) =>
//                 updateField(
//                   "country",
//                   event.target.value
//                     .toUpperCase()
//                     .replace(/[^A-Z]/g, "")
//                     .slice(0, 2)
//                 )
//               }
//               placeholder="IN"
//               maxLength={2}
//               disabled={submitting}
//               className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm uppercase text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
//             />

//             <p className="mt-1 text-xs text-gray-400">
//               Use a 2-letter country code, e.g. IN, US, GB.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Publishing settings */}
//       <section className="space-y-4 border-t border-gray-100 pt-6">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">
//             Publishing settings
//           </h3>

//           <p className="mt-1 text-xs text-gray-500">
//             Control the store visibility and homepage
//             placement.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           {/* Active */}
//           <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50">
//             <input
//               type="checkbox"
//               checked={form.isActive}
//               onChange={(event) =>
//                 updateField(
//                   "isActive",
//                   event.target.checked
//                 )
//               }
//               disabled={submitting}
//               className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[var(--brand-purple)]"
//             />

//             <span>
//               <span className="block text-sm font-medium text-gray-800">
//                 Active store
//               </span>

//               <span className="mt-0.5 block text-xs text-gray-500">
//                 Allow this store to appear on the website.
//               </span>
//             </span>
//           </label>

//           {/* Featured */}
//           <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50">
//             <input
//               type="checkbox"
//               checked={form.isFeatured}
//               onChange={(event) =>
//                 updateField(
//                   "isFeatured",
//                   event.target.checked
//                 )
//               }
//               disabled={submitting}
//               className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[var(--brand-purple)]"
//             />

//             <span>
//               <span className="block text-sm font-medium text-gray-800">
//                 Featured store
//               </span>

//               <span className="mt-0.5 block text-xs text-gray-500">
//                 Include this store in featured store sections.
//               </span>
//             </span>
//           </label>
//         </div>

//         {/* Sort order */}
//         <div className="max-w-xs">
//           <label
//             htmlFor="store-sort-order"
//             className="mb-1.5 block text-sm font-medium text-gray-700"
//           >
//             Sort order
//           </label>

//           <input
//             id="store-sort-order"
//             type="number"
//             min={0}
//             step={1}
//             value={form.sortOrder}
//             onChange={(event) =>
//               updateField(
//                 "sortOrder",
//                 event.target.value
//               )
//             }
//             disabled={submitting}
//             className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
//           />

//           <p className="mt-1 text-xs text-gray-400">
//             Lower numbers appear first.
//           </p>
//         </div>
//       </section>

//       {/* Actions */}
//       <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
//         <button
//           type="button"
//           onClick={onCancel}
//           disabled={submitting}
//           className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           Cancel
//         </button>

//         <button
//           type="submit"
//           disabled={submitting}
//           className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           {submitting ? (
//             <>
//               <Loader2
//                 size={17}
//                 className="animate-spin"
//               />
//               {isEditMode
//                 ? "Saving changes..."
//                 : "Creating store..."}
//             </>
//           ) : (
//             <>
//               <Save size={17} />
//               {isEditMode
//                 ? "Save changes"
//                 : "Create store"}
//             </>
//           )}
//         </button>
//       </div>
//     </form>
//   );
// }








// "use client";

// import { useEffect, useState } from "react";
// import type { SubmitEvent } from "react";
// import { Loader2, Save, X } from "lucide-react";

// import type { Store } from "@/lib/hooks/useStores";

// interface Category {
//   id: string;
//   name: string;
//   slug: string;
// }

// interface StoreFormProps {
//   store?: Store | null;
//   onSubmit: (data: Record<string, unknown>) => Promise<void>;
//   onCancel: () => void;
//   submitting?: boolean;
// }

// interface FormState {
//   name: string;
//   slug: string;
//   description: string;
//   logo: string;
//   storeBanner: string;
//   websiteUrl: string;
//   affiliateUrl: string;
//   country: string;
//   category: string;
//   isActive: boolean;
//   isFeatured: boolean;
//   sortOrder: string;
// }

// type FieldErrors = Partial<Record<keyof FormState, string>>;

// const EMPTY_FORM: FormState = {
//   name: "",
//   slug: "",
//   description: "",
//   logo: "",
//   storeBanner: "",
//   websiteUrl: "",
//   affiliateUrl: "",
//   country: "",
//   category: "",
//   isActive: true,
//   isFeatured: false,
//   sortOrder: "0",
// };

// function createFormFromStore(store?: Store | null): FormState {
//   if (!store) return { ...EMPTY_FORM };

//   return {
//     name: store.name,
//     slug: store.slug,
//     description: store.description || "",
//     logo: store.logo || "",
//     storeBanner: store.storeBanner || "",
//     websiteUrl: store.websiteUrl || "",
//     affiliateUrl: store.affiliateUrl || "",
//     country: store.country || "",
//     category: store.category?.id || "",
//     isActive: store.isActive,
//     isFeatured: store.isFeatured,
//     sortOrder: String(store.sortOrder ?? 0),
//   };
// }

// const inputClass = (hasError: boolean) =>
//   `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
//     hasError
//       ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
//       : "border-gray-200 focus:border-[var(--brand-purple)] focus:ring-[var(--brand-purple)]/10"
//   }`;

// function FieldError({
//   message,
//   id,
// }: {
//   message?: string;
//   id?: string;
// }) {
//   if (!message) return null;

//   return (
//     <p
//       id={id}
//       className="mt-1.5 text-xs text-red-600"
//       role="alert"
//     >
//       {message}
//     </p>
//   );
// }

// function isValidOptionalUrl(value: string): boolean {
//   if (!value.trim()) return true;

//   try {
//     const url = new URL(value.trim());
//     return url.protocol === "http:" || url.protocol === "https:";
//   } catch {
//     return false;
//   }
// }

// export default function StoreForm({
//   store,
//   onSubmit,
//   onCancel,
//   submitting = false,
// }: StoreFormProps) {
//   const [form, setForm] = useState<FormState>(() => createFormFromStore(store) );
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [categoriesLoading, setCategoriesLoading] = useState(true);
//   const [errors, setErrors] = useState<FieldErrors>({});
//   const [serverError, setServerError] = useState<string | null>(null);
//   const [slugTouched, setSlugTouched] = useState(!!store);

//   const isEditMode = !!store;

//   useEffect(() => {
//     setForm(createFormFromStore(store));
//     setSlugTouched(!!store);
//     setErrors({});
//     setServerError(null);
//   }, [store]);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchCategories = async () => {
//       try {
//         setCategoriesLoading(true);

//         const response = await fetch(
//           "/api/admin/categories?type=store&isActive=true&limit=100",
//           {
//             method: "GET",
//             credentials: "include",
//             cache: "no-store",
//           }
//         );

//         const data = await response.json();

//         if (!response.ok || !data.success) {
//           throw new Error(
//             data.message || "Failed to load categories."
//           );
//         }

//         if (!cancelled) {
//           setCategories(data.categories || []);
//         }
//       } catch (error) {
//         console.error("Failed to load store categories:", error);

//         if (!cancelled) {
//           setCategories([]);
//         }
//       } finally {
//         if (!cancelled) {
//           setCategoriesLoading(false);
//         }
//       }
//     };

//     fetchCategories();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const updateField = <K extends keyof FormState>(
//     field: K,
//     value: FormState[K]
//   ) => {
//     setForm((previous) => ({
//       ...previous,
//       [field]: value,
//     }));

//     setErrors((previous) => {
//       if (!previous[field]) return previous;

//       const next = { ...previous };
//       delete next[field];
//       return next;
//     });

//     setServerError(null);
//   };

//   const generateSlug = (value: string) =>
//     value
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9\s-]/g, "")
//       .replace(/\s+/g, "-")
//       .replace(/-+/g, "-")
//       .replace(/^-|-$/g, "");

//   const handleNameChange = (value: string) => {
//     updateField("name", value);

//     if (!slugTouched) {
//       updateField("slug", generateSlug(value));
//     }
//   };

//   const handleSlugChange = (value: string) => {
//     setSlugTouched(true);
//     updateField("slug", generateSlug(value));
//   };

//   const validateForm = (): boolean => {
//     const nextErrors: FieldErrors = {};

//     if (!form.name.trim()) {
//       nextErrors.name = "Store name is required.";
//     } else if (form.name.trim().length > 100) {
//       nextErrors.name = "Store name cannot exceed 100 characters.";
//     }

//     if (!form.slug.trim()) {
//       nextErrors.slug = "Store slug is required.";
//     } else if (
//       !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())
//     ) {
//       nextErrors.slug =
//         "Use lowercase letters, numbers and single hyphens between words.";
//     } else if (form.slug.trim().length > 120) {
//       nextErrors.slug = "Slug cannot exceed 120 characters.";
//     }

//     if (form.description.trim().length > 2000) {
//       nextErrors.description =
//         "Description cannot exceed 2000 characters.";
//     }

//     if (form.logo.trim() && !isValidOptionalUrl(form.logo)) {
//       nextErrors.logo = "Enter a valid HTTP or HTTPS image URL.";
//     }

//     if (
//       form.storeBanner.trim() &&
//       !isValidOptionalUrl(form.storeBanner)
//     ) {
//       nextErrors.storeBanner =
//         "Enter a valid HTTP or HTTPS banner URL.";
//     }

//     if (
//       form.websiteUrl.trim() &&
//       !isValidOptionalUrl(form.websiteUrl)
//     ) {
//       nextErrors.websiteUrl =
//         "Enter a valid website URL starting with https:// or http://.";
//     }

//     if (
//       form.affiliateUrl.trim() &&
//       !isValidOptionalUrl(form.affiliateUrl)
//     ) {
//       nextErrors.affiliateUrl =
//         "Enter a valid affiliate URL starting with https:// or http://.";
//     }

//     if (
//       form.country.trim() &&
//       !/^[a-zA-Z]{2}$/.test(form.country.trim())
//     ) {
//       nextErrors.country =
//         "Use a 2-letter country code, such as IN or US.";
//     }

//     if (
//       form.sortOrder.trim() === "" ||
//       !/^\d+$/.test(form.sortOrder.trim()) ||
//       !Number.isSafeInteger(Number(form.sortOrder)) ||
//       Number(form.sortOrder) < 0
//     ) {
//       nextErrors.sortOrder =
//         "Enter a whole number greater than or equal to 0.";
//     }

//     setErrors(nextErrors);
//     return Object.keys(nextErrors).length === 0;
//   };

//   const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setServerError(null);

//     if (!validateForm()) return;

//     try {
//       await onSubmit({
//         name: form.name.trim(),
//         slug: form.slug.trim(),
//         description: form.description.trim() || undefined,
//         logo: form.logo.trim() || undefined,
//         storeBanner: form.storeBanner.trim() || undefined,
//         websiteUrl: form.websiteUrl.trim() || undefined,
//         affiliateUrl: form.affiliateUrl.trim() || undefined,
//         country: form.country.trim().toUpperCase() || undefined,
//         category: form.category || undefined,
//         isActive: form.isActive,
//         isFeatured: form.isFeatured,
//         sortOrder: Number(form.sortOrder),
//       });
//     } catch (error) {
//       setServerError(
//         error instanceof Error
//           ? error.message
//           : "Failed to save store."
//       );
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} noValidate className="space-y-5">
//       {/* Header */}
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h2 className="text-lg font-semibold text-gray-900">
//             {isEditMode ? "Edit Store" : "Create Store"}
//           </h2>
//           <p className="mt-1 text-sm text-gray-500">
//             {isEditMode
//               ? "Update store information and settings."
//               : "Add a new store to CouponsNext."}
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={onCancel}
//           disabled={submitting}
//           aria-label="Close form"
//           className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
//         >
//           <X size={19} />
//         </button>
//       </div>

//       {/* Server errors */}
//       {serverError && (
//         <div
//           role="alert"
//           className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
//         >
//           {serverError}
//         </div>
//       )}

//       {/* Basic information */}
//       <section className="space-y-4">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">
//             Basic information
//           </h3>
//           <p className="mt-1 text-xs text-gray-500">
//             Store name, URL slug and description.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           <div>
//             <label
//               htmlFor="store-name"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Store name <span className="text-red-500">*</span>
//             </label>
//             <input
//               id="store-name"
//               type="text"
//               value={form.name}
//               onChange={(event) => handleNameChange(event.target.value)}
//               maxLength={100}
//               placeholder="Nike"
//               disabled={submitting}
//               aria-invalid={!!errors.name}
//               aria-describedby={errors.name ? "store-name-error" : undefined}
//               className={inputClass(!!errors.name)}
//             />
//             <FieldError id="store-name-error" message={errors.name} />
//           </div>

//           <div>
//             <label
//               htmlFor="store-slug"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Slug <span className="text-red-500">*</span>
//             </label>
//             <div className="flex">
//               <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
//                 /store/
//               </span>
//               <input
//                 id="store-slug"
//                 type="text"
//                 value={form.slug}
//                 onChange={(event) => handleSlugChange(event.target.value)}
//                 maxLength={120}
//                 placeholder="nike"
//                 disabled={submitting}
//                 aria-invalid={!!errors.slug}
//                 aria-describedby={errors.slug ? "store-slug-error" : undefined}
//                 className={`min-w-0 flex-1 rounded-r-lg ${inputClass(!!errors.slug)}`}
//               />
//             </div>
//             {errors.slug ? (
//               <FieldError id="store-slug-error" message={errors.slug} />
//             ) : (
//               <p className="mt-1.5 text-xs text-gray-400">
//                 Lowercase letters, numbers and hyphens only.
//               </p>
//             )}
//           </div>

//           <div className="md:col-span-2">
//             <label
//               htmlFor="store-description"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Description
//             </label>
//             <textarea
//               id="store-description"
//               value={form.description}
//               onChange={(event) =>
//                 updateField("description", event.target.value)
//               }
//               maxLength={2000}
//               rows={3}
//               placeholder="Short description about this store..."
//               disabled={submitting}
//               aria-invalid={!!errors.description}
//               className={`${inputClass(!!errors.description)} resize-y`}
//             />
//             <FieldError message={errors.description} />
//             {!errors.description && (
//               <p className="mt-1 text-right text-xs text-gray-400">
//                 {form.description.length}/2000
//               </p>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* Images */}
//       <section className="space-y-4 border-t border-gray-100 pt-5">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">
//             Store images
//           </h3>
//           <p className="mt-1 text-xs text-gray-500">
//             Add optional logo and banner image URLs.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           <div>
//             <label
//               htmlFor="store-logo"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Logo URL
//             </label>
//             <input
//               id="store-logo"
//               type="url"
//               value={form.logo}
//               onChange={(event) => updateField("logo", event.target.value)}
//               placeholder="https://example.com/logo.png"
//               disabled={submitting}
//               aria-invalid={!!errors.logo}
//               className={inputClass(!!errors.logo)}
//             />
//             <FieldError message={errors.logo} />
//           </div>

//           <div>
//             <label
//               htmlFor="store-banner"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Store banner URL
//             </label>
//             <input
//               id="store-banner"
//               type="url"
//               value={form.storeBanner}
//               onChange={(event) =>
//                 updateField("storeBanner", event.target.value)
//               }
//               placeholder="https://example.com/banner.jpg"
//               disabled={submitting}
//               aria-invalid={!!errors.storeBanner}
//               className={inputClass(!!errors.storeBanner)}
//             />
//             <FieldError message={errors.storeBanner} />
//           </div>
//         </div>
//       </section>

//       {/* Store links */}
//       <section className="space-y-4 border-t border-gray-100 pt-5">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">
//             Store links
//           </h3>
//           <p className="mt-1 text-xs text-gray-500">
//             Website and affiliate URLs for store traffic and monetization.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           <div>
//             <label
//               htmlFor="store-website"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Website URL
//             </label>
//             <input
//               id="store-website"
//               type="url"
//               value={form.websiteUrl}
//               onChange={(event) =>
//                 updateField("websiteUrl", event.target.value)
//               }
//               placeholder="https://www.nike.com"
//               disabled={submitting}
//               aria-invalid={!!errors.websiteUrl}
//               className={inputClass(!!errors.websiteUrl)}
//             />
//             <FieldError message={errors.websiteUrl} />
//           </div>

//           <div>
//             <label
//               htmlFor="store-affiliate"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Affiliate URL
//             </label>
//             <input
//               id="store-affiliate"
//               type="url"
//               value={form.affiliateUrl}
//               onChange={(event) =>
//                 updateField("affiliateUrl", event.target.value)
//               }
//               placeholder="https://affiliate.example.com/..."
//               disabled={submitting}
//               aria-invalid={!!errors.affiliateUrl}
//               className={inputClass(!!errors.affiliateUrl)}
//             />
//             <FieldError message={errors.affiliateUrl} />
//           </div>
//         </div>
//       </section>

//       {/* Classification */}
//       <section className="space-y-4 border-t border-gray-100 pt-5">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">
//             Classification
//           </h3>
//           <p className="mt-1 text-xs text-gray-500">
//             Choose the store category and target country.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           <div>
//             <label
//               htmlFor="store-category"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Category
//             </label>
//             <select
//               id="store-category"
//               value={form.category}
//               onChange={(event) => updateField("category", event.target.value)}
//               disabled={submitting || categoriesLoading}
//               className={inputClass(false)}
//             >
//               <option value="">
//                 {categoriesLoading ? "Loading categories..." : "No category"}
//               </option>
//               {categories.map((category) => (
//                 <option key={category.id} value={category.id}>
//                   {category.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label
//               htmlFor="store-country"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Country
//             </label>
//             <input
//               id="store-country"
//               type="text"
//               value={form.country}
//               onChange={(event) =>
//                 updateField(
//                   "country",
//                   event.target.value
//                     .toUpperCase()
//                     .replace(/[^A-Z]/g, "")
//                     .slice(0, 2)
//                 )
//               }
//               placeholder="IN"
//               maxLength={2}
//               disabled={submitting}
//               aria-invalid={!!errors.country}
//               className={`${inputClass(!!errors.country)} uppercase`}
//             />
//             <FieldError message={errors.country} />
//             {!errors.country && (
//               <p className="mt-1.5 text-xs text-gray-400">
//                 Example: IN, US or GB.
//               </p>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* Publishing settings: all three in one row */}
//       <section className="space-y-4 border-t border-gray-100 pt-5">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">
//             Publishing settings
//           </h3>
//           <p className="mt-1 text-xs text-gray-500">
//             Control visibility, featured placement and display order.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
//           {/* Active */}
//           <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3.5 transition hover:bg-gray-50">
//             <input
//               type="checkbox"
//               checked={form.isActive}
//               onChange={(event) =>
//                 updateField("isActive", event.target.checked)
//               }
//               disabled={submitting}
//               className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand-purple)]"
//             />
//             <span>
//               <span className="block text-sm font-medium text-gray-800">
//                 Active store
//               </span>
//               <span className="mt-1 block text-xs text-gray-500">
//                 Show this store on the website.
//               </span>
//             </span>
//           </label>

//           {/* Featured */}
//           <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3.5 transition hover:bg-gray-50">
//             <input
//               type="checkbox"
//               checked={form.isFeatured}
//               onChange={(event) =>
//                 updateField("isFeatured", event.target.checked)
//               }
//               disabled={submitting}
//               className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand-purple)]"
//             />
//             <span>
//               <span className="block text-sm font-medium text-gray-800">
//                 Featured store
//               </span>
//               <span className="mt-1 block text-xs text-gray-500">
//                 Highlight this store.
//               </span>
//             </span>
//           </label>

//           {/* Sort order */}
//           <div className="rounded-lg border border-gray-200 p-3.5 flex flex-col lg:flex-row lg:items-center lg:gap-3 transition hover:bg-gray-50">
//             <label
//               htmlFor="store-sort-order"
//               className="mb-1.5 block text-sm font-medium text-gray-700"
//             >
//               Sort order
//             </label>
//             <input
//               id="store-sort-order"
//               type="number"
//               min={0}
//               step={1}
//               value={form.sortOrder}
//               onChange={(event) =>
//                 updateField("sortOrder", event.target.value)
//               }
//               disabled={submitting}
//               aria-invalid={!!errors.sortOrder}
//               className={inputClass(!!errors.sortOrder)}
//             />
//             <FieldError message={errors.sortOrder} />
//             {!errors.sortOrder && (
//               <p className="mt-1.5 text-xs text-gray-400">
//                 Lower numbers appear first.
//               </p>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* Actions */}
//       <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
//         <button
//           type="button"
//           onClick={onCancel}
//           disabled={submitting}
//           className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
//         >
//           Cancel
//         </button>

//         <button
//           type="submit"
//           disabled={submitting}
//           className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           {submitting ? (
//             <>
//               <Loader2 size={17} className="animate-spin" />
//               {isEditMode ? "Saving changes..." : "Creating store..."}
//             </>
//           ) : (
//             <>
//               <Save size={17} />
//               {isEditMode ? "Save changes" : "Create store"}
//             </>
//           )}
//         </button>
//       </div>
//     </form>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { ImagePlus, Loader2, Save, Trash2, Upload, X } from "lucide-react";

import type { Store } from "@/lib/hooks/useStores";
import { toast } from "@/components/ui/toast/toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface StoreFormProps {
  store?: Store | null;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  logo: string;
  storeBanner: string;
  websiteUrl: string;
  affiliateUrl: string;
  country: string;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  description: "",
  logo: "",
  storeBanner: "",
  websiteUrl: "",
  affiliateUrl: "",
  country: "",
  category: "",
  isActive: true,
  isFeatured: false,
  sortOrder: "0",
};

function createFormFromStore(store?: Store | null): FormState {
  if (!store) return { ...EMPTY_FORM };

  return {
    name: store.name,
    slug: store.slug,
    description: store.description || "",
    logo: store.logo || "",
    storeBanner: store.storeBanner || "",
    websiteUrl: store.websiteUrl || "",
    affiliateUrl: store.affiliateUrl || "",
    country: store.country || "",
    category: store.category?.id || "",
    isActive: store.isActive,
    isFeatured: store.isFeatured,
    sortOrder: String(store.sortOrder ?? 0),
  };
}

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
      : "border-gray-200 focus:border-[var(--brand-purple)] focus:ring-[var(--brand-purple)]/10"
  }`;

function FieldError({
  message,
  id,
}: {
  message?: string;
  id?: string;
}) {
  if (!message) return null;

  return (
    <p id={id} className="mt-1.5 text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}

function isValidOptionalUrl(value: string): boolean {
  if (!value.trim()) return true;

  // Allow URLs returned by our own image upload API.
  if (value.startsWith("/uploads/")) {
    return !value.startsWith("//");
  }

  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function uploadStoreImage(
  file: File,
  folder: "logos" | "banners"
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success || !data?.image?.url) {
    throw new Error(
      data?.message || `Failed to upload ${folder === "logos" ? "logo" : "banner"}.`
    );
  }

  return data.image.url as string;
}

export default function StoreForm({
  store,
  onSubmit,
  onCancel,
  submitting = false,
}: StoreFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    createFormFromStore(store)
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!store);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const isEditMode = !!store;
  const busy = submitting || uploading;

  useEffect(() => {
    setForm(createFormFromStore(store));
    setSlugTouched(!!store);
    setErrors({});
    setServerError(null);
    setLogoFile(null);
    setBannerFile(null);
  }, [store]);

  // Generate temporary previews for selected files.
  // Revoke object URLs to avoid leaking browser memory.
  useEffect(() => {
    if (!logoFile) {
      setLogoPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  useEffect(() => {
    if (!bannerFile) {
      setBannerPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(bannerFile);
    setBannerPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [bannerFile]);

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        setCategoriesLoading(true);

        const response = await fetch(
          "/api/admin/categories?type=store&isActive=true&limit=100",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load categories.");
        }

        if (!cancelled) {
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to load store categories:", error);

        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    }

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));

    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });

    setServerError(null);
  };

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const handleNameChange = (value: string) => {
    updateField("name", value);

    if (!slugTouched) {
      updateField("slug", generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    updateField("slug", generateSlug(value));
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "banner"
  ) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again after removing it.
    event.target.value = "";

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Choose a JPEG, PNG, or WebP image.", {
        title: "Unsupported image",
      });
      return;
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      toast.error("Choose a valid image no larger than 5 MB.", {
        title: "Invalid image",
      });
      return;
    }

    if (type === "logo") {
      setLogoFile(file);
      setErrors((previous) => ({ ...previous, logo: undefined }));
    } else {
      setBannerFile(file);
      setErrors((previous) => ({ ...previous, storeBanner: undefined }));
    }

    setServerError(null);
  };

  const removeImage = (type: "logo" | "banner") => {
    if (type === "logo") {
      setLogoFile(null);
      updateField("logo", "");
    } else {
      setBannerFile(null);
      updateField("storeBanner", "");
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: FieldErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Store name is required.";
    } else if (form.name.trim().length > 100) {
      nextErrors.name = "Store name cannot exceed 100 characters.";
    }

    if (!form.slug.trim()) {
      nextErrors.slug = "Store slug is required.";
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())
    ) {
      nextErrors.slug =
        "Use lowercase letters, numbers and single hyphens between words.";
    } else if (form.slug.trim().length > 120) {
      nextErrors.slug = "Slug cannot exceed 120 characters.";
    }

    if (form.description.trim().length > 2000) {
      nextErrors.description =
        "Description cannot exceed 2000 characters.";
    }

    if (form.logo.trim() && !isValidOptionalUrl(form.logo)) {
      nextErrors.logo = "Enter a valid HTTP, HTTPS, or uploaded image path.";
    }

    if (
      form.storeBanner.trim() &&
      !isValidOptionalUrl(form.storeBanner)
    ) {
      nextErrors.storeBanner =
        "Enter a valid HTTP, HTTPS, or uploaded image path.";
    }

    if (
      form.websiteUrl.trim() &&
      !isValidOptionalUrl(form.websiteUrl)
    ) {
      nextErrors.websiteUrl =
        "Enter a valid website URL starting with https:// or http://.";
    }

    if (
      form.affiliateUrl.trim() &&
      !isValidOptionalUrl(form.affiliateUrl)
    ) {
      nextErrors.affiliateUrl =
        "Enter a valid affiliate URL starting with https:// or http://.";
    }

    if (
      form.country.trim() &&
      !/^[a-zA-Z]{2}$/.test(form.country.trim())
    ) {
      nextErrors.country =
        "Use a 2-letter country code, such as IN or US.";
    }

    if (
      form.sortOrder.trim() === "" ||
      !/^\d+$/.test(form.sortOrder.trim()) ||
      !Number.isSafeInteger(Number(form.sortOrder)) ||
      Number(form.sortOrder) < 0
    ) {
      nextErrors.sortOrder =
        "Enter a whole number greater than or equal to 0.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setUploading(true);

    try {
      let logo = form.logo.trim();
      let storeBanner = form.storeBanner.trim();

      // Upload only newly selected files.
      // Existing image URLs remain unchanged when no new file is selected.
      if (logoFile || bannerFile) {
        const uploads: Promise<string>[] = [];

        if (logoFile) {
          uploads.push(uploadStoreImage(logoFile, "logos"));
        }

        if (bannerFile) {
          uploads.push(uploadStoreImage(bannerFile, "banners"));
        }

        const uploadedUrls = await Promise.all(uploads);
        let index = 0;

        if (logoFile) logo = uploadedUrls[index++];
        if (bannerFile) storeBanner = uploadedUrls[index++];
      }

      await onSubmit({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        logo: logo || undefined,
        storeBanner: storeBanner || undefined,
        websiteUrl: form.websiteUrl.trim() || undefined,
        affiliateUrl: form.affiliateUrl.trim() || undefined,
        country: form.country.trim().toUpperCase() || undefined,
        category: form.category || undefined,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        sortOrder: Number(form.sortOrder),
      });

      toast.success("Store saved successfully.", {
        title: isEditMode ? "Store updated" : "Store created",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save store.";

      setServerError(message);
      toast.error(message, { title: "Unable to save store" });
    } finally {
      setUploading(false);
    }
  };

  const renderImageField = (
    type: "logo" | "banner",
    label: string
  ) => {
    const isLogo = type === "logo";
    const value = isLogo ? form.logo : form.storeBanner;
    const file = isLogo ? logoFile : bannerFile;
    const preview = isLogo ? logoPreview : bannerPreview;
    const error = isLogo ? errors.logo : errors.storeBanner;
    const inputId = isLogo ? "store-logo-file" : "store-banner-file";
    const imageUrl = preview || value;

    return (
      <div className="space-y-3 rounded-xl border border-gray-200 p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <p className="mt-1 text-xs text-gray-500">
            JPEG, PNG or WebP · Maximum 5 MB
          </p>
        </div>

        {imageUrl ? (
          <div className="relative overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
            <img
              src={imageUrl}
              alt={`${label} preview`}
              className={
                isLogo
                  ? "h-36 w-full object-contain p-3"
                  : "h-40 w-full object-cover"
              }
            />

            {file && (
              <span className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-1 text-xs font-medium text-gray-700 shadow">
                New image
              </span>
            )}

            <button
              type="button"
              onClick={() => removeImage(type)}
              disabled={busy}
              className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 shadow transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center transition hover:border-[var(--brand-purple)] hover:bg-purple-50/30"
          >
            <ImagePlus size={28} className="text-gray-400" />
            <span className="mt-2 text-sm font-medium text-gray-700">
              Select {label.toLowerCase()}
            </span>
            <span className="mt-1 text-xs text-gray-400">
              Choose an image from your computer
            </span>
          </label>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(event) => handleImageChange(event, type)}
          className="sr-only"
        />

        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={inputId}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 ${
              busy ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <Upload size={15} />
            {imageUrl ? "Replace image" : "Choose image"}
          </label>

          {file && (
            <span className="max-w-full truncate text-xs text-gray-500">
              {file.name}
            </span>
          )}
        </div>

        <FieldError message={error} />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditMode ? "Edit Store" : "Create Store"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? "Update store information and settings."
              : "Add a new store to CouponsNext."}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          aria-label="Close form"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
        >
          <X size={19} />
        </button>
      </div>

      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Basic information
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Store name, URL slug and description.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="store-name" className="mb-1.5 block text-sm font-medium text-gray-700">
              Store name <span className="text-red-500">*</span>
            </label>
            <input
              id="store-name"
              value={form.name}
              onChange={(event) => handleNameChange(event.target.value)}
              maxLength={100}
              placeholder="Nike"
              disabled={busy}
              aria-invalid={!!errors.name}
              className={inputClass(!!errors.name)}
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <label htmlFor="store-slug" className="mb-1.5 block text-sm font-medium text-gray-700">
              Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                /store/
              </span>
              <input
                id="store-slug"
                value={form.slug}
                onChange={(event) => handleSlugChange(event.target.value)}
                maxLength={120}
                placeholder="nike"
                disabled={busy}
                aria-invalid={!!errors.slug}
                className={`min-w-0 flex-1 rounded-r-lg ${inputClass(!!errors.slug)}`}
              />
            </div>
            <FieldError message={errors.slug} />
            {!errors.slug && (
              <p className="mt-1.5 text-xs text-gray-400">
                Lowercase letters, numbers and hyphens only.
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="store-description" className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="store-description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Short description about this store..."
              disabled={busy}
              aria-invalid={!!errors.description}
              className={`${inputClass(!!errors.description)} resize-y`}
            />
            <FieldError message={errors.description} />
            {!errors.description && (
              <p className="mt-1 text-right text-xs text-gray-400">
                {form.description.length}/2000
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Store images</h3>
          <p className="mt-1 text-xs text-gray-500">
            Select images to upload. New images are uploaded when you save the store.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderImageField("logo", "Store logo")}
          {renderImageField("banner", "Store banner")}
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Store links</h3>
          <p className="mt-1 text-xs text-gray-500">
            Website and affiliate URLs for store traffic and monetization.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="store-website" className="mb-1.5 block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <input
              id="store-website"
              type="url"
              value={form.websiteUrl}
              onChange={(event) => updateField("websiteUrl", event.target.value)}
              placeholder="https://www.nike.com"
              disabled={busy}
              aria-invalid={!!errors.websiteUrl}
              className={inputClass(!!errors.websiteUrl)}
            />
            <FieldError message={errors.websiteUrl} />
          </div>

          <div>
            <label htmlFor="store-affiliate" className="mb-1.5 block text-sm font-medium text-gray-700">
              Affiliate URL
            </label>
            <input
              id="store-affiliate"
              type="url"
              value={form.affiliateUrl}
              onChange={(event) => updateField("affiliateUrl", event.target.value)}
              placeholder="https://affiliate.example.com/..."
              disabled={busy}
              aria-invalid={!!errors.affiliateUrl}
              className={inputClass(!!errors.affiliateUrl)}
            />
            <FieldError message={errors.affiliateUrl} />
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Classification</h3>
          <p className="mt-1 text-xs text-gray-500">
            Choose the store category and target country.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="store-category" className="mb-1.5 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="store-category"
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              disabled={busy || categoriesLoading}
              className={inputClass(false)}
            >
              <option value="">
                {categoriesLoading ? "Loading categories..." : "No category"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="store-country" className="mb-1.5 block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              id="store-country"
              value={form.country}
              onChange={(event) =>
                updateField(
                  "country",
                  event.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2)
                )
              }
              placeholder="IN"
              maxLength={2}
              disabled={busy}
              aria-invalid={!!errors.country}
              className={`${inputClass(!!errors.country)} uppercase`}
            />
            <FieldError message={errors.country} />
            {!errors.country && (
              <p className="mt-1.5 text-xs text-gray-400">Example: IN, US or GB.</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Publishing settings</h3>
          <p className="mt-1 text-xs text-gray-500">
            Control visibility, featured placement and display order.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3.5 transition hover:bg-gray-50">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => updateField("isActive", event.target.checked)}
              disabled={busy}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand-purple)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-800">Active store</span>
              <span className="mt-1 block text-xs text-gray-500">Show this store on the website.</span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3.5 transition hover:bg-gray-50">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) => updateField("isFeatured", event.target.checked)}
              disabled={busy}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand-purple)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-800">Featured store</span>
              <span className="mt-1 block text-xs text-gray-500">Highlight this store.</span>
            </span>
          </label>

          <div className="flex gap-3 rounded-lg border border-gray-200 p-3.5 transition hover:bg-gray-50">
            <label htmlFor="store-sort-order" className="mb-1.5 block text-sm font-medium text-gray-700">
              Sort order
            </label>
            <input
              id="store-sort-order"
              type="number"
              min={0}
              step={1}
              value={form.sortOrder}
              onChange={(event) => updateField("sortOrder", event.target.value)}
              disabled={busy}
              aria-invalid={!!errors.sortOrder}
              className={inputClass(!!errors.sortOrder)}
            />
            <FieldError message={errors.sortOrder} />
            {!errors.sortOrder && (
              <p className="mt-1.5 text-xs text-gray-400">Lower numbers appear first.</p>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              {uploading
                ? "Uploading images..."
                : isEditMode
                  ? "Saving changes..."
                  : "Creating store..."}
            </>
          ) : (
            <>
              <Save size={17} />
              {isEditMode ? "Save changes" : "Create store"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}