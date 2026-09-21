import fs from "node:fs"
import path from "node:path"

function replacePlaceholders(content) {
  const icons = new Set()
  const replaced = content.replace(
    /<IconPlaceholder\s+([\s\S]*?)\/>/g,
    (_m, inner) => {
      const tabler = inner.match(/tabler="([^"]+)"/)?.[1]
      if (!tabler) throw new Error("no tabler in " + inner)
      icons.add(tabler)
      const className = inner.match(/className="([^"]*)"/)?.[1]
      const classAttr = className ? ` className="${className}"` : ""
      return `<${tabler}${classAttr} />`
    },
  )
  return { replaced, icons: [...icons] }
}

function transform(content) {
  let next = content
    .replaceAll("@/registry/base-rhea/ui/", "@/components/ui/")
    .replaceAll("@/registry/base-rhea/hooks/", "@/hooks/")
  const { replaced, icons } = replacePlaceholders(next)
  next = replaced.replace(
    /import \{ IconPlaceholder \} from "@\/app\/\(create\)\/components\/icon-placeholder"\n/,
    "",
  )
  if (icons.length) {
    const importLine = `import { ${icons.join(", ")} } from "@tabler/icons-react"\n`
    if (next.includes('from "cn"\n\n')) {
      next = next.replace(/from "cn"\n\n/, `from "cn"\n\n${importLine}\n`)
    } else if (next.startsWith('"use client"')) {
      next = next.replace('"use client"\n\n', `"use client"\n\n${importLine}\n`)
    } else {
      next = importLine + "\n" + next
    }
  }
  return next
}

const dir = "tmp-shadcn"
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".json")) continue
  const json = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"))
  const src = json.files[0].content
  const out = transform(src)
  const dest = path.join("components/ui", file.replace(".json", ".tsx"))
  fs.writeFileSync(dest, out)
  console.log("wrote", dest, out.length)
}
