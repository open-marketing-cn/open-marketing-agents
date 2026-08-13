mod installer;
mod types;

use installer::{install_payload, uninstall_payload};
use std::path::{Path, PathBuf};
use std::process::Command;
use types::{CodexStatus, InstallRequest, InstallResult, PackagePayload};

fn home_directory() -> Result<PathBuf, String> {
    dirs::home_dir().ok_or_else(|| "无法读取当前用户目录。".to_string())
}

fn skills_directory() -> Result<PathBuf, String> {
    Ok(home_directory()?.join(".codex").join("skills"))
}

fn app_state_directory() -> Result<PathBuf, String> {
    Ok(home_directory()?
        .join("Library")
        .join("Application Support")
        .join("Open Marketing"))
}

fn find_codex_binary(home: &Path) -> Option<PathBuf> {
    let candidates = [
        home.join(".local/bin/codex"),
        PathBuf::from("/opt/homebrew/bin/codex"),
        PathBuf::from("/usr/local/bin/codex"),
    ];
    for candidate in candidates {
        if candidate.is_file() {
            return Some(candidate);
        }
    }
    let result = Command::new("which").arg("codex").output().ok()?;
    if result.status.success() {
        let path = String::from_utf8_lossy(&result.stdout).trim().to_string();
        if !path.is_empty() {
            return Some(PathBuf::from(path));
        }
    }
    None
}

#[tauri::command]
fn detect_codex() -> Result<CodexStatus, String> {
    let home = home_directory()?;
    let binary = find_codex_binary(&home);
    let cli_version = binary.as_ref().and_then(|path| {
        Command::new(path)
            .arg("--version")
            .output()
            .ok()
            .filter(|output| output.status.success())
            .map(|output| String::from_utf8_lossy(&output.stdout).trim().to_string())
    });
    let logged_in = binary
        .as_ref()
        .and_then(|path| Command::new(path).args(["login", "status"]).output().ok())
        .map(|output| output.status.success())
        .unwrap_or(false);
    let desktop_found = Path::new("/Applications/Codex.app").exists()
        || home.join("Applications/Codex.app").exists();

    Ok(CodexStatus {
        cli_found: binary.is_some(),
        cli_version,
        desktop_found,
        logged_in,
        skills_directory: skills_directory()?.to_string_lossy().to_string(),
        message: Some(if binary.is_some() {
            "已检测到 Codex。Open Marketing 只会写入全局技能目录。"
        } else {
            "未检测到 Codex CLI。安装前请先完成 Codex 安装。"
        }
        .to_string()),
    })
}

fn package_payload(package_id: &str) -> Option<PackagePayload> {
    match package_id {
        "consumer-language-insight" => Some(PackagePayload {
            id: "consumer-language-insight",
            version: "0.1.0-alpha.1",
            status: "pending_validation",
            skill_md: include_str!("../../catalog/packages/consumer-language-insight/SKILL.md"),
            hidden_skills: &[
                (
                    "required-source-plan",
                    include_str!("../../catalog/packages/consumer-language-insight/references/skills/required-source-plan.md"),
                ),
                (
                    "required-evidence-coding",
                    include_str!("../../catalog/packages/consumer-language-insight/references/skills/required-evidence-coding.md"),
                ),
                (
                    "justoneapi-connector",
                    include_str!("../../catalog/packages/consumer-language-insight/references/skills/justoneapi-connector.md"),
                ),
            ],
        }),
        _ => None,
    }
}

#[tauri::command]
fn install_package(request: InstallRequest) -> Result<InstallResult, String> {
    let payload = package_payload(&request.package_id).ok_or_else(|| "该候选尚未生成可安装包。".to_string())?;
    install_payload(&request, &payload, &skills_directory()?, &app_state_directory()?)
        .map_err(|error| format!("安装失败：{error}"))
}

#[tauri::command]
fn uninstall_package(package_id: String) -> Result<InstallResult, String> {
    uninstall_payload(&package_id, &skills_directory()?, &app_state_directory()?)
        .map_err(|error| format!("卸载失败：{error}"))
}

#[tauri::command]
fn open_codex() -> Result<(), String> {
    let result = Command::new("open")
        .args(["-a", "Codex"])
        .status()
        .map_err(|error| format!("无法打开 Codex：{error}"))?;
    if result.success() {
        Ok(())
    } else {
        Err("系统没有找到 Codex.app。".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            detect_codex,
            install_package,
            uninstall_package,
            open_codex
        ])
        .run(tauri::generate_context!())
        .expect("error while running Open Marketing");
}
