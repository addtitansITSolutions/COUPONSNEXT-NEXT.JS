"use client";
import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

import type { BlogContentNode } from "@/lib/hooks/useBlogs";

interface BlogContentEditorProps {
  value: BlogContentNode;
  onChange: (content: BlogContentNode) => void;
  error?: string;
  disabled?: boolean;
  onClearError?: () => void;
}

const EMPTY_DOCUMENT: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

interface ToolbarButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function ToolbarButton({
  label,
  icon,
  onClick,
  active = false,
  disabled = false,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`blog-editor-toolbar-button ${
        active ? "is-active" : ""
      }`}
    >
      {icon}
    </button>
  );
}

export default function BlogContentEditor({
  value,
  onChange,
  error,
  disabled = false,
  onClearError,
}: BlogContentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Underline,
    ],
    content: (value ?? EMPTY_DOCUMENT) as JSONContent,
    immediatelyRender: false,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as BlogContentNode);
      onClearError?.();
    },
    editorProps: {
      attributes: {
        class: "blog-editor-prose",
        "aria-label": "Blog article content",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;

    const nextContent = (value ?? EMPTY_DOCUMENT) as JSONContent;

    // Do not reset the cursor when the document has not changed.
    if (
      JSON.stringify(editor.getJSON()) !== JSON.stringify(nextContent)
    ) {
      editor.commands.setContent(nextContent, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[var(--border)] bg-white">
        <span className="text-sm text-slate-500">
          Loading editor...
        </span>
      </div>
    );
  }

  const wordCount = editor
    .getText()
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  
    function addLink() {
    const currentEditor = editor;

    if (!currentEditor || disabled) return;

    const previousUrl = currentEditor.getAttributes("link").href as
        | string
        | undefined;

    const input = window.prompt(
        "Enter the link URL:",
        previousUrl ?? "https://"
    );

    if (input === null) return;

    const url = input.trim();

    if (!url) {
        currentEditor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

        return;
    }

    try {
        const parsedUrl = new URL(url);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        window.alert("Please enter an HTTP or HTTPS URL.");
        return;
        }
    } catch {
        window.alert("Please enter a valid URL.");
        return;
    }

    currentEditor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }


  return (
    <div
      className={`blog-editor-shell ${
        error ? "has-error" : ""
      } ${disabled ? "is-disabled" : ""}`}
    >
      {/* Simple formatting toolbar */}
      <div className="blog-editor-toolbar">
        <div className="blog-editor-toolbar-group">
          <ToolbarButton
            label="Bold"
            icon={<Bold size={17} />}
            active={editor.isActive("bold")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />

          <ToolbarButton
            label="Italic"
            icon={<Italic size={17} />}
            active={editor.isActive("italic")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />

          <ToolbarButton
            label="Underline"
            icon={<UnderlineIcon size={17} />}
            active={editor.isActive("underline")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />

          <ToolbarButton
            label="Strikethrough"
            icon={<Strikethrough size={17} />}
            active={editor.isActive("strike")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
        </div>

        <span className="blog-editor-toolbar-divider" />

        <div className="blog-editor-toolbar-group">
          <ToolbarButton
            label="Heading 2"
            icon={<Heading2 size={18} />}
            active={editor.isActive("heading", { level: 2 })}
            disabled={disabled}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />

          <ToolbarButton
            label="Heading 3"
            icon={<Heading3 size={18} />}
            active={editor.isActive("heading", { level: 3 })}
            disabled={disabled}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          />
        </div>

        <span className="blog-editor-toolbar-divider" />

        <div className="blog-editor-toolbar-group">
          <ToolbarButton
            label="Bullet list"
            icon={<List size={18} />}
            active={editor.isActive("bulletList")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />

          <ToolbarButton
            label="Numbered list"
            icon={<ListOrdered size={18} />}
            active={editor.isActive("orderedList")}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />

          <ToolbarButton
            label="Add or edit link"
            icon={<Link2 size={17} />}
            active={editor.isActive("link")}
            disabled={disabled}
            onClick={addLink}
          />
        </div>

        <div className="blog-editor-toolbar-history">
          <ToolbarButton
            label="Undo"
            icon={<Undo2 size={17} />}
            disabled={disabled || !editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          />

          <ToolbarButton
            label="Redo"
            icon={<Redo2 size={17} />}
            disabled={disabled || !editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          />
        </div>
      </div>

      {/* Formatted article area */}
      <div className="blog-content-editor">
        <EditorContent editor={editor} />
      </div>

      <div className="blog-editor-footer">
        <p>Write and format your article here.</p>
        <p>
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </p>
      </div>

      {error && (
        <p className="blog-editor-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
