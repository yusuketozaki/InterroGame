import { useState, useEffect } from 'react'
import type { Suspect } from '../utils/configLoader'
import AdminConfigManager, { type ModelOption } from '../utils/adminConfig'
import ConfigLoader from '../utils/configLoader'

const AdminSettingsPage = () => {
  const [currentModel, setCurrentModel] = useState<string>('')
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([])
  const [suspects, setSuspects] = useState<Suspect[]>([])
  const [editingSuspect, setEditingSuspect] = useState<Suspect | null>(null)
  const [showImportExport, setShowImportExport] = useState(false)
  const [importText, setImportText] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setCurrentModel(AdminConfigManager.getCurrentModel())
      setAvailableModels(AdminConfigManager.getAvailableModels())

      // 現在の容疑者設定を読み込み
      const loadedSuspects = await ConfigLoader.loadSuspects()
      setSuspects(loadedSuspects)
    } catch (error) {
      console.error('Failed to load settings:', error)
      showMessage('設定の読み込みに失敗しました', 'error')
    }
  }

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleModelChange = (modelId: string) => {
    if (AdminConfigManager.setModel(modelId)) {
      setCurrentModel(modelId)
      showMessage('モデルを変更しました', 'success')
    } else {
      showMessage('モデルの変更に失敗しました', 'error')
    }
  }

  const handleSuspectEdit = (suspect: Suspect) => {
    setEditingSuspect({ ...suspect })
  }

  const handleSuspectSave = () => {
    if (!editingSuspect) return

    const updatedSuspects = suspects.map(s =>
      s.id === editingSuspect.id ? editingSuspect : s
    )

    if (AdminConfigManager.saveCustomSuspects(updatedSuspects)) {
      setSuspects(updatedSuspects)
      setEditingSuspect(null)
      ConfigLoader.clearCache() // キャッシュをクリア
      showMessage('容疑者設定を保存しました', 'success')
    } else {
      showMessage('保存に失敗しました', 'error')
    }
  }

  const handleResetSettings = () => {
    if (confirm('すべての管理者設定をリセットしますか？この操作は取り消せません。')) {
      if (AdminConfigManager.resetConfig()) {
        ConfigLoader.clearCache()
        loadSettings()
        showMessage('設定をリセットしました', 'success')
      } else {
        showMessage('リセットに失敗しました', 'error')
      }
    }
  }

  const handleExportConfig = () => {
    try {
      const config = AdminConfigManager.exportConfig()
      navigator.clipboard.writeText(config)
      showMessage('設定をクリップボードにコピーしました', 'success')
    } catch (error) {
      showMessage('エクスポートに失敗しました', 'error')
    }
  }

  const handleImportConfig = () => {
    if (!importText.trim()) {
      showMessage('設定データを入力してください', 'error')
      return
    }

    if (AdminConfigManager.importConfig(importText)) {
      ConfigLoader.clearCache()
      loadSettings()
      setImportText('')
      setShowImportExport(false)
      showMessage('設定をインポートしました', 'success')
    } else {
      showMessage('無効な設定データです', 'error')
    }
  }

  return (
    <div className="admin-settings-page">
      <div className="container">
        <div className="page-header">
          <h1>⚙️ 管理者設定</h1>
          <p>AIモデルと容疑者のプロンプトを管理</p>
        </div>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* AIモデル設定 */}
        <section className="settings-section">
          <h2>🤖 AIモデル設定</h2>
          <div className="model-selection">
            <p>現在のモデル: <strong>{currentModel}</strong></p>
            <div className="model-grid">
              {availableModels.map(model => (
                <div
                  key={model.id}
                  className={`model-card ${currentModel === model.id ? 'active' : ''} ${!model.available ? 'disabled' : ''}`}
                >
                  <div className="model-info">
                    <h3>{model.name}</h3>
                    <p>{model.description}</p>
                    {!model.available && <span className="unavailable">利用不可</span>}
                  </div>
                  {model.available && (
                    <button
                      onClick={() => handleModelChange(model.id)}
                      disabled={currentModel === model.id}
                      className="select-button"
                    >
                      {currentModel === model.id ? '使用中' : '選択'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 容疑者設定 */}
        <section className="settings-section">
          <h2>👥 容疑者プロンプト設定</h2>
          <div className="suspects-grid">
            {suspects.map(suspect => (
              <div key={suspect.id} className="suspect-card">
                <div className="suspect-header">
                  <img src={suspect.avatar} alt={suspect.name} className="suspect-avatar" />
                  <div>
                    <h3>{suspect.name}</h3>
                    <p>{suspect.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSuspectEdit(suspect)}
                  className="edit-button"
                >
                  編集
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 設定管理 */}
        <section className="settings-section">
          <h2>📁 設定管理</h2>
          <div className="config-management">
            <button
              onClick={() => setShowImportExport(!showImportExport)}
              className="toggle-button"
            >
              インポート/エクスポート
            </button>
            <button
              onClick={handleResetSettings}
              className="danger-button"
            >
              設定をリセット
            </button>
          </div>

          {showImportExport && (
            <div className="import-export-panel">
              <div className="export-section">
                <h4>エクスポート</h4>
                <button onClick={handleExportConfig} className="export-button">
                  クリップボードにコピー
                </button>
              </div>
              <div className="import-section">
                <h4>インポート</h4>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="設定JSONを貼り付けてください"
                  rows={6}
                  className="import-textarea"
                />
                <button onClick={handleImportConfig} className="import-button">
                  インポート
                </button>
              </div>
            </div>
          )}
        </section>

        {/* プロンプト編集モーダル */}
        {editingSuspect && (
          <div className="modal-overlay" onClick={() => setEditingSuspect(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingSuspect.name} のプロンプト編集</h2>
                <button
                  onClick={() => setEditingSuspect(null)}
                  className="close-button"
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="prompt-section">
                  <h3>犯人時のプロンプト</h3>
                  <textarea
                    value={editingSuspect.systemPrompts.guilty}
                    onChange={(e) => setEditingSuspect({
                      ...editingSuspect,
                      systemPrompts: {
                        ...editingSuspect.systemPrompts,
                        guilty: e.target.value
                      }
                    })}
                    rows={8}
                    className="prompt-textarea"
                  />
                </div>

                <div className="prompt-section">
                  <h3>無実時のプロンプト</h3>
                  <textarea
                    value={editingSuspect.systemPrompts.innocent}
                    onChange={(e) => setEditingSuspect({
                      ...editingSuspect,
                      systemPrompts: {
                        ...editingSuspect.systemPrompts,
                        innocent: e.target.value
                      }
                    })}
                    rows={8}
                    className="prompt-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => setEditingSuspect(null)} className="cancel-button">
                  キャンセル
                </button>
                <button onClick={handleSuspectSave} className="save-button">
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSettingsPage
