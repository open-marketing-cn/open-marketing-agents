use crate::types::{InstallRequest, InstallResult, InstallationRecord, PackagePayload};
use chrono::Utc;
use sha2::{Digest, Sha256};
use std::fs;
use std::io;
use std::path::{Path, PathBuf};

const LEDGER_FILE: &str = "installations.json";

pub fn safe_package_id(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= 80
        && value
            .bytes()
            .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-')
}

fn hash_directory(path: &Path) -> io::Result<String> {
    let mut files = Vec::new();
    collect_files(path, path, &mut files)?;
    files.sort_by(|a, b| a.0.cmp(&b.0));

    let mut hasher = Sha256::new();
    for (relative, bytes) in files {
        hasher.update(relative.as_bytes());
        hasher.update([0]);
        hasher.update(bytes);
        hasher.update([0]);
    }
    Ok(format!("{:x}", hasher.finalize()))
}

fn collect_files(root: &Path, current: &Path, output: &mut Vec<(String, Vec<u8>)>) -> io::Result<()> {
    if !current.exists() {
        return Ok(());
    }
    for entry in fs::read_dir(current)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            collect_files(root, &path, output)?;
        } else {
            let relative = path
                .strip_prefix(root)
                .unwrap_or(&path)
                .to_string_lossy()
                .replace('\\', "/");
            output.push((relative, fs::read(path)?));
        }
    }
    Ok(())
}

fn load_ledger(app_state: &Path) -> io::Result<Vec<InstallationRecord>> {
    let path = app_state.join(LEDGER_FILE);
    if !path.exists() {
        return Ok(Vec::new());
    }
    let bytes = fs::read(path)?;
    serde_json::from_slice(&bytes).map_err(|error| io::Error::new(io::ErrorKind::InvalidData, error))
}

fn save_ledger(app_state: &Path, records: &[InstallationRecord]) -> io::Result<()> {
    fs::create_dir_all(app_state)?;
    let path = app_state.join(LEDGER_FILE);
    let temporary = app_state.join(format!("{LEDGER_FILE}.tmp"));
    let bytes = serde_json::to_vec_pretty(records)
        .map_err(|error| io::Error::new(io::ErrorKind::InvalidData, error))?;
    fs::write(&temporary, bytes)?;
    fs::rename(temporary, path)
}

fn backup_directory(source: &Path, app_state: &Path, package_id: &str) -> io::Result<PathBuf> {
    let stamp = Utc::now().format("%Y%m%dT%H%M%SZ");
    let destination = app_state.join("backups").join(format!("{package_id}-{stamp}"));
    copy_directory(source, &destination)?;
    Ok(destination)
}

fn copy_directory(source: &Path, destination: &Path) -> io::Result<()> {
    fs::create_dir_all(destination)?;
    for entry in fs::read_dir(source)? {
        let entry = entry?;
        let source_path = entry.path();
        let destination_path = destination.join(entry.file_name());
        if source_path.is_dir() {
            copy_directory(&source_path, &destination_path)?;
        } else {
            fs::copy(source_path, destination_path)?;
        }
    }
    Ok(())
}

fn write_payload(
    payload: &PackagePayload,
    destination: &Path,
    optional_skill_ids: &[String],
) -> io::Result<()> {
    fs::create_dir_all(destination)?;
    fs::write(destination.join("SKILL.md"), payload.skill_md)?;

    let hidden_dir = destination.join("references").join("skills");
    for (id, content) in payload.hidden_skills {
        if optional_skill_ids.iter().any(|selected| selected == id) || id.starts_with("required-") {
            fs::create_dir_all(&hidden_dir)?;
            fs::write(hidden_dir.join(format!("{id}.md")), content)?;
        }
    }
    Ok(())
}

pub fn install_payload(
    request: &InstallRequest,
    payload: &PackagePayload,
    skills_root: &Path,
    app_state: &Path,
) -> io::Result<InstallResult> {
    if !safe_package_id(&request.package_id) || request.package_id != payload.id {
        return Ok(blocked("安装包 ID 不合法或与清单不一致。"));
    }
    if payload.status != "installable" {
        return Ok(blocked("该 Agent 尚未完成真实任务验证，Open Marketing 已禁止安装。"));
    }
    if request.permission_version != payload.version {
        return Ok(blocked("权限说明版本已更新，请返回详情重新确认。"));
    }

    fs::create_dir_all(skills_root)?;
    let destination = skills_root.join(format!("open-marketing-{}", payload.id));
    let mut ledger = load_ledger(app_state)?;
    let existing_record = ledger.iter().find(|record| record.package_id == payload.id).cloned();
    let mut backup_path = None;

    if destination.exists() {
        let current_hash = hash_directory(&destination)?;
        let known_hash = existing_record.as_ref().map(|record| record.content_hash.as_str());
        if known_hash != Some(current_hash.as_str()) {
            let backup = backup_directory(&destination, app_state, payload.id)?;
            backup_path = Some(backup.to_string_lossy().to_string());
        }
        fs::remove_dir_all(&destination)?;
    }

    let temporary = skills_root.join(format!(".open-marketing-{}.tmp", payload.id));
    if temporary.exists() {
        fs::remove_dir_all(&temporary)?;
    }
    write_payload(payload, &temporary, &request.optional_skill_ids)?;
    fs::rename(&temporary, &destination)?;
    let content_hash = hash_directory(&destination)?;

    ledger.retain(|record| record.package_id != payload.id);
    ledger.push(InstallationRecord {
        package_id: payload.id.to_string(),
        version: payload.version.to_string(),
        permission_version: request.permission_version.clone(),
        installed_path: destination.to_string_lossy().to_string(),
        content_hash,
        installed_at: Utc::now().to_rfc3339(),
        optional_skill_ids: request.optional_skill_ids.clone(),
    });
    save_ledger(app_state, &ledger)?;

    Ok(InstallResult {
        status: if existing_record.is_some() { "updated" } else { "installed" }.to_string(),
        path: Some(destination.to_string_lossy().to_string()),
        backup_path,
        message: "已安装到 Codex。重新打开技能列表即可看到这个营销 Agent。".to_string(),
    })
}

pub fn uninstall_payload(package_id: &str, skills_root: &Path, app_state: &Path) -> io::Result<InstallResult> {
    if !safe_package_id(package_id) {
        return Ok(blocked("安装包 ID 不合法。"));
    }
    let destination = skills_root.join(format!("open-marketing-{package_id}"));
    let mut ledger = load_ledger(app_state)?;
    let record = ledger.iter().find(|item| item.package_id == package_id).cloned();
    if !destination.exists() {
        ledger.retain(|item| item.package_id != package_id);
        save_ledger(app_state, &ledger)?;
        return Ok(InstallResult {
            status: "removed".to_string(),
            path: None,
            backup_path: None,
            message: "Codex 中没有找到这个 Agent，安装记录已清理。".to_string(),
        });
    }

    let current_hash = hash_directory(&destination)?;
    let modified = record.as_ref().map(|item| item.content_hash.as_str()) != Some(current_hash.as_str());
    let backup_path = if modified {
        Some(backup_directory(&destination, app_state, package_id)?.to_string_lossy().to_string())
    } else {
        None
    };
    fs::remove_dir_all(&destination)?;
    ledger.retain(|item| item.package_id != package_id);
    save_ledger(app_state, &ledger)?;

    Ok(InstallResult {
        status: "removed".to_string(),
        path: Some(destination.to_string_lossy().to_string()),
        backup_path,
        message: if modified {
            "已卸载；检测到用户修改，卸载前已自动备份。"
        } else {
            "已从 Codex 卸载。"
        }
        .to_string(),
    })
}

fn blocked(message: &str) -> InstallResult {
    InstallResult {
        status: "blocked".to_string(),
        path: None,
        backup_path: None,
        message: message.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    const PAYLOAD: PackagePayload = PackagePayload {
        id: "test-agent",
        version: "0.1.0",
        status: "installable",
        skill_md: "---\nname: Test Agent\ndescription: test\n---\n# Test\n",
        hidden_skills: &[("required-source-plan", "# Required"), ("optional-api", "# Optional")],
    };

    #[test]
    fn rejects_unsafe_ids() {
        assert!(safe_package_id("consumer-language-insight"));
        assert!(!safe_package_id("../escape"));
        assert!(!safe_package_id("Agent With Spaces"));
    }

    #[test]
    fn installs_agent_with_hidden_skills_and_ledger() {
        let root = tempdir().unwrap();
        let skills = root.path().join("skills");
        let state = root.path().join("state");
        let request = InstallRequest {
            package_id: "test-agent".to_string(),
            optional_skill_ids: vec!["optional-api".to_string()],
            permission_version: "0.1.0".to_string(),
        };
        let result = install_payload(&request, &PAYLOAD, &skills, &state).unwrap();
        let installed = skills.join("open-marketing-test-agent");
        assert_eq!(result.status, "installed");
        assert!(installed.join("SKILL.md").exists());
        assert!(installed.join("references/skills/required-source-plan.md").exists());
        assert!(installed.join("references/skills/optional-api.md").exists());
        assert!(state.join(LEDGER_FILE).exists());
    }

    #[test]
    fn blocks_unvalidated_payloads() {
        let root = tempdir().unwrap();
        let payload = PackagePayload { status: "pending_validation", ..PAYLOAD };
        let request = InstallRequest {
            package_id: "test-agent".to_string(),
            optional_skill_ids: vec![],
            permission_version: "0.1.0".to_string(),
        };
        let result = install_payload(&request, &payload, &root.path().join("skills"), &root.path().join("state")).unwrap();
        assert_eq!(result.status, "blocked");
    }

    #[test]
    fn backs_up_user_changes_before_uninstall() {
        let root = tempdir().unwrap();
        let skills = root.path().join("skills");
        let state = root.path().join("state");
        let request = InstallRequest {
            package_id: "test-agent".to_string(),
            optional_skill_ids: vec![],
            permission_version: "0.1.0".to_string(),
        };
        install_payload(&request, &PAYLOAD, &skills, &state).unwrap();
        fs::write(skills.join("open-marketing-test-agent/SKILL.md"), "user edit").unwrap();
        let result = uninstall_payload("test-agent", &skills, &state).unwrap();
        assert_eq!(result.status, "removed");
        assert!(result.backup_path.is_some());
    }
}
