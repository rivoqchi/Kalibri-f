import fs from "node:fs"

const files = [
  "node_modules/next-themes/dist/index.mjs",
  "node_modules/next-themes/dist/index.js",
]

for (const file of files) {
  let source = fs.readFileSync(file, "utf8")
  const before = source

  // Never render ThemeScript via React (SSR+client) — layout injects via next/script
  source = source.replace(
    /_=t\.memo\(\(\{forcedTheme:e,storageKey:i,attribute:s,enableSystem:u,enableColorScheme:m,defaultTheme:a,value:l,themes:h,nonce:d,scriptProps:w\}\)=>\{(?:if\(typeof window!=="undefined"\)return null;)?let p=JSON\.stringify/,
    '_=t.memo(({forcedTheme:e,storageKey:i,attribute:s,enableSystem:u,enableColorScheme:m,defaultTheme:a,value:l,themes:h,nonce:d,scriptProps:w})=>{return null;let p=JSON.stringify',
  )

  source = source.replace(
    /Y=t\.memo\(\(\{forcedTheme:e,storageKey:s,attribute:n,enableSystem:l,enableColorScheme:o,defaultTheme:d,value:u,themes:h,nonce:m,scriptProps:w\}\)=>\{(?:if\(typeof window!=="undefined"\)return null;)?let p=JSON\.stringify/,
    'Y=t.memo(({forcedTheme:e,storageKey:s,attribute:n,enableSystem:l,enableColorScheme:o,defaultTheme:d,value:u,themes:h,nonce:m,scriptProps:w})=>{return null;let p=JSON.stringify',
  )

  if (source === before) {
    console.error("NO_CHANGE", file)
    process.exitCode = 1
    continue
  }

  fs.writeFileSync(file, source)
  console.log("PATCHED", file)
}
