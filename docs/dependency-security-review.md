# 询价启用前依赖安全评估 — 2026-11-06

这是版本公告与当前代码可达性的核对，不是渗透测试或“零风险”保证。所有线上发送、真实邮件、提交、推送和部署仍未获本轮授权。

## 当前发布候选与历史比较

- 原始锁文件：41 项（1 严重、20 高危、15 中危、5 低危）。
- 历史 Astro 5 阶段：兼容范围更新后仍有 16 项（1 严重、6 高危、6 中危、3 低危）。下面逐项表格和 Astro 5 清单保留为历史记录，不代表当前版本。
- 当前主工作区：已按用户授权整合此前测试的 Astro 7.4.7 候选、锁文件与 `compressHTML: true`。整合前逐文件核对，除三个升级文件和无关的 `Thumbs.db` 外，两个工作区的询价修复与业务源文件一致；整合没有覆盖既有修复。
- 最终 `pnpm audit --json`：1 项低危，0 严重 / 高危 / 中危。审计命令因这项低危返回非零，不能表述为零漏洞。未使用 `audit fix --force` 或跨版本 overrides。
- 原隔离候选使用 `/private/tmp/kaiyu-astro7-security` 作对照；临时目录不作为持久备份。6 November 评审结束时尚未提交、推送或部署。用户于 9 November 批准仅发布 Phase 1，询价保持关闭；同日复核审计仍为 1 项低危。
- Function 仅导入 src/lib/enquiry.js 并使用 Web 标准 API，以上 Astro 工具链依赖没有被导入 Function。前端打包也没有引入这些服务端工具。无不可信构建内容、CMS、文件上传、SSR 或在线图片优化。

## 每一项原始严重／高危公告

“已消除”指锁定版本不再被审计命中；“当前不可达”是基于现有代码结构的判断，不能用来永久忽略漏洞。

