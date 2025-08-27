# 🧹 安全清理嵌套目录指南

**Universal Web Deployer - 安全清理工具使用说明**

## 📖 **概述**

`safe-cleanup.ps1` 是一个超安全的嵌套目录清理工具，专门用于清理部署过程中产生的深层嵌套 `.deploy-temp_DELETE_*` 目录。

### ⚡ **核心特点**
- 🔒 **超安全** - 逐层验证，只删除指定模式目录
- 🕐 **耐心清理** - 虽然时间较长，但绝对安全可靠
- 📊 **详细反馈** - 实时进度显示和时间统计
- 🎯 **自动化支持** - 支持后台无人值守运行
- 🛡️ **多重保护** - 深度限制、路径验证、错误处理

---

## 🚀 **快速开始**

### 基本使用（交互模式）
```powershell
# 在项目根目录执行
.\safe-cleanup.ps1
```

### 自动化使用（推荐）
```powershell
# 自动清理，无需交互
.\safe-cleanup.ps1 -Auto

# 限制清理深度（推荐1000层以内）
.\safe-cleanup.ps1 -Auto -MaxDepth 500
```

---

## 🔧 **参数详解**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `-Auto` | Switch | `$false` | 启用自动模式，跳过用户交互 |
| `-MaxDepth` | Int | `1000` | 最大递归深度限制 |

### 使用示例
```powershell
# 完全自动化清理
.\safe-cleanup.ps1 -Auto

# 保守清理（深度限制200层）
.\safe-cleanup.ps1 -Auto -MaxDepth 200

# 手动交互模式（查看详细选项）
.\safe-cleanup.ps1
```

---

## ⏰ **时间估算**

### 清理时间参考
- **小型嵌套**（<100层）: 2-5分钟
- **中型嵌套**（100-500层）: 5-15分钟  
- **大型嵌套**（500-1000层）: 15-60分钟
- **超大嵌套**（>1000层）: 1-3小时

### 性能优化
脚本已优化性能：
- 每100个文件休息10毫秒
- 批量处理，避免内存过载
- 智能进度显示，减少输出开销

---

## 🏃 **后台运行方案**

### 方案一：PowerShell后台作业
```powershell
# 启动后台作业
$job = Start-Job -ScriptBlock {
    Set-Location "D:\Users\Fzero\project\card-game"
    .\safe-cleanup.ps1 -Auto
}

# 检查作业状态
Get-Job $job

# 获取作业输出
Receive-Job $job

# 清理作业
Remove-Job $job
```

### 方案二：分离窗口运行
```powershell
# 新窗口中运行（可最小化）
Start-Process powershell -ArgumentList "-File .\safe-cleanup.ps1 -Auto" -WindowStyle Minimized
```

### 方案三：Windows计划任务
```powershell
# 创建计划任务（立即运行一次）
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File D:\Users\Fzero\project\card-game\safe-cleanup.ps1 -Auto"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date)
Register-ScheduledTask -TaskName "SafeCleanup" -Action $action -Trigger $trigger

# 启动任务
Start-ScheduledTask -TaskName "SafeCleanup"

# 检查任务状态
Get-ScheduledTask -TaskName "SafeCleanup"
```

---

## 📊 **监控进度**

### 实时监控
脚本提供详细的进度信息：

```
Ultra-Safe Nested Directory Cleanup Tool
================================================================
Current Location: D:\Users\Fzero\project\card-game
Found 2 deeply nested directories:
   - .deploy-temp_DELETE_1a2b3c4d5e
   - .deploy-temp_DELETE_9f8e7d6c5b

Time Estimation:
   Per directory: 2-10 minutes (depends on nesting depth)
   Total estimated: 4-20 minutes
   Risk level: VERY LOW (layer-by-layer safe deletion)

Processing: .deploy-temp_DELETE_1a2b3c4d5e
   Start time: 14:30:15
Processing layer 0 : .deploy-temp_DELETE_1a2b3c4d5e
Processing layer 1 : .deploy-temp_DELETE_1a2b3c4d5e\.deploy-temp
   Progress: 50/150
   Progress: 100/150
Successfully deleted directory: .deploy-temp_DELETE_1a2b3c4d5e
SUCCESS: .deploy-temp_DELETE_1a2b3c4d5e cleaned! Time: 3.2 minutes
```

