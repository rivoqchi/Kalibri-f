/**
 * Mirrors next-themes FOUC bootstrap (attribute=class, storageKey=theme,
 * defaultTheme=light, enableSystem=false, enableColorScheme=true).
 * Injected via next/script — not via React createElement("script").
 */
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement,k="theme",t=localStorage.getItem(k)||"light";d.classList.remove("light","dark");d.classList.add(t==="dark"?"dark":"light");d.style.colorScheme=t==="dark"?"dark":"light"}catch(e){}})();`
