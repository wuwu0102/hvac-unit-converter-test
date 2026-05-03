# HVAC Unit Converter V0.19

HVAC 單位轉換工具（中文優先、手機版優先）。

## 功能列表
- 空調能力轉換（RT / kW / kcal/h / BTU/h）
- 溫度轉換（C ↔ F）
- 流量轉換（CFM / CMH / m3/s / L/s / LPM / CMM）
- 壓力轉換（Pa / kPa / mmAq / bar / psi / N/m2）
- 面積轉換
- 流速轉換（m/s / ft/s / mm/s / cm/s）
- 流量對應管徑
- 壓差估算流量（設備修正）
- 電力模組
  - 電力單位換算（W / kW / MW / HP）
  - 三相電力估算（kVA / kW）
  - 單相電力估算（kVA / kW）
  - 電流估算（A）

## 電力模組說明
- 電力模組僅包含 W、kW、MW、HP。
- RT、kcal/h、BTU/h、冷凍噸屬於冷量 / 空調能力，不列入電力模組。

## 開發（legacy-web）
直接開啟 `legacy-web/index.html` 即可使用。

## CI / 發佈狀態
- Web 版本目前可正常使用，透過 GitHub Pages 部署。
- Android APK 可由 GitHub Actions 的 `Build Android APK` workflow artifact 下載。
- iOS TestFlight / App Store release 目前暫停，待 Mac / Xcode / code signing 環境準備完成後再重新啟用。

## 部署網址
- 正式版（Production）：
  - https://wuwu0102.github.io/hvac-unit-converter/
- 測試版（Staging）：
  - https://wuwu0102.github.io/hvac-unit-converter/dev/

## 開發流程
1. 新功能先在 `develop` branch 開發。
2. 推送後由 `Deploy Flutter Web Staging` 自動部署到測試版網址。
3. 測試版確認正常後，再將 `develop` merge 到 `main`。
4. `main` 永遠維持穩定正式版，由 `Deploy Flutter Web Production` 部署到 root。

## iOS CI 說明
- `iOS Build Only Manual` workflow 僅支援手動觸發（`workflow_dispatch`）。
- iOS 上架仍需 Mac / Xcode / code signing，GitHub Actions 目前只做手動測試用途。


## 計算依據與限制
- 本工具為 HVAC 工程初選估算工具。
- 水管初選以 1.2～3.0 m/s 為建議範圍。
- 3.0 m/s 為本工具預設最大控制值。
- 實際設計仍須依材質、管厚、管路長度、局部損失、閥件、泵浦揚程、噪音、沖蝕、業主規範與 ASHRAE/CIBSE/專案規範確認。
