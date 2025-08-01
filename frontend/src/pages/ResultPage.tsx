import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { gameStorage } from '../utils/gameStorage'
import type { GameStats } from '../utils/gameStorage'
import ConfigLoader, { type Suspect } from '../utils/configLoader'

interface GameResult {
  selectedSuspect: number
  correctSuspect: number
  isCorrect: boolean
  explanation: string
}

const ResultPage = () => {
  const [searchParams] = useSearchParams()
  const [result, setResult] = useState<GameResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<GameStats | null>(null)
  const [gameId, setGameId] = useState<string | null>(null)

  const [suspects, setSuspects] = useState<Suspect[]>([])

  useEffect(() => {
    const loadResultData = async () => {
      try {
        const selectedId = parseInt(searchParams.get('selected') || '1')
        const currentGameId = searchParams.get('gameId')
        setGameId(currentGameId)

        // 設定データを読み込み
        const { scenario, suspects: loadedSuspects } = await ConfigLoader.loadCurrentScenario()
        setSuspects(loadedSuspects)

        // 統計情報を読み込み
        const currentStats = gameStorage.calculateStats()
        setStats(currentStats)

        // 結果を生成
        const isCorrect = selectedId === scenario.criminalId
        const explanation = isCorrect
          ? scenario.results.correctExplanation
          : scenario.results.incorrectExplanations[selectedId.toString()] || '不正解でした。'

        const mockResult: GameResult = {
          selectedSuspect: selectedId,
          correctSuspect: scenario.criminalId,
          isCorrect,
          explanation
        }

        setTimeout(() => {
          setResult(mockResult)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Failed to load result data:', error)
        setLoading(false)
      }
    }

    loadResultData()
  }, [searchParams])

  if (loading) {
    return (
      <div className="result-page loading">
        <div className="loading-content">
          <h1>🔍 推理を検証中...</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (!result) {
    return <div>エラーが発生しました</div>
  }

  const selectedSuspect = suspects.find(s => s.id === result.selectedSuspect)
  const correctSuspect = suspects.find(s => s.id === result.correctSuspect)

  return (
    <div className="result-page">
      <header className="result-header">
        <h1>🕵️‍♂️ 推理結果</h1>
      </header>

      <div className="result-content">
        <div className={`result-status ${result.isCorrect ? 'correct' : 'incorrect'}`}>
          {result.isCorrect ? (
            <div className="success-result">
              <h2>🎉 正解！</h2>
              <p>見事に犯人を見抜きました！</p>
            </div>
          ) : (
            <div className="failure-result">
              <h2>❌ 不正解</h2>
              <p>犯人を特定できませんでした</p>
            </div>
          )}
        </div>

        <div className="selection-summary">
          <h3>あなたの選択</h3>
          <div className="selected-suspect">
            <img src={selectedSuspect?.avatar} alt={selectedSuspect?.name} className="suspect-avatar" />
            <span className="suspect-name">{selectedSuspect?.name}</span>
          </div>
        </div>

        {!result.isCorrect && (
          <div className="correct-answer">
            <h3>正解</h3>
            <div className="correct-suspect">
              <img src={correctSuspect?.avatar} alt={correctSuspect?.name} className="suspect-avatar" />
              <span className="suspect-name">{correctSuspect?.name}</span>
            </div>
          </div>
        )}

        <div className="explanation">
          <h3>解説</h3>
          <p>{result.explanation}</p>
        </div>

        <div className="result-actions">
          <Link to="/game" className="play-again-button">
            🔄 もう一度プレイ
          </Link>
          <Link to="/" className="home-button">
            🏠 ホームに戻る
          </Link>
          <Link to="/profile" className="profile-button">
            📊 成績を確認
          </Link>
          {gameId && (
            <Link to={`/survey?gameId=${gameId}`} className="survey-button">
              📝 アンケートに回答
            </Link>
          )}
        </div>

        <div className="game-stats">
          <h3>📈 統計情報</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">正解率</span>
              <span className="stat-value">{stats?.winRate || 0}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">プレイ回数</span>
              <span className="stat-value">{stats?.totalGames || 0}回</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">最高連続正解</span>
              <span className="stat-value">{stats?.maxStreak || 0}回</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">現在の連続正解</span>
              <span className="stat-value">{stats?.currentStreak || 0}回</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">平均プレイ時間</span>
              <span className="stat-value">{stats ? Math.floor(stats.averagePlayTime / 60) : 0}分{stats ? stats.averagePlayTime % 60 : 0}秒</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">平均質問数</span>
              <span className="stat-value">{stats?.questionsStats.averageQuestionsUsed || 0}問</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultPage
