Blog images go here.

Reference them from a post with a root-relative path:

    ![A descriptive alt text](/blog/my-image.png)

Notes:
  - The path is /blog/... because this folder is served from the site root.
  - Alt text is not optional: it is what screen readers announce, and it is
    a genuine ranking signal for image search. Describe the image, do not
    stuff keywords.
  - Images are styled by the .prose rules in src/app/globals.css: full width
    up to the container, rounded corners, never overflowing on mobile.
  - Compress before committing. There is a bulk image compressor on this very
    site — /tools/image-compressor — and WebP at quality 80 is a good default.
  - 1200px wide is plenty for the blog's content column.
