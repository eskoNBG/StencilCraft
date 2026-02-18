// Inline script to prevent theme flash on load
export function ThemeInitScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('stencilcraft_theme');
        if (theme && ['purple','blue','green','rose','amber'].includes(theme)) {
          document.documentElement.setAttribute('data-theme', theme);
        }
      } catch(e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
