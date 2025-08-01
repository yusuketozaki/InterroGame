// ゲームデータの保存・読み込み機能

export interface SurveyData {
  gameId: string
  overallSatisfaction: number      // 全体的な満足度 (1-5)
  difficultyAppropriate: number    // 難易度の適切さ (1-5)
  aiCharacterRealism: number       // AIキャラクターのリアリティ (1-5)
  mysteryInteresting: number       // 推理要素の面白さ (1-5)
  freeComment?: string            // 自由コメント（オプション）
  timestamp: number
}

export interface GameData {
  id: string
  timestamp: number
  selectedSuspect: number
  correctSuspect: number
  isCorrect: boolean
  questionsUsed: number
  playTimeSeconds: number
  testimonies: Array<{
    suspectId: number
    question: string
    answer: string
    timestamp: Date
  }>
  surveyData?: SurveyData  // アンケートデータ（後から追加される）
}

export interface GameStats {
  totalGames: number
  correctGames: number
  winRate: number
  currentStreak: number
  maxStreak: number
  averagePlayTime: number
  totalPlayTime: number
  suspectAccuracy: {
    [suspectId: number]: {
      totalSelected: number
      correctSelections: number
      accuracy: number
    }
  }
  questionsStats: {
    averageQuestionsUsed: number
    minQuestionsUsed: number
    maxQuestionsUsed: number
  }
}

class GameStorageManager {
  private readonly STORAGE_KEY = 'interro_game_data'

