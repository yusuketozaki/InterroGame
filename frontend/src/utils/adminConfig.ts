// 管理者設定用のユーティリティ
import type { Suspect } from './configLoader'

export interface AdminConfig {
  model: string
  suspects: Suspect[]
  lastUpdated: string
}

export interface ModelOption {
  id: string
  name: string
  description: string
  available: boolean
}

class AdminConfigManager {
  private static readonly STORAGE_KEY = 'interroGame_adminConfig'
  private static readonly DEFAULT_MODEL = 'qwen3:8b'

  // 利用可能なモデル一覧
  static getAvailableModels(): ModelOption[] {
    return [
      {
        id: 'qwen3:8b',
        name: 'Qwen 3 (8B)',
        description: '推理ゲーム用に最適化されたモデル',
        available: true
      },
      {
        id: 'qwen3:30b',
        name: 'Qwen 3 (30B)',
        description: '高性能大型モデル（要GPU メモリ）',
        available: true
      },
      {
        id: 'qwen2.5:7b',
        name: 'Qwen 2.5 (7B)',
        description: '軽量版モデル',
        available: true
      },
      {
        id: 'llama3.2:8b',
        name: 'Llama 3.2 (8B)',
        description: 'Meta社のオープンソースモデル',
        available: false
      },
      {
        id: 'mistral:7b',
        name: 'Mistral (7B)',
        description: 'フランス製の高性能モデル',
        available: false
      }
    ]
  }

  // 現在の設定を取得
  static getConfig(): AdminConfig | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null
      return JSON.parse(stored)
    } catch (error) {
      console.error('Failed to load admin config:', error)
      return null
    }
  }

  // 設定を保存
  static saveConfig(config: AdminConfig): boolean {
    try {
      config.lastUpdated = new Date().toISOString()
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config))
      return true
    } catch (error) {
      console.error('Failed to save admin config:', error)
      return false
    }
  }

  // 現在使用中のモデルを取得
  static getCurrentModel(): string {
    const config = this.getConfig()
    return config?.model || this.DEFAULT_MODEL
  }

  // モデルを変更
  static setModel(modelId: string): boolean {
    let config = this.getConfig()
    if (!config) {
      // 初回の場合、デフォルト設定を作成
      config = {
        model: this.DEFAULT_MODEL,
        suspects: [],
        lastUpdated: new Date().toISOString()
      }
    }
    config.model = modelId
    return this.saveConfig(config)
  }

  // カスタム容疑者設定を取得
  static getCustomSuspects(): Suspect[] | null {
    const config = this.getConfig()
    return config?.suspects || null
  }

  // カスタム容疑者設定を保存
  static saveCustomSuspects(suspects: Suspect[]): boolean {
    let config = this.getConfig()
    if (!config) {
      config = {
        model: this.DEFAULT_MODEL,
        suspects: [],
        lastUpdated: new Date().toISOString()
      }
    }
    config.suspects = suspects
    return this.saveConfig(config)
  }

  // 設定をリセット
  static resetConfig(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Failed to reset admin config:', error)
      return false
    }
  }

  // 設定をエクスポート
  static exportConfig(): string {
    const config = this.getConfig()
    if (!config) {
      throw new Error('No configuration to export')
    }
    return JSON.stringify(config, null, 2)
  }

  // 設定をインポート
  static importConfig(jsonString: string): boolean {
    try {
      const config = JSON.parse(jsonString) as AdminConfig
      // 基本的なバリデーション
      if (!config.model || !Array.isArray(config.suspects)) {
        throw new Error('Invalid configuration format')
      }
      return this.saveConfig(config)
    } catch (error) {
      console.error('Failed to import config:', error)
      return false
    }
  }
}

export default AdminConfigManager
