# 代码审查标准与流程规范 (Code Review Guidelines)

> 本规范旨在帮助团队建立高效、建设性且标准化的 Code Review 机制，提升代码质量、保障系统安全与稳定性，并促进团队成员间的技术交流与成长。

---

## 一、 核心原则

1. **针对代码而非个人 (Code Over Person)**
   - 评价聚焦于代码的正确性、可读性与架构设计，绝不攻击作者。
   - 使用客观、中立且有建设性的语言，多用“建议”、“探讨”而非命令式语气。

2. **质量与效率并重 (Quality & Velocity Balance)**
   - **响应 SLA**：Reviewer 应在收到 PR 提醒后的 **24 小时内** 完成首次审查或给出预计处理时间。
   - **PR 粒度控制**：单个 PR 的变更行数建议控制在 **400 行以内**（不含自动生成的代码），避免过大变更导致审查质量下降。

3. **自动化优先 (Automation First)**
   - 代码风格、基础格式、静态语法检查（Linter）、单元测试必须由 **CI (Continuous Integration) 门禁** 自动拦截。
   - 人工 Review 专注于 **业务逻辑、安全隐患、系统架构、边缘条件与可维护性**。

4. **赞赏优秀代码 (Praise Good Code)**
   - 发现优雅的设计、巧妙的重构或覆盖全面的单元测试时，不吝啬给予 positive feedback（如 👍、"Nice pattern!"）。

---

## 二、 审查问题分级标准 (Severity Classification)

所有 Review 意见须打上明确的优先级标记，方便作者识别修改诉求的紧迫程度：

### 🔴 阻塞级 (Blocker - 必须修复才能合并)
- **安全 vulnerability**：SQL 注入、XSS、未授权访问、硬编码敏感信息（Secret/API Key）等。
- **致命 Bug / 数据风险**：会导致崩溃、内存泄漏、死锁、并发竞争或数据损坏/丢失的问题。
- **架构/契约破损**：破坏公开 API 兼容性、违反核心设计原则。
- **严重性能隐患**：如数据库 N+1 查询、死循环、大数组无深拷贝或未分页。
- **关键路径缺失**：缺乏必要的错误捕获、日志记录或核心业务逻辑的单元测试。

### 🟡 建议级 (Suggestion - 强烈建议修改)
- **边界条件疏漏**：如 Null/Undefined 未处理、数组越界、网络超时缺乏兜底等。
- **可读性与命名**：变量名晦涩、函数职责不清、嵌套层级过深（> 3 层）。
- **代码重复 (DRY)**：存在明显可复用的硬编码逻辑。
- **测试覆盖不足**：缺乏针对分支逻辑或异常场景的测试用例。

### 💭 微调级 (Nit - 建议或探讨，不阻断合并)
- **样式细节**：Linter 未盖到的非致命格式微调。
- **表达优化**：可替换为更地道/优雅的语言特性（如 ES6+ 语法糖）。
- **文档/注释**：拼写错误或更加清晰的注释措辞。
- **技术探讨**：关于未来扩展性或重构方向的非即时需求讨论。

---

## 三、 标准代码审查流程 (Workflow)

```
[Author: 准备 PR] 
     │
     ▼
[CI 门禁: 自动化检查 (Lint / Test / Build)] 
     │ ❌ 失败: 退回修改
     ▼ 🔒 通过
[Author: 指派 Reviewer 并附带 PR 描述]
     │
     ▼
[Reviewer: 进行代码审查 (优先看架构 -> 逻辑 -> 细节)]
     │
     ├─ 🔴 有 Blocker ───────────────► [Author: 修改代码并 Push] ───┐
     ├─ 🟡 有 Suggestion (需沟通) ──────► [Author/Reviewer 讨论确认]  │
     │                                                               │
     ▼ 💚 Approved (无 Blocker) ◄─────────────────────────────────────┘
[Merge: 合并代码入主干并删除源分支]
```

### 1. 提交者规范 (Author Checklist)
在发起 PR / MR 前，作者需完成以下检查：
- [ ] **Self-Review**：自己先通读一遍 Diff，检查是否遗留 `console.log`、调试代码或临时注释。
- [ ] **CI 绿灯**：确保本地及 remote CI 的 Lint、Type Check、Unit Test 全部通过。
- [ ] **填写 PR 描述**：清晰说明修改背景、解决的问题、影响范围及验证方式。
- [ ] **附带测试证明**：提供单测通过截图、手测功能录屏或接口测试结果。

### 2. 审查者规范 (Reviewer Guidelines)
建议按以下五步法进行审查：
1. **理解上下文**：先看 PR 标题与描述，明确本次修改的目的。
2. **架构与主干路径**：查看文件目录结构与核心类/接口设计，确保不违背现有的架构规范。
3. **业务逻辑与异常处理**：重点核查分支判断、边界值、并发与错误处理。
4. **安全与性能校验**：防范常见安全风险，检查资源释放与大数据量处理。
5. **给出规范反馈**：结合分级标记（🔴/🟡/💭），给出有具体代码建议的评论。

---

## 四、 Review 评论标准模板与范例

### 1. 标准评论格式 (Standard Comment Format)

```markdown
<分级标记> **<分类>: <简短说明>**
<具体行号或代码块说明>

**原因 (Why):** <说明为什么这样修改更优或可能引发的问题>

**建议实现 (Suggestion):**
```<language>
<给出的改进代码示例>
```
```

### 2. 评论范例

#### 范例 1：🔴 阻断级 - 安全与 SQL 注入风险
> 🔴 **Security: SQL 注入风险**  
> `Line 42`: 用户输入的 `username` 直接拼接到了 SQL 语句中。  
>  
> **原因 (Why):** 攻击者可通过传入 `admin' --` 绕过密码校验，导致越权登录。  
>  
> **建议实现:**  
> ```typescript
> // 改用参数化查询
> const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);
> ```

#### 范例 2：🟡 建议级 - 缺失空值与边界校验
> 🟡 **Correctness: 缺失空值防御**  
> `Line 115`: `res.data.items.map(...)` 假设了 `items` 一定为数组。  
>  
> **原因 (Why):** 当后端接口返回 `items: null` 或网络异常时，会导致页面前端白屏 (Uncaught TypeError)。  
>  
> **建议实现:**  
> ```typescript
> const items = res.data?.items ?? [];
> return items.map(item => <ItemCard key={item.id} data={item} />);
> ```

#### 范例 3：💭 微调级 - 语法表达优化
> 💭 **Nit: 可简化为 Optional Chaining**  
> `Line 78`: `user && user.profile && user.profile.avatar`  
>  
> **原因 (Why):** 项目使用 TS/ES2020，可选链语法更加简洁易读。  
>  
> **建议实现:**  
> ```typescript
> const avatar = user?.profile?.avatar;
> ```

#### 范例 4：👍 肯定与赞赏
> 👍 **Clean Pattern!**  
> 这里的状态机重构比原来的 `if-else` 嵌套清晰很多，单测覆盖也很全，学习了！

---

## 五、 PR / Issue 模板 (GitHub / GitLab / Gitee 适用)

可以在仓库根目录创建 `.github/PULL_REQUEST_TEMPLATE.md`：

```markdown
## 📝 变更说明 (What & Why)
- 简述本次修改的目的和背景：
- 关联的 Issue / 需求单：#

## 🛠️ 修改类型 (Type of Change)
- [ ] 🐛 Bug 修复
- [ ] 🚀 新功能开发
- [ ] 🧹 代码重构 / 清���
- [ ] ⚡ 性能优化
- [ ] 📚 文档 / 注释更新

## 🧪 验证与测试 (Verification)
- [ ] 本地单元测试已通过 (`npm test`)
- [ ] 手动验证结果（附截图/录屏/日志）：

## 🔒 Self-Review 检查清单
- [ ] 没有遗留调试日志 (`console.log` / `debugger`)
- [ ] 变量与函数命名清晰无歧义
- [ ] 已处理 Null / Undefined 及异常边界条件
- [ ] 关键逻辑补充了必要的注释与单元测试
```

---

## 六、 落地与持续改进策略

1. **前置自动化门禁 (Pre-commit & CI)**
   - 使用 `husky` + `lint-staged` 在提交时自动对暂存区代码运行 `eslint` 与 `prettier`。
   - CI Pipeline 必须包含：静态分析 -> 单元测试 -> 构建检查 三道防线。

2. **定期 Review 总结复盘**
   - 每双周抽取 2-3 个经典 Review 案例在团队内分享，将频繁踩坑的点转化为团队的 CheckList 或 Linter 规则。

3. **指标监控与调优**
   - 关注 **PR 平均响应时长**、**PR 平均修改轮数** 及 **PR 代码行数分布**，及时优化流程，避免 Review 成为研发交付的堵塞瓶颈。
