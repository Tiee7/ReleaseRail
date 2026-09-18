# ReleaseRail

<img src="assets/rr-logo.png" alt="ReleaseRail logo" width="96" />

> **Projects can announce rewards. ReleaseRail helps them prove they paid.**<br />
> **项目方可以宣布奖励，ReleaseRail 帮助他们证明自己确实支付过。**

ReleaseRail is a public settlement layer for digital contribution. It connects verified GitHub work, deterministic reward policy, human approval, controlled KeeperHub execution, and independently verifiable onchain payment evidence.

ReleaseRail 是面向数字贡献的公开结算层。它把经过验证的 GitHub 贡献、确定性奖励规则、人工确认、KeeperHub 受控执行和可独立验证的链上支付证据连接起来。

The main-track artifact is this standalone repository. It runs beside the live [Tiee7/EzDSH](https://github.com/Tiee7/EzDSH) project through MCP and does not modify the EzDSH source repository or the HackthonSniper research repository.

主赛产物是本独立仓库。它通过 MCP 运行在真实的 [Tiee7/EzDSH](https://github.com/Tiee7/EzDSH) 项目旁边，不修改 EzDSH 源码仓库，也不属于 HackthonSniper 研究仓库。

## Why this matters / 为什么需要它

### Reward announcements are easy. Payment proof is rare.

### 奖励承诺很容易，支付证明却很少

Open-source and AI collaboration are creating real digital labor every day. A contribution may be recorded in GitHub, a reward policy may live in a document, and the final payment may happen through a private transfer or a screenshot.

开源和 AI 协作每天都在产生真实的数字劳动。贡献可能记录在 GitHub，奖励规则可能写在文档里，而最终支付却停留在私下转账或零散截图中。

That makes it difficult for outsiders to distinguish projects that genuinely compensate contributors from projects that only advertise rewards. It also gives honest projects no durable, public way to build payment credibility.

这让外部参与者难以区分哪些项目真正为贡献者支付过报酬，哪些项目只是宣传奖励。同时，诚实的项目方也缺少一种持久、公开的方式来积累自己的支付信用。

ReleaseRail is built around a simple principle:

ReleaseRail 建立在一个简单原则之上：

> **A project should be able to prove that a real contribution led to a real, rule-bound, verifiable payment.**<br />
> **项目方应该能够证明：真实贡献确实按照明确规则产生了真实、可验证的支付。**

This is not a promise of future rewards. It is public evidence of what a project has actually paid.

这不是对未来奖励的承诺，而是对项目过去实际支付行为的公开证明。

## The product / 产品定位

ReleaseRail is an **evidence-to-settlement rail** for open collaboration:

ReleaseRail 是面向开放协作的 **“贡献证据到价值结算”轨道**：

```text
Verified contribution
        ↓
Deterministic reward policy
        ↓
Human-approved payout intent
        ↓
KeeperHub simulation and execution
        ↓
Independent receipt verification
        ↓
Public payment proof
```

```text
验证贡献
        ↓
确定性奖励规则
        ↓
人工确认的支付意图
        ↓
KeeperHub 模拟与执行
        ↓
独立的链上 receipt 验证
        ↓
公开支付证明
```

ReleaseRail is not a wallet, a generic payroll system, or an autonomous agent that invents payment decisions. It is the deterministic boundary between an agent's discovery and an irreversible financial action.

ReleaseRail 不是钱包、通用工资系统，也不是可以自行猜测支付决定的自治 Agent。它负责的是 Agent 的发现能力与不可逆资金动作之间的确定性边界。

## What it proves / 它证明什么

| Layer | English | 中文 |
| --- | --- | --- |
| Contribution | The commit is attributed to the expected contributor and is reachable from the named release. | 指定 commit 属于预期贡献者，并且确实进入指定 Release。 |
| Policy | Recipient, amount, chain, asset, and policy version are explicit and allowlisted. | 收款人、金额、链、资产和策略版本明确且受到白名单约束。 |
| Approval | A human approves the exact canonical payload hash before broadcast. | 人工在广播前确认完整的 canonical payload hash。 |
| Execution | KeeperHub is the only signing and broadcasting path; simulation happens first. | KeeperHub 是唯一签名和广播路径，执行前必须先模拟。 |
| Settlement | The receipt is checked independently against the expected chain, recipient, value, and status. | 独立检查 receipt 的网络、收款人、金额和成功状态。 |
| Public proof | A redacted proof connects contribution evidence, policy, execution identity, and transaction. | 脱敏 proof 将贡献证据、策略、执行身份和链上交易连接起来。 |

## Public payment credibility / 公开支付信用

Every settled payout can produce a redacted public record containing:

每笔完成结算的支付都可以产生一条脱敏公开记录，包括：

- project, release, and contribution commit / 项目、Release 和贡献 commit；
- contributor attribution / 贡献者归属；
- policy ID and policy version / 策略 ID 与策略版本；
- chain, asset, and amount / 链、资产与金额；
- KeeperHub execution ID / KeeperHub execution ID；
- transaction hash and explorer URL / 交易哈希与区块浏览器链接；
- independent receipt-verification result / 独立 receipt 验证结果。

The current repository demonstrates this public-proof path with a tracked redacted candidate record and a confirmed Base Sepolia transaction. The local web console is an operator and judge audit surface bound to `127.0.0.1`; it is not presented as a hosted public ledger by itself. A hosted public ledger or static index can be added as a deployment layer without changing the settlement core.

当前仓库通过已提交的脱敏 candidate 记录和已确认的 Base Sepolia 交易展示这条公开证明路径。当前 Web Console 是绑定在 `127.0.0.1` 上的操作员和评审审计界面，本身不被宣称为已托管的公共账本。未来可以在不改变结算核心的前提下，增加托管式公开账本或静态索引层。

## Verified demo evidence / 已验证演示证据

- Live project / 真实项目: [Tiee7/EzDSH](https://github.com/Tiee7/EzDSH)
- Release / 发布版本: [v1.8.1559](https://github.com/Tiee7/EzDSH/releases/tag/v1.8.1559)
- Contribution / 贡献 commit: [83d0e7a9e99cbb1ff0192502a7890d291c5b89e0](https://github.com/Tiee7/EzDSH/commit/83d0e7a9e99cbb1ff0192502a7890d291c5b89e0)
- Contributor / 贡献者: `Tiee7`
- Public candidate record / 公开 candidate 记录: [evidence/public-candidate.json](evidence/public-candidate.json)
- KeeperHub execution / KeeperHub 执行 ID: `oecytu85by4mzs145bcn5`
- Verified transaction / 已验证交易: [Base Sepolia transaction](https://sepolia.basescan.org/tx/0x8009dd6aefd6725418fec94e021c77c9570d58dd3f4c34e02cdcf7bea74f3c82)
- Replay result / 重复执行结果: the same settled intent reused the original execution identity; no second transfer was broadcast / 同一 settled intent 复用原执行身份，没有广播第二笔转账。

## Quick start / 快速开始

### Requirements / 环境要求

- Node.js 24 or newer / Node.js 24 或更高版本；
- pnpm / pnpm；
- a KeeperHub API key with access to the target organization / 具备目标组织权限的 KeeperHub API key；
- a supported testnet RPC, such as Base Sepolia / 支持的测试网 RPC，例如 Base Sepolia；
- a local policy with an exact allowlisted recipient / 本地策略文件和精确的收款地址白名单。

Install and validate the repository:

安装并验证仓库：

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm preflight
```

`preflight` checks readiness without printing credential values. It does not prove that an API key is valid, that the KeeperHub organization has permission, or that the spending account has enough testnet funds.

`preflight` 会在不打印凭据内容的情况下检查环境是否就绪。但它不会证明 API key 有效、KeeperHub 组织具备权限，或支付账户拥有足够测试网余额。

### Configure a local payout policy / 配置本地支付策略

Create the local policy from the credential-free example:

从不含凭据的示例创建本地策略：

```bash
cp integrations/ezdsh/payout-policy.example.json integrations/ezdsh/payout-policy.json
```

Example:

示例：

```json
{
  "policyId": "ezdsh-release-testnet",
  "policyVersion": "2026-09-16.1",
  "repository": "Tiee7/EzDSH",
  "chainId": 84532,
  "asset": "native",
  "maxAmountBaseUnits": "1000000000000000",
  "recipients": {
    "Tiee7": [
      "0x<allowlisted-address>"
    ]
  }
}
```

The contributor key comes from the GitHub evidence. The value is one or more exact EVM addresses allowed for that contributor. The real `payout-policy.json` is ignored by Git and must never contain private keys or API keys.

贡献者 key 来自 GitHub 证据，值是允许该贡献者收款的一个或多个精确 EVM 地址。真实的 `payout-policy.json` 已被 Git 忽略，不能包含私钥或 API key。

### Load credentials from the environment / 从环境变量加载凭据

```bash
export KEEPERHUB_API_KEY='<secret-value>'
export KEEPERHUB_BASE_URL='https://app.keeperhub.com/api'
export RELEASERAIL_RPC_URL='https://sepolia.base.org'
export RELEASERAIL_POLICY_FILE="$PWD/integrations/ezdsh/payout-policy.json"
```

Do not run `printenv`, commit environment files, paste secrets into prompts, or include them in screenshots, videos, JSON proof, or browser fields. `GITHUB_TOKEN` is optional for public GitHub reads and only changes API rate-limit capacity.

不要运行 `printenv`，不要提交环境文件，不要把 secret 粘贴到 Prompt，也不要让它们出现在截图、视频、JSON proof 或浏览器输入框中。`GITHUB_TOKEN` 对公开 GitHub 读取是可选的，只影响 API 速率限制能力。

## End-to-end CLI flow / CLI 完整流程

The core state machine is:

核心状态机是：

```text
prepared → approved → simulated → executing → settled
                                      └──────→ blocked
```

### 1. Verify a contribution / 验证贡献

```bash
pnpm cli candidate \
  --repository Tiee7/EzDSH \
  --tag v1.8.1559 \
  --contribution-commit <commit-sha> \
  --expected-contributor Tiee7
```

Inspect the release URL, commit URL, observed contributor, and `evidenceHash`. If the ancestry or attribution is ambiguous, stop before creating a payment intent.

检查 Release URL、commit URL、观察到的贡献者和 `evidenceHash`。如果 commit 归属或版本关系存在歧义，应在创建支付意图前停止。

### 2. Prepare a deterministic intent / 准备确定性支付意图

```bash
pnpm cli prepare \
  --candidate-id <candidate-id> \
  --policy-id ezdsh-release-testnet \
  --recipient-address <allowlisted-address> \
  --amount-base-units 1000000 \
  --reason 'Contribution shipped in EzDSH release'
```

This creates a local intent containing the contribution evidence, policy version, recipient, chain, asset, amount, reason, and `canonicalPayloadHash`. Preparation has no onchain side effect.

这一步会创建一个本地支付意图，其中包含贡献证据、策略版本、收款人、链、资产、金额、原因和 `canonicalPayloadHash`。准备阶段不会产生链上副作用。

### 3. Approve the exact hash and simulate / 确认精确哈希并模拟

```bash
pnpm cli approve \
  --intent-id <intent-id> \
  --expected-intent-hash <canonical-payload-hash>

pnpm cli simulate --intent-id <intent-id>
```

Approval must match the complete canonical hash. Simulation must pass before execution. A simulation failure or unknown outcome is a stop condition and must not be followed by `execute`.

人工确认必须与完整 canonical hash 精确匹配。只有模拟成功后才能执行。模拟失败或结果未知时必须停止，不能继续调用 `execute`。

### 4. Execute once through KeeperHub / 通过 KeeperHub 执行一次

```bash
pnpm cli execute \
  --intent-id <intent-id> \
  --expected-intent-hash <canonical-payload-hash>
```

KeeperHub is the only signing and broadcasting path. ReleaseRail does not import, store, or select a private key.

KeeperHub 是唯一的签名和广播路径。ReleaseRail 不导入、不存储，也不选择私钥。

If a request is accepted but confirmation is delayed, reuse the same intent ID and exact hash for reconciliation. Do not prepare a new payout and do not create a new idempotency identity.

如果请求已经被接受但链上确认延迟，应使用相同的 intent ID 和精确 hash 进行恢复。不要创建新的支付意图，也不要创建新的幂等身份。

### 5. Inspect the public proof / 检查公开 proof

```bash
pnpm cli proof --intent-id <intent-id>
```

The proof contains only an allowlisted public record: GitHub evidence, policy identity, canonical hash, KeeperHub execution identity, transaction information, and receipt verification. Treat `settled` plus `receiptVerified: true` as the completion condition. `executing` or `unknown` means reconcile later, not broadcast again.

Proof 只包含固定白名单中的公开记录：GitHub 证据、策略身份、canonical hash、KeeperHub 执行身份、交易信息和 receipt 验证结果。只有 `settled` 且 `receiptVerified: true` 才算完成。`executing` 或 `unknown` 表示稍后恢复，不表示可以再次广播。

## EzDSH MCP integration / EzDSH MCP 集成

Build the MCP server:

构建 MCP server：

```bash
pnpm build
```

Use [integrations/ezdsh/mcp-config.json](integrations/ezdsh/mcp-config.json) as the MCP configuration template. Set `RELEASERAIL_ROOT` to this checkout and provide credentials through the process environment. The configuration starts `node dist/mcp-server.js` over stdio.

使用 [integrations/ezdsh/mcp-config.json](integrations/ezdsh/mcp-config.json) 作为 MCP 配置模板。将 `RELEASERAIL_ROOT` 设置为当前仓库路径，并通过进程环境变量提供凭据。该配置通过 stdio 启动 `node dist/mcp-server.js`。

The six exposed MCP tools are:

当前暴露的六个 MCP 工具是：

| Tool | Purpose / 作用 |
| --- | --- |
| `release_candidate` | Verify a contribution is included in a named release / 验证贡献是否进入指定 Release |
| `prepare_payout` | Create a deterministic local intent / 创建确定性的本地支付意图 |
| `approve_payout` | Approve the exact canonical hash / 确认精确的 canonical hash |
| `simulate_payout` | Run KeeperHub simulation without broadcast / 执行 KeeperHub 模拟，不广播交易 |
| `execute_payout` | Execute idempotently and verify the receipt / 幂等执行并验证 receipt |
| `get_payout_proof` | Load the redacted public proof / 读取脱敏公开 proof |

See the bilingual [EzDSH demo prompt](integrations/ezdsh/demo-prompt.md) for the intended Agent sequence. The MCP adapter is intentionally thin; business rules remain in the shared ReleaseRail service used by both MCP and CLI.

完整的 Agent 调用顺序见双语 [EzDSH demo prompt](integrations/ezdsh/demo-prompt.md)。MCP adapter 保持轻量，业务规则集中在 ReleaseRail service 中，并由 MCP 和 CLI 共享。

## Local audit console / 本地审计控制台

After `pnpm build`, start the local console:

构建后启动本地控制台：

```bash
pnpm web
```

Open [http://127.0.0.1:4782](http://127.0.0.1:4782). It reads the same state and proof stores as the CLI/MCP service and shows release evidence, canonical hash, recipient, amount, KeeperHub execution identity, BaseScan link, and independent receipt verification.

打开 [http://127.0.0.1:4782](http://127.0.0.1:4782)。它读取与 CLI/MCP service 相同的状态和 proof 存储，展示 Release 证据、canonical hash、收款人、金额、KeeperHub 执行身份、BaseScan 链接和独立 receipt 验证结果。

The console is a local operator and judge surface. It binds to `127.0.0.1` by default, does not expose credentials to the browser, and gates state changes behind explicit confirmation. It is not a replacement for a future hosted public reward ledger.

该控制台是本地操作员和评审界面，默认绑定 `127.0.0.1`，不会向浏览器暴露凭据，并通过显式确认控制状态变化。它不是未来托管式公开奖励账本的替代品。

## Technical design / 技术实现

```text
EzDSH Agent / MCP client
          │
          ▼
Thin MCP and CLI adapters
          │
          ▼
ReleaseRail service and state machine
   ┌──────┼────────┬───────────────┐
   ▼      ▼        ▼               ▼
GitHub  Policy   Intent store   KeeperHub client
evidence gates   + canonical    simulate / execute
                 hash + replay  / poll
          │
          ▼
Independent Base Sepolia receipt verifier
          │
          ▼
Redacted proof store and public transaction evidence
```

Core responsibilities:

核心职责：

- `src/github`: public GitHub release and commit evidence / 读取公开 GitHub Release 与 commit 证据；
- `src/policy`: repository, recipient, chain, asset, and amount gates / 校验仓库、收款人、链、资产和金额边界；
- `src/domain`: typed contracts, canonical JSON, and stable IDs / 类型契约、canonical JSON 和稳定 ID；
- `src/intents`: atomic local state transitions and replay protection / 本地状态原子转换与重放保护；
- `src/keeperhub`: simulation, idempotent execution, polling, and redacted errors / 模拟、幂等执行、轮询和脱敏错误；
- `src/chain`: independent receipt verification against the configured RPC / 基于配置 RPC 独立验证 receipt；
- `src/proof`: fixed public-field proof bundles / 生成固定公开字段的 proof bundle；
- `src/mcp-server.ts` and `src/cli.ts`: transport adapters over the shared service / 基于共享 service 的 MCP 与 CLI 传输层；
- `src/web-server.ts` and `src/web`: local read-only audit surface and state-gated controls / 本地审计界面和受状态约束的控制操作。

### Canonical intent and idempotency / Canonical intent 与幂等

The payout payload uses sorted-key canonical JSON, UTF-8 hashing, and integer base units. Its hash is the approval boundary and the source of the idempotency identity. Changing the recipient, amount, reason, policy version, chain, or asset creates a different intent that requires a new review.

支付 payload 使用排序后的 canonical JSON、UTF-8 哈希和整数 base units。该 hash 同时是人工审批边界和幂等身份的来源。修改收款人、金额、原因、策略版本、链或资产，都会产生新的 intent，并要求重新审核。

### Fail-closed behavior / Fail-closed 行为

ReleaseRail blocks instead of claiming success when:

出现以下情况时，ReleaseRail 会阻断流程，而不是宣称成功：

- release, commit, ancestry, or contributor attribution is invalid / Release、commit、版本关系或贡献者归属无效；
- recipient is not allowlisted or amount exceeds the policy cap / 收款人不在白名单中或金额超过策略上限；
- KeeperHub simulation fails or returns an unknown result / KeeperHub 模拟失败或结果未知；
- transaction receipt is missing, failed, on the wrong chain, or has the wrong recipient/value / receipt 缺失、失败、链错误或收款人/金额不匹配；
- a retry would create a new execution identity / 重试会创建新的执行身份。

## Safety boundary / 安全边界

The current hackathon slice deliberately stays narrow:

当前比赛版本有意保持边界清晰：

- one native-asset payout on Base Sepolia or Ethereum Sepolia / Base Sepolia 或 Ethereum Sepolia 上的一笔原生资产支付；
- one explicitly configured recipient per intent / 每个 intent 一个明确配置的收款人；
- KeeperHub is the only signing and broadcasting path / KeeperHub 是唯一签名和广播路径；
- no private-key handling in ReleaseRail / ReleaseRail 不处理私钥；
- no autonomous selection of arbitrary recipient, asset, chain, or amount / Agent 不能自治选择任意收款人、资产、链或金额；
- no claim of mainnet, payroll, ERC-20, batching, or multi-chain support / 不宣称已支持主网、工资系统、ERC-20、批量支付或多链扩展。

## Verification / 验证

Run the repository checks from the same revision used for a demo:

使用与演示相同的代码版本运行检查：

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm preflight
```

For a reproducible live demonstration, follow [docs/demo-runbook.md](docs/demo-runbook.md). For operational setup and recovery, see [docs/operations.md](docs/operations.md). For the local console, see [docs/web-console.md](docs/web-console.md).

可复现的现场演示请参考 [docs/demo-runbook.md](docs/demo-runbook.md)。运行配置和恢复流程请参考 [docs/operations.md](docs/operations.md)。本地控制台请参考 [docs/web-console.md](docs/web-console.md)。

## Competition submissions / 比赛提交

The main-track BUIDL is ReleaseRail × EzDSH. The separate Feature Bounty submission is KeeperHub [PR #2525](https://github.com/KeeperHub/keeperhub/pull/2525); it is an independent KeeperHub repository change and is not required for the main-track integration to run.

主赛 BUIDL 是 ReleaseRail × EzDSH。独立的 Feature Bounty 提交是 KeeperHub [PR #2525](https://github.com/KeeperHub/keeperhub/pull/2525)，它属于 KeeperHub 仓库的独立改动，不是主赛集成运行的依赖。

See [SUBMISSION_MAIN.md](SUBMISSION_MAIN.md) and [SUBMISSION_BOUNTY.md](SUBMISSION_BOUNTY.md) for the two separate submission records.

两个独立提交记录请查看 [SUBMISSION_MAIN.md](SUBMISSION_MAIN.md) 和 [SUBMISSION_BOUNTY.md](SUBMISSION_BOUNTY.md)。

## License and project status / 许可证与项目状态

This repository is the hackathon integration and demonstration artifact. It is intentionally not a general payroll, treasury, or autonomous financial system. Public payment evidence should remain redacted to the fixed allowlist; credentials, private keys, local policies, and unredacted runtime state must stay outside source control.

本仓库是比赛集成与演示产物，有意不把自己定义成通用工资、金库或自治金融系统。公开支付证据应保持在固定白名单字段内；凭据、私钥、本地策略和未脱敏运行状态必须留在源码控制之外。
