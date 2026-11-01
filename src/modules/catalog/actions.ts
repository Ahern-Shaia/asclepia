"use server";

// Server Actions are public POST endpoints imported by client components (as references), so this
// file lives outside server/ and holds no DB access itself: every export goes through adminAction.

import { updateTag } from "next/cache";
import { adminCopy } from "@/copy/admin";
import { adminAction } from "@/server/action";
import {
  attributeDefSchema,
  categoryConfigSchema,
  categorySchema,
  changeStatusSchema,
  idSchema,
  reorderSchema,
  saveProductSchema,
} from "./admin-input";
import { deleteAttributeDef, saveAttributeDef, saveCategoryConfig } from "./server/attributes";
import { deleteCategory, reorderCategories, saveCategory } from "./server/categories";
import { changeStatus, deleteDraft, saveProduct } from "./server/products";

// Public catalog caches are tagged "catalog" and "product:<id>" (stack-rules P7-3). Attribute and
// category changes alter cards and filters everywhere, so they drop the whole catalog tag.
function invalidate(productId?: string) {
  updateTag("catalog");
  if (productId) updateTag(`product:${productId}`);
}

export const saveProductAction = adminAction(
  "product.save",
  saveProductSchema,
  async (input, admin) => {
    const r = await saveProduct(input, admin.email);
    invalidate(r.id);
    return {
      data: { id: r.id, updatedAt: r.updatedAt },
      warnings: r.efficacyWords.length
        ? [adminCopy.edit.efficacyWarning(r.efficacyWords.join("、"))]
        : [],
    };
  },
);

export const changeStatusAction = adminAction(
  "product.status",
  changeStatusSchema,
  async (input, admin) => {
    const r = await changeStatus(input, admin.email);
    invalidate(r.id);
    return { data: r };
  },
);

export const deleteDraftAction = adminAction("product.delete", idSchema, async ({ id }, admin) => {
  const r = await deleteDraft(id, admin.email);
  invalidate(r.id);
  return { data: r };
});

export const saveCategoryAction = adminAction(
  "category.save",
  categorySchema,
  async (input, admin) => {
    const r = await saveCategory(input, admin.email);
    invalidate();
    return { data: r };
  },
);

export const reorderCategoriesAction = adminAction(
  "category.reorder",
  reorderSchema,
  async ({ ids }, admin) => {
    const r = await reorderCategories(ids, admin.email);
    invalidate();
    return { data: r };
  },
);

export const deleteCategoryAction = adminAction(
  "category.delete",
  idSchema,
  async ({ id }, admin) => {
    const r = await deleteCategory(id, admin.email);
    invalidate();
    return { data: r };
  },
);

export const saveAttributeDefAction = adminAction(
  "attribute.save",
  attributeDefSchema,
  async (input, admin) => {
    const r = await saveAttributeDef(input, admin.email);
    invalidate();
    return { data: r };
  },
);

export const deleteAttributeDefAction = adminAction(
  "attribute.delete",
  idSchema,
  async ({ id }, admin) => {
    const r = await deleteAttributeDef(id, admin.email);
    invalidate();
    return { data: r };
  },
);

export const saveCategoryConfigAction = adminAction(
  "category.attributes",
  categoryConfigSchema,
  async (input, admin) => {
    const r = await saveCategoryConfig(input, admin.email);
    invalidate();
    return { data: r };
  },
);
