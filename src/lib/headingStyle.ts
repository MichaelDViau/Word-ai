import Heading from "@tiptap/extension-heading";

/**
 * Extends TipTap's Heading node with a `displayStyle` attribute so we can
 * distinguish a document "Title" (H1 + data-style="title") and "Subtitle"
 * (H2 + data-style="subtitle") from regular headings — matching the block
 * style menu in the toolbar. The attribute renders as `data-style` and is
 * targeted by CSS in globals.css.
 */
export const HeadingWithStyle = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      displayStyle: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-style"),
        renderHTML: (attributes) => {
          if (!attributes.displayStyle) return {};
          return { "data-style": attributes.displayStyle };
        },
      },
    };
  },
});
