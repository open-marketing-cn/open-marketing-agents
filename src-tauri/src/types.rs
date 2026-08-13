use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CodexStatus {
    pub cli_found: bool,
    pub cli_version: Option<String>,
    pub desktop_found: bool,
    pub logged_in: bool,
    pub skills_directory: String,
    pub message: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallRequest {
    pub package_id: String,
    pub optional_skill_ids: Vec<String>,
    pub permission_version: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallResult {
    pub status: String,
    pub path: Option<String>,
    pub backup_path: Option<String>,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallationRecord {
    pub package_id: String,
    pub version: String,
    pub permission_version: String,
    pub installed_path: String,
    pub content_hash: String,
    pub installed_at: String,
    pub optional_skill_ids: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct PackagePayload {
    pub id: &'static str,
    pub version: &'static str,
    pub status: &'static str,
    pub skill_md: &'static str,
    pub hidden_skills: &'static [(&'static str, &'static str)],
}
