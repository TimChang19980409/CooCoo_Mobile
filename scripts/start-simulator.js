#!/usr/bin/env node

const { execFile, spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const readline = require('node:readline/promises');
const { promisify } = require('node:util');

const run = promisify(execFile);

async function choose(label, options) {
  if (options.length === 0) {
    throw new Error(`沒有可用的${label}。請先安裝系統映像並建立虛擬裝置。`);
  }

  if (options.length === 1) {
    console.log(`使用 ${options[0].label}`);
    return options[0];
  }

  if (!process.stdin.isTTY) {
    throw new Error(`有多個${label}，請在互動式終端機執行此指令。`);
  }

  const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log(`\n選擇${label}：`);
    options.forEach((option, index) => {
      console.log(`${index + 1}. ${option.label}`);
    });

    while (true) {
      const answer = await input.question('輸入編號：');
      const index = Number(answer.trim()) - 1;
      if (Number.isInteger(index) && options[index]) {
        return options[index];
      }
      console.log('請輸入清單中的編號。');
    }
  } finally {
    input.close();
  }
}

function androidEmulator() {
  const sdkRoots = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    path.join(os.homedir(), 'Library', 'Android', 'sdk'),
  ];

  for (const root of sdkRoots) {
    if (!root) continue;
    const executable = path.join(root, 'emulator', 'emulator');
    if (existsSync(executable)) return executable;
  }

  throw new Error(
    '找不到 Android Emulator。請設定 ANDROID_HOME 指向 Android SDK。',
  );
}

async function startIos() {
  if (process.platform !== 'darwin') {
    throw new Error('iOS Simulator 只能在 macOS 啟動。');
  }

  const { stdout } = await run('xcrun', [
    'simctl',
    'list',
    'devices',
    'available',
    '--json',
  ]);
  const devices = Object.entries(JSON.parse(stdout).devices)
    .filter(([runtime]) => runtime.includes('.iOS-'))
    .flatMap(([runtime, entries]) =>
      entries
        .filter((device) => device.isAvailable)
        .map((device) => ({
          label: `${device.name} (${runtime.split('.').at(-1).replaceAll('-', '.')})${device.state === 'Booted' ? '・已啟動' : ''}`,
          udid: device.udid,
          state: device.state,
        })),
    );

  const device = await choose('iOS 模擬器', devices);
  if (device.state !== 'Booted') {
    await run('xcrun', ['simctl', 'boot', device.udid]);
  }
  await run('open', [
    '-a',
    'Simulator',
    '--args',
    '-CurrentDeviceUDID',
    device.udid,
  ]);
  console.log(`已啟動 ${device.label}。接著可執行 pnpm ios。`);
}

async function startAndroid() {
  const executable = androidEmulator();
  const { stdout } = await run(executable, ['-list-avds']);
  const devices = stdout
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ label: name, name }));
  const device = await choose('Android 虛擬裝置', devices);

  await new Promise((resolve, reject) => {
    const child = spawn(executable, ['-avd', device.name], {
      detached: true,
      stdio: 'ignore',
      shell: false,
    });
    child.once('error', reject);
    child.once('spawn', () => {
      child.unref();
      resolve();
    });
  });

  console.log(`正在啟動 ${device.name}。開機完成後可執行 pnpm android。`);
}

async function main() {
  const requested = process.argv[2];
  if (requested && !['ios', 'android'].includes(requested)) {
    throw new Error('用法：pnpm simulator [ios|android]');
  }

  const platform =
    requested ||
    (
      await choose('平台', [
        { label: 'iOS', value: 'ios' },
        { label: 'Android', value: 'android' },
      ])
    ).value;

  if (platform === 'ios') {
    await startIos();
  } else {
    await startAndroid();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