  // ゲームデータを保存
  saveGameData(gameData: GameData): void {
    try {
      const existingData = this.getAllGameData()
      existingData.push(gameData)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData))
    } catch (error) {
      console.error('ゲームデータの保存に失敗:', error)
    }
  }

  // 全ゲームデータを取得
  getAllGameData(): GameData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('ゲームデータの読み込みに失敗:', error)
      return []
    }
  }

  // 統計情報を計算
  calculateStats(): GameStats {
    const gameData = this.getAllGameData()

    if (gameData.length === 0) {
      return {
        totalGames: 0,
        correctGames: 0,
        winRate: 0,
        currentStreak: 0,
        maxStreak: 0,
        averagePlayTime: 0,
        totalPlayTime: 0,
        suspectAccuracy: {},
        questionsStats: {
          averageQuestionsUsed: 0,
          minQuestionsUsed: 0,
          maxQuestionsUsed: 0
        }
      }
    }

    const totalGames = gameData.length
    const correctGames = gameData.filter(game => game.isCorrect).length
    const winRate = Math.round((correctGames / totalGames) * 100)

    // 連続正解の計算
    let currentStreak = 0
    let maxStreak = 0
    let tempStreak = 0

    // 最新のゲームから遡って現在の連続正解を計算
    for (let i = gameData.length - 1; i >= 0; i--) {
      if (gameData[i].isCorrect) {
        currentStreak++
      } else {
        break
      }
    }

    // 最大連続正解を計算
    for (const game of gameData) {
      if (game.isCorrect) {
        tempStreak++
        maxStreak = Math.max(maxStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }

    // プレイ時間の統計
    const totalPlayTime = gameData.reduce((sum, game) => sum + game.playTimeSeconds, 0)
    const averagePlayTime = Math.round(totalPlayTime / totalGames)

    // 容疑者別の正解率
    const suspectAccuracy: GameStats['suspectAccuracy'] = {}
    for (let suspectId = 1; suspectId <= 3; suspectId++) {
      const suspectGames = gameData.filter(game => game.selectedSuspect === suspectId)
      const correctSuspectGames = suspectGames.filter(game => game.isCorrect)

      suspectAccuracy[suspectId] = {
        totalSelected: suspectGames.length,
        correctSelections: correctSuspectGames.length,
        accuracy: suspectGames.length > 0 ? Math.round((correctSuspectGames.length / suspectGames.length) * 100) : 0
      }
    }

    // 質問数の統計
    const questionsUsed = gameData.map(game => game.questionsUsed)
    const questionsStats = {
      averageQuestionsUsed: Math.round(questionsUsed.reduce((sum, q) => sum + q, 0) / questionsUsed.length),
      minQuestionsUsed: Math.min(...questionsUsed),
      maxQuestionsUsed: Math.max(...questionsUsed)
    }

    return {
      totalGames,
      correctGames,
      winRate,
      currentStreak,
      maxStreak,
      averagePlayTime,
      totalPlayTime,
      suspectAccuracy,
      questionsStats
    }
  }

  // データをクリア（デバッグ用）
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  // 最近のゲーム履歴を取得
  getRecentGames(limit: number = 10): GameData[] {
    const allData = this.getAllGameData()
    return allData
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  // アンケートデータを保存
  saveSurveyData(gameId: string, surveyData: Omit<SurveyData, 'gameId' | 'timestamp'>): void {
    try {
      const existingData = this.getAllGameData()
      const gameIndex = existingData.findIndex(game => game.id === gameId)

      if (gameIndex !== -1) {
        const fullSurveyData: SurveyData = {
          gameId,
          timestamp: Date.now(),
          ...surveyData
        }
        existingData[gameIndex].surveyData = fullSurveyData
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData))
      } else {
        throw new Error(`Game with ID ${gameId} not found`)
      }
    } catch (error) {
      console.error('アンケートデータの保存に失敗:', error)
      throw error
    }
  }

  // 特定のゲームデータを取得
  getGameData(gameId: string): GameData | null {
    try {
      const allData = this.getAllGameData()
      return allData.find(game => game.id === gameId) || null
    } catch (error) {
      console.error('ゲームデータの取得に失敗:', error)
      return null
    }
  }

  // アンケート結果をCSV形式で出力
  exportSurveyDataAsCSV(): string {
    const allData = this.getAllGameData()
    const surveysData = allData.filter(game => game.surveyData)

    const header = [
      'ゲームID',
      'プレイ日時',
      '正解/不正解',
      '選択した容疑者',
      '正解の容疑者',
      '使用質問数',
      'プレイ時間(秒)',
      '全体的な満足度',
      '難易度の適切さ',
      'AIキャラクターのリアリティ',
      '推理要素の面白さ',
      '自由コメント',
      'アンケート回答日時'
    ].join(',')

    const rows = surveysData.map(game => {
      const survey = game.surveyData!
      return [
        `"${game.id}"`,
        `"${new Date(game.timestamp).toLocaleString('ja-JP')}"`,
        game.isCorrect ? '正解' : '不正解',
        game.selectedSuspect,
        game.correctSuspect,
        game.questionsUsed,
        game.playTimeSeconds,
        survey.overallSatisfaction,
        survey.difficultyAppropriate,
        survey.aiCharacterRealism,
        survey.mysteryInteresting,
        `"${survey.freeComment || ''}"`,
        `"${new Date(survey.timestamp).toLocaleString('ja-JP')}"`
      ].join(',')
    })

    return [header, ...rows].join('\n')
  }

  // ゲーム履歴をCSV形式で出力（対話履歴付き）
  exportGameHistoryAsCSV(): string {
    const allData = this.getAllGameData()

    const header = [
      'ゲームID',
      'プレイ日時',
      '正解/不正解',
      '選択した容疑者',
      '正解の容疑者',
      '使用質問数',
      'プレイ時間(秒)',
      '容疑者ID',
      '質問',
      '回答',
      '質問時刻'
    ].join(',')

    const rows: string[] = []

    allData.forEach(game => {
      game.testimonies.forEach(testimony => {
        rows.push([
          `"${game.id}"`,
          `"${new Date(game.timestamp).toLocaleString('ja-JP')}"`,
          game.isCorrect ? '正解' : '不正解',
          game.selectedSuspect,
          game.correctSuspect,
          game.questionsUsed,
          game.playTimeSeconds,
          testimony.suspectId,
          `"${testimony.question}"`,
          `"${testimony.answer}"`,
          `"${new Date(testimony.timestamp).toLocaleString('ja-JP')}"`
        ].join(','))
      })
    })

    return [header, ...rows].join('\n')
  }

  // ゲームIDを生成
  generateGameId(): string {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// シングルトンインスタンス
export const gameStorage = new GameStorageManager()
