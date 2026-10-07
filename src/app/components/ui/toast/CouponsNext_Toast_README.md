# CouponsNext Global Toast System

## Overview

CouponsNext has a custom global toast notification system.

It provides:

- `toast.success()`
- `toast.error()`
- `toast.warning()`
- `toast.info()`
- Custom toast positions
- Automatic dismissal
- Manual close button
- Framer Motion animations
- Maximum 3 visible toasts per position
- Oldest toast is removed when the limit is reached
- Optional custom duration
- Optional custom title

The toast system is mounted globally through `ToastProvider`, so client-side components throughout the application can trigger notifications without rendering a toast component themselves.

---

# File Structure

```text
src/app/components/ui/toast/
├── toast.ts
├── ToastProvider.tsx
├── ToastViewport.tsx
└── ToastItem.tsx
```

The global provider is mounted in:

```text
src/app/layout.tsx
```

---

# Why Use the Toast System?

Use the toast system for short-lived feedback such as:

- Successful API actions
- Failed API actions
- Warnings
- Informational messages
- Save/update/delete confirmations
- Authentication feedback
- Admin CRUD operation feedback

Example:

```tsx
toast.success("Category created successfully");
```

Instead of using:

```tsx
alert("Category created successfully");
```

The custom toast gives CouponsNext a consistent UI and lets us control the design, animation, position, timing, and behavior from one place.

---

# Important: Client Components Only

The `toast` API is intended to be called from **Client Components**.

Example:

```tsx
"use client";

import { toast } from "@/components/ui/toast/toast";

export default function ExampleButton() {
  const handleClick = () => {
    toast.success("Action completed successfully");
  };

  return (
    <button onClick={handleClick}>
      Save
    </button>
  );
}
```

## Why?

The toast is an interactive browser UI.

It depends on:

- React client state
- Browser-side events
- The mounted `ToastProvider`
- The client-side toast subscription
- Timers for automatic dismissal
- Framer Motion animations

Server Components do not run in the browser. They execute on the server, so they should not directly call the toast API.

---

# Basic Usage

Import:

```tsx
import { toast } from "@/components/ui/toast/toast";
```

## Success

```tsx
toast.success("Category created successfully");
```

## Error

```tsx
toast.error("Unable to create category");
```

## Warning

```tsx
toast.warning("Please select a category");
```

## Information

```tsx
toast.info("Your changes have been saved");
```

---

# Toast Positions

The toast system supports nine positions.

```text
top-left
top-center
top-right

center-left
center
center-right

bottom-left
bottom-center
bottom-right
```

Example:

```tsx
toast.success("Saved successfully", {
  position: "top-center",
});
```

Another example:

```tsx
toast.error("Something went wrong", {
  position: "bottom-right",
});
```

If no position is provided, the default is:

```text
top-right
```

---

# Custom Duration

The default duration is:

```text
4000ms = 4 seconds
```

You can override it:

```tsx
toast.success("Saved successfully", {
  duration: 6000,
});
```

This keeps the toast visible for approximately 6 seconds.

---

# Custom Title

You can optionally provide a custom title:

```tsx
toast.success("The category has been created.", {
  title: "Category Added",
});
```

Without a custom title, the system uses:

```text
Success
Error
Warning
Information
```

depending on the toast type.

---

# Combining Options

You can combine the available options:

```tsx
toast.success("Category created successfully", {
  title: "Category Added",
  position: "top-center",
  duration: 5000,
});
```

---

# API Request Example

A common pattern in CouponsNext will be:

```tsx
"use client";

import { toast } from "@/components/ui/toast/toast";

async function handleCreateCategory() {
  try {
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Electronics",
        slug: "electronics",
        contentTypes: ["store", "coupon"],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(
        data.message || "Unable to create category."
      );

      return;
    }

    toast.success("Category created successfully.");
  } catch {
    toast.error(
      "Something went wrong. Please check your connection."
    );
  }
}
```

For our project, when an API returns validation details, prefer using the existing reusable error helper before showing the toast.

Example:

```tsx
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";
import { toast } from "@/components/ui/toast/toast";

if (!response.ok) {
  const message = getApiErrorMessageOnUi(
    data,
    "Unable to create category."
  );

  toast.error(message);

  return;
}
```

---

# Using the Toast After a Delete

Example:

```tsx
const handleDelete = async (id: string) => {
  try {
    const response = await fetch(
      `/api/admin/categories/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const message = getApiErrorMessageOnUi(
        data,
        "Unable to delete category."
      );

      toast.error(message);

      return;
    }

    toast.success("Category deleted successfully.");
  } catch {
    toast.error(
      "Something went wrong while deleting the category."
    );
  }
};
```

---

# Maximum 3 Toasts Per Position

The system allows a maximum of **3 active toasts per position**.

For example:

```tsx
toast.success("Message 1", {
  position: "top-right",
});

toast.success("Message 2", {
  position: "top-right",
});

toast.success("Message 3", {
  position: "top-right",
});
```

Three toasts can be visible.

If a fourth toast is added:

```tsx
toast.success("Message 4", {
  position: "top-right",
});
```

the oldest `top-right` toast is removed.

The visible queue becomes:

```text
Message 2
Message 3
Message 4
```

This behavior is independent for each position.

For example, three `top-right` toasts and three `bottom-left` toasts can exist at the same time.

---

# Manual Dismissal

Every toast has a close button.

Users can manually dismiss a toast.

You can also dismiss a specific toast programmatically.

```tsx
const id = toast.success("Saving...", {
  duration: 10000,
});

