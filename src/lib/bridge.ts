import { invoke } from '@tauri-apps/api/core';
import type { CodexStatus, InstallRequest, InstallResult } from './types';

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

const browserStatus: CodexStatus = {
  cliFound: false,
  desktopFound: false,
  loggedIn: false,
  skillsDirectory: '~/.codex/skills',
  message: '网页预览不会读取你的电脑。请启动 Mac 桌面应用检测 Codex。'
};

export async function detectCodex(): Promise<CodexStatus> {
  if (!isTauri()) return browserStatus;
  return invoke<CodexStatus>('detect_codex');
}

export async function installPackage(request: InstallRequest): Promise<InstallResult> {
  if (!isTauri()) {
    return { status: 'blocked', message: '网页预览不能安装。请在 Open Marketing Mac 应用中操作。' };
  }
  return invoke<InstallResult>('install_package', { request });
}

export async function uninstallPackage(packageId: string): Promise<InstallResult> {
  if (!isTauri()) {
    return { status: 'blocked', message: '网页预览不能卸载。请在 Open Marketing Mac 应用中操作。' };
  }
  return invoke<InstallResult>('uninstall_package', { packageId });
}

export async function openCodex(): Promise<void> {
  if (!isTauri()) return;
  await invoke('open_codex');
}