### 日志记录
如需保存日志：
```powershell
# 保存完整日志
.\safe-cleanup.ps1 -Auto | Tee-Object -FilePath "cleanup-log.txt"

# 仅保存错误日志
.\safe-cleanup.ps1 -Auto 2> "cleanup-errors.txt"
```

---

## ⚠️ **故障排除**

### 常见问题

#### 1. 脚本执行策略限制
```
无法加载文件 safe-cleanup.ps1，因为在此系统上禁止运行脚本。
```
**解决方案**：
```powershell
# 临时允许脚本执行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\safe-cleanup.ps1 -Auto
```

#### 2. 路径过长错误
```
处理失败: 指定的路径、文件名或两者都太长
```
**解决方案**：脚本会自动尝试缩短路径，如仍失败：
```powershell
# 使用更小的深度限制
.\safe-cleanup.ps1 -Auto -MaxDepth 200
```

#### 3. 权限不足
```
拒绝访问路径
```
**解决方案**：
```powershell
# 以管理员身份运行PowerShell
# 然后执行清理脚本
.\safe-cleanup.ps1 -Auto
```

#### 4. 进程占用文件
**解决方案**：
- 关闭可能占用文件的程序（IDE、文件管理器等）
- 重启计算机后再次尝试

---

## 🛡️ **安全保障**

### 多重安全检查
1. **路径验证** - 只处理包含 "deploy-temp" 的路径
2. **模式匹配** - 只删除 `.deploy-temp_DELETE_*` 模式目录
3. **深度限制** - 防止无限递归（默认1000层）
4. **逐层验证** - 每层都进行安全检查
5. **错误处理** - 单个失败不影响其他目录清理

### 不会删除的内容
- ✅ 正常项目文件
- ✅ 非嵌套目录
- ✅ 不匹配模式的目录
- ✅ 用户数据文件

### 只删除的内容
- ❌ `.deploy-temp_DELETE_*` 模式目录
- ❌ 其内部的所有嵌套内容

---

## 💡 **最佳实践**

### 使用建议
1. **首次使用** - 建议先运行交互模式了解过程
2. **批量清理** - 使用 `-Auto` 参数进行后台清理
3. **保守清理** - 对超大嵌套使用较小的 `MaxDepth`
4. **日志记录** - 重要环境建议保存清理日志
5. **定期清理** - 部署后及时清理，避免积累

### 性能优化建议
```powershell
# 最佳性能配置
.\safe-cleanup.ps1 -Auto -MaxDepth 800
```

### 自动化集成
可将清理脚本集成到部署流程中：
```powershell
# 部署后自动清理
npm run deploy:all
.\safe-cleanup.ps1 -Auto
```

---

## 🔗 **相关文件**

- **脚本文件**: `safe-cleanup.ps1` - 主清理脚本
- **工具文档**: `UNIVERSAL-DEPLOYER-FILES.md` - 完整工具文件清单
- **部署配置**: `deploy.config.js` - 可配置清理忽略规则

---

## 📞 **技术支持**

如遇到其他问题：

1. **检查脚本输出** - 详细的错误信息和建议
2. **查看日志文件** - 使用 `Tee-Object` 保存的日志
3. **重启重试** - 某些情况下重启系统可解决问题
4. **手动处理** - 极端情况下可手动删除最外层目录

---

**⚠️ 重要提醒**：该脚本虽然运行时间较长，但绝对安全。请耐心等待清理完成，不要中途强制终止，以免留下不完整的清理状态。