toast.dismiss(id);
```

---

# Dismiss All Toasts

To remove every active toast:

```tsx
toast.dismissAll();
```

Example:

```tsx
toast.dismissAll();
```

Use this sparingly. Most components should only dismiss the toast they created when necessary.

---

# Using Toasts with Forms

Example:

```tsx
"use client";

import { toast } from "@/components/ui/toast/toast";

async function handleSubmit() {
  try {
    const response = await fetch("/api/example", {
      method: "POST",
    });

    if (!response.ok) {
      toast.error("Unable to save your changes.");
      return;
    }

    toast.success("Changes saved successfully.");
  } catch {
    toast.error(
      "Network error. Please try again."
    );
  }
}
```

---

# Using Toasts with Loading State

Do not use a toast for every small loading state.

Prefer an inline loading indicator for an operation that is still running:

```tsx
<button disabled={isSubmitting}>
  {isSubmitting ? "Saving..." : "Save"}
</button>
```

Then show a toast when the operation finishes:

```tsx
toast.success("Saved successfully.");
```

or:

```tsx
toast.error("Unable to save changes.");
```

This keeps the UI clean.

---

# Server Components

## Do NOT do this

Never directly call:

```tsx
import { toast } from "@/components/ui/toast/toast";

export default async function Page() {
  toast.success("Loaded successfully");

  return <div>...</div>;
}
```

Server Components execute on the server.

The toast is a browser-side UI mechanism, so a Server Component should not directly trigger it.

---

# Correct Pattern for Server Components

If a Server Component performs a server-side operation, return the result to a Client Component.

The Client Component then displays the toast.

Example architecture:

```text
Server Component
       |
       | server-side operation
       ↓
   API / Server Action
       |
       | result
       ↓
Client Component
       |
       ↓
toast.success()
or
toast.error()
```

---

# Example: Server Component + Client Component

## Server Component

```tsx
import CategoryActions from "./CategoryActions";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1>Categories</h1>

      <CategoryActions
        initialCategories={categories}
      />
    </div>
  );
}
```

The Server Component can safely fetch the data.

The toast is not called here.

---

## Client Component

```tsx
"use client";

import { toast } from "@/components/ui/toast/toast";

export default function CategoryActions({
  initialCategories,
}: {
  initialCategories: unknown[];
}) {
  const handleCreate = async () => {
    try {
      const response = await fetch(
        "/api/admin/categories",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.message ||
            "Unable to create category."
        );

        return;
      }

      toast.success(
        "Category created successfully."
      );
    } catch {
      toast.error(
        "Something went wrong. Please try again."
      );
    }
  };

  return (
    <button onClick={handleCreate}>
      Create Category
    </button>
  );
}
```

This is the preferred pattern.

---

# Server Actions

If we later use a Next.js Server Action, the same principle applies.

The Server Action should return a result:

```ts
"use server";

export async function createCategory() {
  try {
    // Database operation...

    return {
      success: true,
      message: "Category created successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Unable to create category.",
    };
  }
}
```

The Client Component receives the result:

```tsx
"use client";

import { toast } from "@/components/ui/toast/toast";
import { createCategory } from "./actions";

async function handleCreate() {
  const result = await createCategory();

  if (!result.success) {
    toast.error(result.message);
    return;
  }

  toast.success(result.message);
}
```

The important rule is:

```text
Server Action
    ↓
returns result
    ↓
Client Component
    ↓
toast()
```

not:

```text
Server Action
    ↓
toast()
```

---

# Server-Side Redirects

If a Server Component needs to redirect:

```tsx
redirect("/login");
```

do not try to show a toast immediately before the redirect.

Instead, use the redirect/navigation flow and let the destination Client Component decide whether a notification should be displayed.

For example:

```text
Server
  ↓
redirect("/login")
  ↓
Login Client Component
  ↓
toast.info("Please log in to continue")
```

---

# Important Rule for CouponsNext

Use toasts for **temporary feedback**.

Good examples:

```text
Category created successfully
Category updated successfully
Category deleted successfully
Coupon published successfully
Banner deleted successfully
Blog saved successfully
Login failed
Unable to load categories
```

Avoid using toasts for information that the user needs to continuously see.

For example, don't use a toast for:

```text
A required form field is empty
```

Instead, show that validation error next to or above the form.

Likewise, don't use a toast as the only indicator of a loading state.

---

# Recommended CouponsNext Pattern

For API errors:

```tsx
const data = await response.json();

if (!response.ok) {
  const message = getApiErrorMessageOnUi(
    data,
    "Something went wrong."
  );

  toast.error(message);
  return;
}
```

For successful operations:

```tsx
toast.success(
  "Category updated successfully."
);
```

For warnings:

```tsx
toast.warning(
  "This category is currently inactive."
);
```

For information:

```tsx
toast.info(
  "Your changes are being processed."
);
```

---

# Summary

### Client Component

Use directly:

```tsx
"use client";

import { toast } from "@/components/ui/toast/toast";

toast.success("Saved successfully");
```

### Server Component

Do **not** call `toast()` directly.

Instead:

```text
Server Component
      ↓
API / Server Action
      ↓
returns result
      ↓
Client Component
      ↓
toast.success()
```

### Default behavior

```text
Default position: top-right
Default duration: 4 seconds
Maximum: 3 toasts per position
Oldest toast removed when limit is reached
Manual close: supported
Automatic close: supported
Animation: Framer Motion
```

This keeps the toast system reusable, predictable, and compatible with our Next.js Server/Client Component architecture.