| 公告 | 原依赖版本 | 等级 | 易受影响功能 | 公告修复版本 | Astro 5 阶段处理（历史） | 当前可达性判断 |
|---|---|---|---|---|---|---|
| [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj) | sharp 0.34.5 | high | sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591 | >=0.35.0 | 0.34.5；仍存在；补丁跨主/次版本边界，未强制覆盖 | 构建工具的可选图片处理依赖；网站直接使用已存储的 JPEG/WebP，没有用户上传或实时优化接口。不得处理不可信 AVIF/SVG 来验证此问题。 |
| [GHSA-5p4m-2wfm-xmqj](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) | js-yaml 4.3.0 | high | JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported | >=4.3.1 | 4.3.2；兼容范围更新已消除 | 构建阶段 YAML 解析；当前输入来自仓库，不接受访客 YAML。Function 不加载它。 |
| [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) | nanoid 3.3.15 | high | nanoid: non-secure generators can loop indefinitely with negative size | >=3.3.16 | 3.3.20；兼容范围更新已消除 | 构建工具 ID 生成；不存在访问者可控制的 size 调用。Function 使用 crypto.randomUUID。 |
| [GHSA-2pvr-wf23-7pc7](https://github.com/advisories/GHSA-2pvr-wf23-7pc7) | astro 5.18.2 | high | Astro: Host header SSRF in prerendered error page fetch | >=6.4.6 | 5.18.2；仍存在；补丁跨主/次版本边界，未强制覆盖 | 当前静态部署没有 Astro SSR、用户控制的 slot/属性或实时图片优化；Function 不加载 Astro。攻击者提交的 AVIF 不会进入当前构建流程。未来接入不可信构建内容或 SSR 时需重新评估。 |
| [GHSA-8hv8-536x-4wqp](https://github.com/advisories/GHSA-8hv8-536x-4wqp) | astro 5.18.2 | high | Astro: Reflected XSS via unescaped slot name | >=6.3.3 | 5.18.2；仍存在；补丁跨主/次版本边界，未强制覆盖 | 当前静态部署没有 Astro SSR、用户控制的 slot/属性或实时图片优化；Function 不加载 Astro。攻击者提交的 AVIF 不会进入当前构建流程。未来接入不可信构建内容或 SSR 时需重新评估。 |
| [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8) | nanoid 3.3.15 | high | nanoid: custom generators can loop indefinitely when size is zero | >=3.3.18 | 3.3.20；兼容范围更新已消除 | 构建工具 ID 生成；不存在访问者可控制的 size 调用。Function 使用 crypto.randomUUID。 |
| [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) | postcss 8.5.16 | high | PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure | >=8.5.18 | 8.5.32；兼容范围更新已消除 | 构建阶段 CSS/sourceMappingURL 处理；未接收用户 CSS。Function 不加载它。 |
| [GHSA-2p49-hgcm-8545](https://github.com/advisories/GHSA-2p49-hgcm-8545) | svgo 4.0.1 | high | SVGO removeScripts plugin leaves some executable scripts intact | >=4.0.2 | 4.1.0；兼容范围更新已消除 | 构建阶段 SVG 优化/清理；仓库 SVG 为自有静态资产，未将 SVGO 用作上传文件的安全过滤器。 |
| [GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2) | astro 5.18.2 | critical | Astro: Remote code execution through AVIF image optimization | >=7.2.8 | 5.18.2；仍存在；补丁跨主/次版本边界，未强制覆盖 | 当前静态部署没有 Astro SSR、用户控制的 slot/属性或实时图片优化；Function 不加载 Astro。攻击者提交的 AVIF 不会进入当前构建流程。未来接入不可信构建内容或 SSR 时需重新评估。 |
| [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c) | sharp 0.34.5 | high | sharp: Vulnerabilities in libheif: GHSA-g89c-p67h-r497 and GHSA-2jg2-4ch7-h545 | >=0.35.4 | 0.34.5；仍存在；补丁跨主/次版本边界，未强制覆盖 | 构建工具的可选图片处理依赖；网站直接使用已存储的 JPEG/WebP，没有用户上传或实时优化接口。不得处理不可信 AVIF/SVG 来验证此问题。 |
| [GHSA-2883-xcg3-v3hh](https://github.com/advisories/GHSA-2883-xcg3-v3hh) | js-yaml 4.3.0 | high | js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources | >=4.3.2 | 4.3.2；兼容范围更新已消除 | 构建阶段 YAML 解析；当前输入来自仓库，不接受访客 YAML。Function 不加载它。 |
| [GHSA-7w5x-hrqm-74c2](https://github.com/advisories/GHSA-7w5x-hrqm-74c2) | smol-toml 1.7.0 | high | smol-toml: Denial of Service via malformed TOML documents | >=1.7.1 | 1.9.1；兼容范围更新已消除 | 构建配置解析；不接受访客 TOML，Function 不加载它。 |
| [GHSA-j22f-vq7h-c4qm](https://github.com/advisories/GHSA-j22f-vq7h-c4qm) | devalue 5.8.1 | high | devalue: `stringify`/`uneval` serialize shared memory | >=5.9.3 | 5.9.4；兼容范围更新已消除 | Astro 序列化工具；没有 SSR/server islands 或外部对象序列化，询价只使用有长度限制的 JSON 字段。 |
| [GHSA-mcm9-63f2-9j32](https://github.com/advisories/GHSA-mcm9-63f2-9j32) | devalue 5.8.1 | high | devalue: Repeated primitive strings cause quadratic expansion in uneval | >=5.9.3 | 5.9.4；兼容范围更新已消除 | Astro 序列化工具；没有 SSR/server islands 或外部对象序列化，询价只使用有长度限制的 JSON 字段。 |
| [GHSA-x5rw-q4pp-hg5g](https://github.com/advisories/GHSA-x5rw-q4pp-hg5g) | devalue 5.8.1 | high | devalue: stringifyAsync can cause an unhandled rejection despite a caught returned promise | >=5.9.3 | 5.9.4；兼容范围更新已消除 | Astro 序列化工具；没有 SSR/server islands 或外部对象序列化，询价只使用有长度限制的 JSON 字段。 |
| [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | source-map-js 1.2.1 | high | source-map-js allows event-loop denial of service through indexed source-map section offsets | >=1.2.2 | 1.2.2；兼容范围更新已消除 | 构建工具 source map 解析；没有公开 source-map 解析接口，Function 不加载它。 |
| [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w) | sharp 0.34.5 | high | sharp : Vulnerability in librsvg dependency CVE-2026-96889 | >=0.35.5 | 0.34.5；仍存在；补丁跨主/次版本边界，未强制覆盖 | 构建工具的可选图片处理依赖；网站直接使用已存储的 JPEG/WebP，没有用户上传或实时优化接口。不得处理不可信 AVIF/SVG 来验证此问题。 |
| [GHSA-r9w8-h9r3-54w4](https://github.com/advisories/GHSA-r9w8-h9r3-54w4) | devalue 5.8.1 | high | devalue: Custom ArrayBuffer revivers can bypass typed-array allocation validation | >=5.9.3 | 5.9.4；兼容范围更新已消除 | Astro 序列化工具；没有 SSR/server islands 或外部对象序列化，询价只使用有长度限制的 JSON 字段。 |
| [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) | vite 6.4.3 | high | launch-editor: `fs.existsSync()` existence check can be bypassed on Windows | >=6.4.4 | 6.4.5；兼容范围更新已消除 | 开发服务器/编辑器启动功能；生产为静态文件，没有 Vite 服务。当前开发为 macOS，非该 Windows 攻击条件。 |
| [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) | zod 3.25.76 | high | Zod can exhaust memory while validating oversized constrained collections | >=4.6.6 | 3.25.76；仍存在；补丁跨主/次版本边界，未强制覆盖 | Astro 的配置/构建依赖；询价校验使用自有代码，Function 不加载 Zod，访问者不能传入集合 schema。 |
| [GHSA-w27v-7q3p-w38r](https://github.com/advisories/GHSA-w27v-7q3p-w38r) | svgo 4.0.1 | high | SVGO: removeScripts allows executable links through namespace and control-character bypasses | >=4.1.0 | 4.1.0；兼容范围更新已消除 | 构建阶段 SVG 优化/清理；仓库 SVG 为自有静态资产，未将 SVGO 用作上传文件的安全过滤器。 |

## Astro 5 阶段剩余完整清单（历史，已被 Astro 7 候选取代）

- GHSA-j687-52p2-xcff: astro 5.18.2 — moderate — Astro: XSS in define:vars via incomplete </script> tag sanitization
- GHSA-xr5h-phrj-8vxv: astro 5.18.2 — low — Astro: Server island encrypted parameters vulnerable to cross-component replay
- GHSA-g7r4-m6w7-qqqr: esbuild 0.27.7 — low — esbuild allows arbitrary file read when running the development server on Windows
- GHSA-jrpj-wcv7-9fh9: astro 5.18.2 — moderate — Astro: XSS via Unescaped Attribute Names in Spread Props
- GHSA-f88m-g3jw-g9cj: sharp 0.34.5 — high — sharp inherited vulnerabilities in libvips: CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591
- GHSA-f48w-9m4c-m7f5: astro 5.18.2 — moderate — Astro: XSS via unescaped spread attribute names in renderHTMLElement (incomplete fix for CVE-2026-54298)
- GHSA-7pw4-f3q4-r2p2: astro 5.18.2 — low — Astro: Cross-site scripting via unescaped transition:* directive values on hydrated islands
- GHSA-4g3v-8h47-v7g6: astro 5.18.2 — moderate — Astro: Reflected XSS via unescaped View Transition animation properties
- GHSA-2pvr-wf23-7pc7: astro 5.18.2 — high — Astro: Host header SSRF in prerendered error page fetch
- GHSA-8hv8-536x-4wqp: astro 5.18.2 — high — Astro: Reflected XSS via unescaped slot name
- GHSA-26w7-cxv4-gfx2: astro 5.18.2 — critical — Astro: Remote code execution through AVIF image optimization
- GHSA-376h-93r7-7g6f: astro 5.18.2 — moderate — Astro: Authorization bypass from missing path-segment boundary check when stripping the configured base
- GHSA-rgj7-g3m4-5g8c: sharp 0.34.5 — high — sharp: Vulnerabilities in libheif: GHSA-g89c-p67h-r497 and GHSA-2jg2-4ch7-h545
- GHSA-wq5f-xc86-pv6w: sharp 0.34.5 — high — sharp : Vulnerability in librsvg dependency CVE-2026-96889
- GHSA-98hj-9722-w3j8: astro 5.18.2 — moderate — Astro: Reflected/Stored XSS via unescaped <script>/<style> tag content in JSX/MDX rendering
- GHSA-mrhx-c7xc-m3w5: zod 3.25.76 — high — Zod can exhaust memory while validating oversized constrained collections

## 整合后的升级兼容性

已对照 Astro 6、7 迁移文档：项目没有 adapter、框架集成、Markdown 插件、内容集合、Astro DB、server islands、transitions 或自定义 Vite 插件。保留 static 输出、路由、原图与业务文案。Astro 7 新的默认空白规则通过 compressHTML: true 保持旧行为，避免行内文字粘连。没有添加依赖覆盖规则。

Astro 7.4.7 要求 Node >=22.23.4；本地使用 Node 24.22.1 验证。主项目新增 `.node-version` 固定 24.22.1，并在 package.json 声明最低版本。用户确认现有 Pages 为 V3、构建命令 pnpm run build、输出 dist、生产分支 main，变量列表没有显示 NODE_VERSION。Cloudflare 官方 V3 文档列出的默认 Node 22.23.4 已满足最低要求，且支持 .node-version；没有改动 Dashboard。实际远程构建日志仍须在获批部署时核对，不能把本地通过称作已经通过 Cloudflare 构建。pnpm-workspace.yaml 保留原有构建脚本许可。

剩余低危：esbuild 0.27.7（Vite 可选依赖），GHSA-g7r4-m6w7-qqqr，修复版本 >=0.28.1，涉及 Windows 上的 esbuild 开发服务器文件读取。当前 macOS 本地构建、Cloudflare 静态托管与无依赖 Function 不满足该触发条件。未强制跨 0.x 次版本替换 Vite 的依赖；后续跟随上游兼容修复。

主工作区双模式生产构建、68 项模拟测试、构建验证和 54 组页面 / 视口检查通过。另用 pnpm 10.11.1 在独立副本冻结安装、执行 68 项测试和双模式构建，确认 Pages V3 默认包管理器兼容；该版本提示忽略 esbuild 安装脚本，但平台包仍能正常构建。Wrangler 4.158.0 编译了现有 Function，并在本地 Workers 运行时以独立本地 KV 验证两个 API 路径的关闭行为。发布与回滚步骤见 contact-integration.md。公开产物模式与虚拟标记扫描不等同于知道真实密钥后逐值扫描；没有读取真实密钥。

参考：[Astro 6 迁移](https://docs.astro.build/en/guides/upgrade-to/v6/)、[Astro 7 迁移](https://docs.astro.build/en/guides/upgrade-to/v7/)、各行公告链接。
