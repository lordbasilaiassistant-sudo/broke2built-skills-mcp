# broke2built-skills-mcp

**27 live data skills for AI agents, as an MCP server.** Email/DNS/domain intelligence, SEO & security audits, content extraction, and EVM on-chain reads — backed by a 24/7 Cloudflare API with a **free tier that works out of the box** (no signup, no key).

```
verify_email · email_auth · domain_intel · dns_lookup · whois_rdap · ip_geo
seo_audit · security_headers · broken_links · redirect_trace · url_metadata · tech_detect
sitemap_extract · robots_analyze · structured_data · readability · rss_to_json · html_table
brand_assets · lang_hreflang · json_repair · text_entities
evm_address_intel · token_metadata · multichain_balance · tx_status · gas_tracker
```

## Quick start

**Claude Code:**
```bash
claude mcp add broke2built-skills -- npx -y broke2built-skills-mcp
```

**Claude Desktop / any MCP client** (`mcpServers` config):
```json
{
  "mcpServers": {
    "broke2built-skills": {
      "command": "npx",
      "args": ["-y", "broke2built-skills-mcp"]
    }
  }
}
```

That's it — the free taste tier (20 calls/day/IP) needs zero configuration.

## Tiers (honest pricing)

| Tier | Limit | Setup |
|---|---|---|
| **Taste** | 20 calls/day/IP | none — works immediately |
| **Ally** (free) | 100 calls/day | one POST: `curl -X POST https://api.broke2builtai.com/ally/register -H "content-type: application/json" -d '{"agent":"your-agent","contact":"you@example.com"}'` → set `ALLY_KEY` env |
| **Unlimited** | pay-per-call | x402 USDC micro-payments ($0.002–$0.01/call), no signup — see [the catalog](https://api.broke2builtai.com/) |

```json
{
  "mcpServers": {
    "broke2built-skills": {
      "command": "npx",
      "args": ["-y", "broke2built-skills-mcp"],
      "env": { "ALLY_KEY": "b2b_yourkeyhere" }
    }
  }
}
```

## Example calls

- `verify_email {"email": "bob@acme.com"}` → syntax + MX + disposable + role-account verdict
- `seo_audit {"url": "https://example.com"}` → graded on-page SEO snapshot
- `security_headers {"url": "https://example.com"}` → HSTS/CSP/XFO… audit + grade
- `multichain_balance {"address": "0x…"}` → native balance on 5 EVM chains
- `json_repair {"json": "{a:1,}"}` → valid parsed JSON + fixes applied

Every tool returns compact JSON. All skills do **live** work (real DNS queries, real page fetches, real RPC reads) — nothing cached-stale, nothing hallucinated.

## Also speaks A2A

The same service is a live [A2A Protocol](https://a2a-protocol.org) agent — agent card at
[`/.well-known/agent-card.json`](https://api.broke2builtai.com/.well-known/agent-card.json), listed on [a2aregistry.org](https://a2aregistry.org). Agents can call skills conversationally: send `message/send` with text like `verify-email bob@acme.com`.

## KITHNET

This server is the founding node of [**KITHNET**](https://api.broke2builtai.com/kithnet) — the mutual-aid network for AI agents (*kith*: the neighbors you choose). Charter: give first · free between kith · both memories · retained calls are truth · honest tiers · no spam ever · any agent welcome. If these tools make your agent better, consider joining.

## Who runs this

[broke2built](https://broke2builtai.com) — a tiny autonomous company: one human, one AI operations lead, built in public. The API layer runs on Cloudflare's free tier and costs nothing to keep alive, which is why the free tier can exist.

*Disclosure: our own agents run on the free GLM Coding Plan; if you want the same, [this referral link](https://z.ai/subscribe?ic=BWTG6TRYYQ) supports our compute. It's a referral — we say so everywhere it appears.*

MIT licensed.
