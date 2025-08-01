// 設定ファイル読み込み用のユーティリティ

export interface Suspect {
  id: number
  name: string
  description: string
  avatar: string
  systemPrompts: {
    guilty: string
    innocent: string
  }
}

export interface CrimeScene {
  location: string
  time: string
  victim: string
  evidence: string
  details: string
}

export interface Background {
  image: string
  atmosphere: 'dark' | 'mysterious' | 'tense' | 'bright'
}

export interface Scenario {
  id: string
  title: string
  description: string
  criminalId: number
  background: Background
  crimeScene: CrimeScene
  results: {
    correctExplanation: string
    incorrectExplanations: Record<string, string>
  }
}

export interface GameSettings {
  gameplay: {
    maxQuestions: number
    typewriterSpeed: {
      normal: number
      punctuation: number
      space: number
      bracket: number
    }
    streamingSpeed: {
      normal: number
      punctuation: number
      space: number
    }
    delays: {
      fieldComplete: number
      gameStart: number
      skipAllowTime: number
      briefingComplete: number
      phaseTransition: number
      streamingComplete: number
    }
  }
  ui: {
    testimonyTabs: {
      showAll: boolean
      showCounts: boolean
    }
    suspects: {
      gridLayout: boolean
      showDescriptions: boolean
    }
  }
  api: {
    endpoints: {
      chat: string
    }
    retryAttempts: number
    timeout: number
  }
}

class ConfigLoader {
  private static suspectsCache: Suspect[] | null = null
  private static scenariosCache: Scenario[] | null = null
  private static settingsCache: GameSettings | null = null

  static async loadSuspects(): Promise<Suspect[]> {
    if (this.suspectsCache) {
      return this.suspectsCache
    }

    try {
      const response = await fetch('/config/suspects.json')
      if (!response.ok) {
        throw new Error(`Failed to load suspects: ${response.status}`)
      }
      this.suspectsCache = await response.json()
      return this.suspectsCache!
    } catch (error) {
      console.error('Error loading suspects:', error)
      throw error
    }
  }

  static async loadScenarios(): Promise<Scenario[]> {
    if (this.scenariosCache) {
      return this.scenariosCache
    }

    try {
      const response = await fetch('/config/scenarios.json')
      if (!response.ok) {
        throw new Error(`Failed to load scenarios: ${response.status}`)
      }
      this.scenariosCache = await response.json()
      return this.scenariosCache!
    } catch (error) {
      console.error('Error loading scenarios:', error)
      throw error
    }
  }

  static async loadGameSettings(): Promise<GameSettings> {
    if (this.settingsCache) {
      return this.settingsCache
    }

    try {
      const response = await fetch('/config/game-settings.json')
      if (!response.ok) {
        throw new Error(`Failed to load game settings: ${response.status}`)
      }
      this.settingsCache = await response.json()
      return this.settingsCache!
    } catch (error) {
      console.error('Error loading game settings:', error)
      throw error
    }
  }

  static async loadCurrentScenario(scenarioId?: string): Promise<{ scenario: Scenario; suspects: Suspect[] }> {
    const [scenarios, suspects] = await Promise.all([
      this.loadScenarios(),
      this.loadSuspects()
    ])

    // 指定されたIDのシナリオを取得、なければランダム選択
    let scenario: Scenario
    if (scenarioId) {
      scenario = scenarios.find(s => s.id === scenarioId) || scenarios[0]
    } else {
      // ランダムにシナリオを選択
      const randomIndex = Math.floor(Math.random() * scenarios.length)
      scenario = scenarios[randomIndex]
    }
    
    if (!scenario) {
      throw new Error('No scenarios available')
    }

    return { scenario, suspects }
  }

  static getSuspectSystemPrompt(suspectId: number, isGuilty: boolean, suspects: Suspect[]): string {
    const suspect = suspects.find(s => s.id === suspectId)
    if (!suspect) {
      return '容疑者として質問に答えてください。短く自然な日本語で答える。'
    }

    return isGuilty ? suspect.systemPrompts.guilty : suspect.systemPrompts.innocent
  }

  // キャッシュをクリアする（テスト用）
  static clearCache(): void {
    this.suspectsCache = null
    this.scenariosCache = null
    this.settingsCache = null
  }
}

export default ConfigLoader