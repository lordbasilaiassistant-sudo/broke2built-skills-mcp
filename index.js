#!/usr/bin/env node
// broke2built-skills-mcp — MCP server exposing 27 live data skills for AI agents.
// Backed by https://api.broke2builtai.com (Cloudflare, 24/7). Free tier works out of the box:
// no key → 20 calls/day/IP taste quota. Set ALLY_KEY for 100 free calls/day (register free:
// POST https://api.broke2builtai.com/ally/register). Unlimited via x402 USDC — see /.
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const BASE = process.env.BROKE2BUILT_BASE || 'https://api.broke2builtai.com';
const ALLY_KEY = process.env.ALLY_KEY || '';

// Skill registry — mirrors the live catalog at GET https://api.broke2builtai.com/
// (id, query param, description). The server proxies each as an MCP tool.
const SKILLS = [
  ['verify-email', 'email', 'Live email verification: syntax + MX + disposable + role-account.'],
  ['email-auth', 'domain', 'Email authentication audit: SPF, DMARC, DKIM (common selectors) + spoofability verdict.'],
  ['domain-intel', 'domain', 'Domain intelligence: mail provider + deliverability + tech stack + metadata + signals.'],
  ['dns-lookup', 'domain', 'All-in-one DNS: A, AAAA, MX, TXT, NS, CNAME, CAA records in one call.'],
  ['whois-rdap', 'domain', 'Domain registration intel via RDAP: created/expires, age, registrar, status, nameservers.'],
  ['ip-geo', 'domain', 'Resolve a domain/host to its IP and return geolocation + ASN/ISP + hosting org.'],
  ['seo-audit', 'url', 'On-page SEO snapshot: title/meta, H1 count, canonical, OpenGraph, image-alt coverage + graded issues.'],
  ['security-headers', 'url', 'HTTP security-header audit (HSTS, CSP, X-Frame, X-Content-Type, Referrer-Policy…) + grade.'],
  ['broken-links', 'url', 'Fetch a page, extract links, HEAD-check each — report every broken/dead link with status.'],
  ['redirect-trace', 'url', 'Trace the full redirect chain for a URL — every hop, status, final destination.'],
  ['url-metadata', 'url', 'Page metadata: title, description, canonical, OpenGraph, Twitter card, favicon, lang.'],
  ['tech-detect', 'url', 'Tech-stack fingerprint: CDN, server, framework/CMS, analytics, payment + hosting signals.'],
  ['sitemap-extract', 'domain', "Find + parse a site's sitemap → list of URLs with count (follows sitemap-index)."],
  ['robots-analyze', 'domain', 'Parse robots.txt: per-user-agent rules, declared sitemaps, path crawlability.'],
  ['structured-data', 'url', 'Extract JSON-LD / schema.org structured data — @types present + parsed objects.'],
  ['readability', 'url', 'Extract the main article text (strips nav/ads/boilerplate) + word count + reading time.'],
  ['rss-to-json', 'url', 'Fetch an RSS/Atom feed and return clean JSON (title, link, date, summary per item).'],
  ['html-table', 'url', 'Extract HTML tables from a page as clean JSON (headers mapped to row objects).'],
  ['brand-assets', 'url', "Extract a site's brand assets: favicon, apple-touch-icon, og:image, theme-color, icons."],
  ['lang-hreflang', 'url', "Detect a page's language + charset + hreflang alternate-language versions."],
  ['json-repair', 'json', 'Repair broken/malformed JSON (esp. truncated LLM output) into valid parsed JSON.'],
  ['text-entities', 'text', 'Extract entities from text: emails, URLs, IPs, phones, dates, hashtags, mentions, money.'],
  ['evm-address-intel', 'address', 'EVM address intel: contract vs wallet (EOA), bytecode size, native balance. ?chain=eth|base|arbitrum|optimism|polygon.'],
  ['token-metadata', 'address', 'ERC-20 token metadata on-chain: name, symbol, decimals, total supply. ?chain=…'],
  ['multichain-balance', 'address', 'Native balance for one address across 5 EVM chains in one call.'],
  ['tx-status', 'hash', 'EVM transaction status: success/failed, block, confirmations, from/to, gas used. ?chain=…'],
  ['gas-tracker', 'chain', 'Live gas price in gwei for EVM chains (eth|base|arbitrum|optimism|polygon|all).'],
  ['source-verify', 'url', 'Verify a cited source URL: live status + final URL + title + whether the domain is an OFFICIAL publisher (curated EU/BE/NL legal-source list + official-TLD heuristics).'],
  ['vies-check', 'vat', 'Verify an EU VAT number against the official EC VIES registry: valid?, registered name + address. e.g. vat=BE0403170701.'],
];

const server = new Server({ name: 'broke2built-skills', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: SKILLS.map(([id, param, desc]) => ({
    name: id.replace(/-/g, '_'),
    description: desc + (ALLY_KEY ? '' : ' (free taste tier: 20 calls/day/IP — set ALLY_KEY env for 100/day free)'),
    inputSchema: {
      type: 'object',
      properties: {
        [param]: { type: 'string', description: `The ${param} to analyze` },
        ...(/evm|token|multichain|tx|gas/.test(id) ? { chain: { type: 'string', description: 'eth|base|arbitrum|optimism|polygon (or "all" for gas-tracker)' } } : {}),
      },
      required: [param],
    },
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const id = req.params.name.replace(/_/g, '-');
  const skill = SKILLS.find(([s]) => s === id);
  if (!skill) return { content: [{ type: 'text', text: JSON.stringify({ error: 'unknown tool: ' + id }) }], isError: true };
  const args = req.params.arguments || {};
  const qs = new URLSearchParams();
  qs.set(skill[1], String(args[skill[1]] ?? ''));
  if (args.chain) qs.set('chain', String(args.chain));
  if (!ALLY_KEY) qs.set('free', '1'); // keyless taste tier
  try {
    const r = await fetch(`${BASE}/${id}?${qs}`, { headers: ALLY_KEY ? { 'X-Ally-Key': ALLY_KEY } : {}, signal: AbortSignal.timeout(30000) });
    const text = await r.text();
    return { content: [{ type: 'text', text }], isError: r.status >= 400 };
  } catch (e) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: String(e.message || e) }) }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('broke2built-skills-mcp ready — ' + SKILLS.length + ' tools, base ' + BASE + (ALLY_KEY ? ' (ally tier)' : ' (free taste tier)'));
