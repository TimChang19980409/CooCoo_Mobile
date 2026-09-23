# CooCoo Mobile 技術堆疊與工具設定步驟

> 更新基準：2026-09-23。目前是手動導入指南，列出的指令與設定尚未全部套用。每完成一步再執行該步的驗證，不要一次安裝所有套件。

## 先看結論

先修正 Expo 套件版本、ESLint 與 Jest，再設定 Biome 和 FSD 依賴檢查。接著用第一個真實功能導入 neverthrow、TanStack Query、表單工具。MSW、Storybook、Maestro 放在有 API、元件和使用者流程可測時加入。

分工如下：

| 工具 | 負責內容 |
| --- | --- |
| ESLint + eslint-config-expo | React、Expo、React Compiler 與測試程式規則 |
| Biome | 格式化和 import 排序；先關閉 Biome linter |
| TypeScript | 靜態型別檢查 |
| Steiger | FSD 層級、同層 slice 與 public API 檢查 |
| neverthrow | API 與功能邊界中「預期會失敗」的結果 |
| TanStack Query | 伺服器資料、快取、重新取得與 mutation |
| Zustand | 跨畫面的用戶端 UI 狀態 |
| React Hook Form + Zod | 表單狀態與執行時驗證 |
| MSW、Storybook、Maestro | API mock、元件展示、真實 App 流程測試 |

## 0. 操作前確認專案狀態

目前 `package.json` 使用 Expo SDK 57、React Native 0.86.3、React 19.2.3、TypeScript 6.0.3 與 pnpm。`app.json` 已有 `experiments.reactCompiler: true`；`tsconfig.json` 已有 `@/*` 指向 `src/*`。`src/app` 是 Expo Router 的路由目錄。

2026-09-23 的基線檢查結果：

- `pnpm exec tsc --noEmit` 通過。
- `pnpm lint` 失敗：`eslint` 尚未安裝；現有 `.eslintrc.js` 只有 Testing Library 規則。
- `pnpm exec jest --runInBand --watch=false` 找不到測試。`../__test__/home-screen.test.tsx` 的路徑與檔名都不符合目前 Jest 的預設規則。
- `pnpm expo install --check` 指出 `expo`、`expo-router`、`expo-constants`、`@expo/ui` 與 SDK 57 預期版本不一致。
- 目前有未提交的工作樹變更。每一步操作前先用 `git status --short` 了解自己的修改，尤其在首次全專案格式化前。

以下指令都從專案根目錄執行。這個專案使用 pnpm，因此用 `pnpm expo install` 安裝依賴；它會依 Expo SDK 選擇相容版本。`pnpm exec` 執行已安裝的本機 CLI。若 `expo-doctor` 尚未安裝，用 `pnpm dlx expo-doctor`。

## 1. 修正 Expo 套件版本

### 操作

~~~bash
pnpm expo install --check
pnpm expo install --fix
pnpm expo install --check
pnpm dlx expo-doctor
~~~

`--fix` 會修改 `package.json` 與 `pnpm-lock.yaml`。不要手動替每個 Expo 套件填「最新」版；同一 SDK 內也有相容版本要求。

### Expo 注意事項

- 本專案沒有需要手改的 `ios/`、`android/` 目錄。需要原生設定時優先改 `app.json` 或 config plugin。
- `expo install` 能處理 Expo SDK 相容版本；第三方套件的功能與 React Native 支援仍須看套件自己的文件。
- 更新後至少啟動一次 iOS、Android 或 web，確認 Expo Router 能載入現有畫面。

### 完成條件

`pnpm expo install --check` 不再列出版本不符，`expo-doctor` 沒有待處理的相容性問題。

參考：[Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)、[Expo 套件安裝](https://docs.expo.dev/workflow/using-libraries/)。

## 2. 讓 ESLint 與 Jest 先能正常執行

### 2.1 安裝並遷移 ESLint

~~~bash
pnpm expo install eslint eslint-config-expo --dev
~~~

新增根目錄的 `eslint.config.js`：

~~~js
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const testingLibrary = require('eslint-plugin-testing-library');

module.exports = defineConfig([
  globalIgnores(['dist/**', '.expo/**']),
  expoConfig,
  {
    ...testingLibrary.configs['flat/react'],
    files: [
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
      '**/*.{spec,test}.{js,jsx,ts,tsx}',
    ],
  },
]);
~~~

這個設定沿用已安裝的 `eslint-plugin-testing-library`，只對測試檔啟用。`pnpm lint` 成功讀取新設定後，移除舊的 `.eslintrc.js`。先處理實際警告，再視需要加專案規則；暫時不要加入 Prettier 規則。

Expo SDK 53 以後支援 Flat Config。SDK 55 以後的 `eslint-config-expo` 已含 React Compiler lint 規則，不必另裝 `eslint-plugin-react-compiler`。[Expo ESLint 指南](https://docs.expo.dev/guides/using-eslint/)、[Expo React Compiler 指南](https://docs.expo.dev/guides/react-compiler/)。

### 2.2 修正測試入口

把 `../__test__/home-screen.test.tsx` 改成符合 Jest 預設規則的名稱，例如 `__tests__/home-screen.test.tsx`。目前測試搜尋「Welcome!」，但畫面顯示的是「Welcome to Expo」；重跑前也要修正斷言。

建議把 `package.json` 的腳本調整為：

~~~json
{
  "scripts": {
    "lint": "expo lint",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watchAll"
  }
}
~~~

既有 `jest-expo` preset 先保留。`test` 用非 watch 模式，讓本機與 CI 都能執行完畢。若測試直接 render route 時缺少 Router context，改測搬出 `src/app` 的 page 元件；路由整合另用 E2E 驗證。

### 完成條件

~~~bash
pnpm lint
pnpm typecheck
pnpm exec jest --runInBand
~~~

三個指令都能結束，Jest 至少找到並執行一個測試。

## 3. 設定 Biome，只處理格式與 import 排序

### 操作

~~~bash
pnpm expo install @biomejs/biome --dev
pnpm exec biome init
~~~

保留 `biome init` 產生的 `$schema`，在 `biome.json` 設定以下欄位：

~~~json
{
  "linter": {
    "enabled": false
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
~~~

在 `package.json` 加入：

~~~json
{
  "scripts": {
    "format": "biome check --write .",
    "format:check": "biome check ."
  }
}
~~~

`biome format` 只格式化；`biome check` 會處理 formatter 與 assist，因此能同時檢查 import 排序。由於設定關閉 `linter`，程式規則仍交由 ESLint。專案不再為相同檔案另加 Prettier 或 `eslint-plugin-prettier`。[Biome CLI](https://biomejs.dev/reference/cli/)、[organizeImports](https://biomejs.dev/assist/actions/organize-imports/javascript/)。

### Expo 與編輯器注意事項

- `.expo/`、`node_modules/`、`dist/` 是產物或依賴，不應被格式化。先確認 Biome 的檔案範圍與 `.gitignore`；若版本的預設行為沒有套用 Git ignore，再依 Biome 對應版本的 `vcs` 設定補上。
- 目前 `.vscode/settings.json` 有 `source.organizeImports`。若啟用 Biome 的儲存時排序，避免編輯器內建排序和 Biome 同時修改 import。
- 第一次先執行 `pnpm format:check` 觀察範圍；再執行 `pnpm format`，檢查差異後提交。

### 完成條件

`pnpm format:check` 通過；連續執行兩次 `pnpm format`，第二次沒有額外改動。

## 4. 規定 FSD 依賴方向並導入自動檢查

### 4.1 採用的目錄

~~~text
src/
├── app/                  Expo Router route 與 _layout.tsx
├── pages/                完整畫面；由 route 引用
├── widgets/              需要時才加的大型畫面區塊
├── features/             使用者操作，例如 sign-in
├── entities/             業務實體，例如 user
└── shared/               通用 API、UI、設定及小型函式庫
~~~

原規劃中的 `src/application` 暫不建立。它不是標準 FSD 層，會讓依賴檢查多出例外。全域 Provider 可先在 `src/app/_layout.tsx` 組合；Query Client 建立程式可放在 `src/shared/lib/query-client/`。`src/app` 不放一般 component、hook 或 utility，因為 Expo Router 會按路由目錄解讀檔案。

現有 `src/components`、`src/hooks`、`src/constants` 可隨畫面遷移逐步搬入對應的 FSD 位置。只建立新目錄而保留所有舊程式在外面，依賴檢查無法完整涵蓋。

### 4.2 依賴與公開入口規則

~~~text
app → pages → widgets → features → entities → shared
~~~

箭頭表示「可以依賴更低層」，不必逐層經過每個資料夾。例如 page 可直接 import feature 或 shared。`features/sign-in` 可 import `entities/user`；`entities/user` 不可 import `features/sign-in`。不同 `features` slice 之間也不可直接互相 import。同一 slice 內可用相對路徑。

跨 slice 必須走 `index.ts` 公開入口：

~~~tsx
// src/pages/home/index.ts
export { HomePage } from './ui/home-page';

// src/app/index.tsx
export { HomePage as default } from '@/pages/home';
~~~

~~~ts
// 可以：跨 slice 走公開入口
import { UserAvatar } from '@/entities/user';

// 不可以：跨 slice 讀取內部檔案
import { UserAvatar } from '@/entities/user/ui/user-avatar';
~~~

`shared` 不放 `user`、`post` 等業務邏輯。`app` 和 `shared` 在 FSD 中沒有一般業務 slice，結構與同層跨 slice 規則有例外。[FSD Layers](https://feature-sliced.design/docs/reference/layers)、[Slices and segments](https://feature-sliced.design/docs/reference/slices-segments/)。

### 4.3 用 Steiger 檢查

~~~bash
pnpm expo install steiger @feature-sliced/steiger-plugin --dev
pnpm exec steiger ./src
~~~

在 `package.json` 加入：

~~~json
{
  "scripts": {
    "fsd:check": "steiger ./src"
  }
}
~~~

先用 Steiger 預設設定。其 FSD 規則包含禁止向上依賴、同層不同 slice 互相依賴，以及繞過公開入口。現有模板結構可能產生警告；逐步遷移實際程式，不要為了讓輸出變綠而一次關閉整組規則。Steiger 尚在 beta，升版時先讀變更紀錄。[Steiger 專案與規則](https://github.com/feature-sliced/steiger)。

### Expo 遷移與完成條件

先搬一個畫面，例如 `src/app/index.tsx` 的 UI 到 `src/pages/home/ui/home-page.tsx`。保留 `src/app/index.tsx` 為 route 轉接檔，確認首頁與原本的 tab navigation 正常。接著故意寫一筆 `entities` import `features` 的違規 import，確認 `pnpm fsd:check` 會失敗，移除後再通過。

## 5. 檢查 React Compiler

`app.json` 已設定 `experiments.reactCompiler: true`。Expo SDK 54 以上會自動處理 Babel 設定，但 [Expo React Compiler 指南](https://docs.expo.dev/guides/react-compiler/) 仍列有安裝 `babel-plugin-react-compiler` 的步驟。先確認目前解析到的套件，再依 SDK 57 指南安裝對應版本；不要因為開關存在就假設編譯器已完成設定。

~~~bash
pnpm why babel-plugin-react-compiler
pnpm dlx react-compiler-healthcheck@latest
pnpm lint
~~~

若依官方指南需要把 plugin 加為直接依賴，使用 `pnpm expo install`；安裝後再跑上述檢查。暫時不建立自訂 `babel.config.js`，也不批次刪除現有 `useMemo`、`useCallback`。若單一元件確有問題，才考慮 `'use no memo'` 並記錄原因。若更動 Babel 或 Metro 設定，重新啟動 `pnpm expo start --clear`。

## 6. 用第一個 API 功能導入資料層與 neverthrow

### 6.1 依需求安裝

有第一個 API request 時：

~~~bash
pnpm expo install @tanstack/react-query zod neverthrow
~~~

有表單時：

~~~bash
pnpm expo install react-hook-form @hookform/resolvers
~~~

確定有跨畫面用戶端狀態時：

~~~bash
pnpm expo install zustand
~~~

需要持久保存 token 時：

~~~bash
pnpm expo install expo-secure-store
~~~

不要把 TanStack Query 已取得的伺服器資料再複製到 Zustand；尚未送出的獨立表單草稿則可放在 Zustand。token 放 SecureStore，登入後取得的 User 可由 TanStack Query 管理。

### 6.2 Provider 與 Expo Router

在 `src/shared/lib/query-client/` 建立 Query Client。由 `src/app/_layout.tsx` 在路由樹外層掛 `QueryClientProvider`。Query Client 不要在每次 render 時重新建立；原本的 `ThemeProvider`、Splash 與 tab navigation 仍應維持可運作。先用一個 GET request 驗證載入、成功、失敗狀態。

### 6.3 neverthrow 規則

- API response 解析、domain validation、登入與儲存等預期失敗的操作，可回傳 `Result<T, E>` 或 `ResultAsync<T, E>`。
- 錯誤用可辨識的型別，例如 `network`、`unauthorized`、`invalid-response`；第三方丟出的 `unknown` 在 API 邊界轉換。
- 不要求每一個普通函式都使用 neverthrow，也不要讓每個 React component 都手動拆 `Result`。
- TanStack Query 的 `queryFn` 要回傳 `Promise<T>`，失敗時 throw，才能讓 `isError` 與 retry 正常工作。可在 Query adapter 將 neverthrow 的 `Err` 轉為明確例外。

~~~ts
type GetUserError =
  | { type: 'network' }
  | { type: 'unauthorized' }
  | { type: 'invalid-response' };

// API/domain: ResultAsync<User, GetUserError>
// Query adapter: Promise<User>，遇到 Err 時 throw
// UI: 使用 data、isPending、isError
~~~

先測一個成功 response、一個 HTTP 失敗及一個 Zod 驗證失敗。這些是程式設計規範，安裝套件本身不會自動強制。[neverthrow](https://github.com/supermacro/neverthrow)。

### 6.4 React Native 的 Query 狀態

TanStack Query 在 React Native 可運作，但瀏覽器的視窗事件不能直接代表 App 前景與網路狀態。需要「回前景重新取得」時，依官方範例以 React Native `AppState` 更新 `focusManager`；需要「重新連線」時，安裝 `expo-network`，以網路狀態 listener 更新 `onlineManager`。

~~~bash
pnpm expo install expo-network
~~~

`expo-network` listener 必須解除訂閱；`getNetworkStateAsync()` 的初始讀取需處理拒絕情況。這些設定在實作 Query 時一起驗證 iOS、Android，以及本專案支援的 web。[TanStack Query React Native 指南](https://tanstack.com/query/latest/docs/framework/react/react-native)。

## 7. 有 API 合約後加入 MSW

~~~bash
pnpm expo install msw --dev
pnpm expo install react-native-url-polyfill fast-text-encoding
~~~

建議把 handler 放在 `src/shared/api/mocks/handlers.ts`；Node 測試與 React Native runtime 分成不同入口。Jest 使用 `msw/node`，React Native runtime 使用 `msw/native`。不要把 `msw/node` import 進手機 bundle，否則 Metro 可能嘗試解析 Node 的 `http` 模組。

React Native 入口必須先載入 encoding 與 URL polyfill，再啟動 mock server。先在 Jest 用 `msw/node` 驗證 handler；需要 runtime mock 時再按以下順序操作：

1. 依 [Expo Router 自訂入口文件](https://docs.expo.dev/router/installation/#custom-entry-point-to-initialize-and-load-side-effects) 在根目錄新增 `index.js`，並把 `package.json` 的 `main` 改為 `index.js`。
2. 在這個入口載入 polyfill，僅於開發模式啟動 `msw/native`，最後才載入 `expo-router/entry` 註冊 App。MSW 官方以同步的 `AppRegistry` 範例說明，不能原樣取代 Expo Router 的註冊流程。
3. 執行 `pnpm expo start --clear`，在裝置或模擬器驗證一個 GET request。也確認正式模式沒有啟動 mock，正常 route 仍能載入。

參考：[MSW React Native 指南](https://mswjs.io/docs/integrations/react-native/)。

## 8. 元件穩定後加入 Storybook

React Native Storybook 目前建議 Expo Router 專案使用 **entry-point swapping**：設定 `STORYBOOK_ENABLED=true` 時由 bundler 切到 Storybook；正常啟動維持 Expo Router。這不需要建立 `src/app/storybook.tsx` route。

~~~bash
pnpm create storybook@latest
~~~

在初始化選擇 React Native / on-device Storybook。初始化後檢查產生的 `.rnstorybook`、`metro.config.js`、入口與 scripts；不要在初始化之前手寫舊版 `withStorybook` import 路徑。把 stories 放在元件旁，例如 `src/shared/ui/button/button.stories.tsx`。

分別啟動正常 App 與 Storybook，確認兩種入口都能運作。若新增的 Storybook 依賴含 Expo Go 未內建的原生模組，需建立 development build。[React Native Storybook Getting Started](https://storybookjs.github.io/react-native/docs/intro/getting-started/)。

## 9. 真實流程穩定後加入 Maestro 與 EAS

### 9.1 App ID 與測試標記

原生 build 前在 `app.json` 設定真正要使用的 `ios.bundleIdentifier` 與 `android.package`；不要直接使用文件中的 `com.example.coocoo`。App ID 對 build、安裝和發佈有影響，應先確定命名。重要的 `Pressable`、`TextInput` 等元件加入穩定 `testID`。

### 9.2 本機 smoke flow

Maestro CLI 需要 Java 17 以上。macOS 可依官方指令安裝，安裝前先閱讀腳本來源：

~~~bash
java -version
curl -fsSL "https://get.maestro.mobile.dev" | bash
maestro --help
~~~

參考：[Maestro CLI 安裝指南](https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli.md)。接著建立 `.maestro/smoke/launch-app.yaml`：

~~~yaml
appId: 你的實際.app.id
---
- launchApp
- assertVisible: "目前首頁實際可見文字"
~~~

先將 App 安裝到 simulator 或 emulator，再執行 `maestro test .maestro/smoke/launch-app.yaml`。若用 `expo run:ios` 或 `expo run:android` 做本機原生 build，需具備對應的本機工具；若不使用本機 Xcode / Android Studio，可改用 EAS development 或測試 build，再安裝到測試裝置。

### 9.3 EAS build 與 workflow

先在 `eas.json` 增加供模擬器與 Android APK 使用的 `e2e-test` profile：

~~~json
{
  "build": {
    "e2e-test": {
      "withoutCredentials": true,
      "ios": { "simulator": true },
      "android": { "buildType": "apk" }
    }
  }
}
~~~

這是新增片段；如果已有 `eas.json`，合併到現有 `build`，不要覆蓋其他 profile。確認 App ID、EAS 專案連結和測試 build 都正確後，再建立 `.eas/workflows/e2e-test-android.yml`：

~~~yaml
name: e2e-test-android

on:
  pull_request:
    branches: ['*']

jobs:
  build_android:
    type: build
    params:
      platform: android
      profile: e2e-test

  maestro_test:
    needs: [build_android]
    type: maestro
    params:
      build_id: ${{ needs.build_android.outputs.build_id }}
      flow_path: ['.maestro/smoke/launch-app.yaml']
~~~

先以手動 build 與本機 flow 驗證，再啟用 PR 觸發。`maestro` job 使用前一個 build job 的 `build_id`，`flow_path` 指向已通過的 flow。不要在只有範例畫面時直接加入完整登入 E2E。參考 [Expo Maestro EAS 範例](https://docs.expo.dev/eas/workflows/examples/e2e-tests/) 並以目前 EAS 文件核對欄位。

## 10. 最後建立固定驗證入口

前面步驟都能單獨通過後，加入 `package.json`：

~~~json
{
  "scripts": {
    "check": "pnpm lint && pnpm typecheck && pnpm format:check && pnpm fsd:check && pnpm exec jest --runInBand"
  }
}
~~~

固定驗證入口建好後，每完成一個階段執行：

~~~bash
pnpm check
pnpm expo install --check
pnpm dlx expo-doctor
~~~

若尚未導入 Steiger 或尚未修好 Jest，先不要加會讓 `check` 必然失敗的子指令。安裝含原生程式碼的套件後，要依 Expo 文件確認 Expo Go 是否已包含該模組；若沒有，改用 development build 測試。不要手改產生的 `ios/` 與 `android/` 目錄。[Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)。

## 暫不導入的項目

- **Oxlint：** 先維持 Expo ESLint 為主要 lint；未來專案變大、有可量測的速度需求再評估。
- **Prettier：** 已選 Biome 格式化，不重複加入格式規則。
- **一次性全部安裝：** Zustand、表單、MSW、Storybook、Maestro 都在出現對應需求時分步加入，方便定位相容性與 Metro 問題。
