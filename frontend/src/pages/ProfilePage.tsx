import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface UserStats {
  totalGames: number
  correctAnswers: number
  winRate: number
  maxStreak: number
  currentStreak: number
  averageQuestions: number
}

interface GameHistory {
  id: number
  date: Date
  isCorrect: boolean
  selectedSuspect: string
  correctSuspect: string
  questionsUsed: number
}

const ProfilePage = () => {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [history, setHistory] = useState<GameHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 実際にはAPIからユーザーデータを取得
    // 今はモックデータを使用
    const mockStats: UserStats = {
      totalGames: 15,
      correctAnswers: 11,
      winRate: 73.3,
      maxStreak: 4,
      currentStreak: 2,
      averageQuestions: 3.8
    }

    const mockHistory: GameHistory[] = [
      {
        id: 1,
        date: new Date('2025-06-20T14:30:00'),
        isCorrect: true,
        selectedSuspect: '佐藤花子',
        correctSuspect: '佐藤花子',
        questionsUsed: 4
      },
      {
        id: 2,
        date: new Date('2025-06-20T13:15:00'),
        isCorrect: false,
        selectedSuspect: '田中太郎',
        correctSuspect: '山田次郎',
        questionsUsed: 5
      },
      {
        id: 3,
        date: new Date('2025-06-19T16:45:00'),
        isCorrect: true,
        selectedSuspect: '佐藤花子',
        correctSuspect: '佐藤花子',
        questionsUsed: 3
      },
      {
        id: 4,
        date: new Date('2025-06-19T15:20:00'),
        isCorrect: true,
        selectedSuspect: '山田次郎',
        correctSuspect: '山田次郎',
        questionsUsed: 4
      },
      {
        id: 5,
        date: new Date('2025-06-18T19:10:00'),
        isCorrect: false,
        selectedSuspect: '田中太郎',
        correctSuspect: '佐藤花子',
        questionsUsed: 5
      }
    ]

    setTimeout(() => {
      setStats(mockStats)
      setHistory(mockHistory)
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="profile-page loading">
        <div className="loading-content">
          <h1>📊 データ読み込み中...</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <Link to="/" className="back-button">← ホームに戻る</Link>
        <h1>👤 プロフィール</h1>
      </header>

      <div className="profile-content">
        <section className="user-info">
          <div className="user-avatar">🕵️‍♂️</div>
          <h2>ワトソン</h2>
          <p className="user-title">見習い探偵</p>
        </section>

        {stats && (
          <section className="stats-section">
            <h3>📈 統計情報</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">🎮</span>
                <span className="stat-number">{stats.totalGames}</span>
                <span className="stat-label">総プレイ数</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✅</span>
                <span className="stat-number">{stats.correctAnswers}</span>
                <span className="stat-label">正解数</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🎯</span>
                <span className="stat-number">{stats.winRate.toFixed(1)}%</span>
                <span className="stat-label">正解率</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🔥</span>
                <span className="stat-number">{stats.maxStreak}</span>
                <span className="stat-label">最高連続正解</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⚡</span>
                <span className="stat-number">{stats.currentStreak}</span>
                <span className="stat-label">現在の連続正解</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">❓</span>
                <span className="stat-number">{stats.averageQuestions.toFixed(1)}</span>
                <span className="stat-label">平均質問数</span>
              </div>
            </div>
          </section>
        )}

        <section className="achievements">
          <h3>🏆 実績</h3>
          <div className="achievements-grid">
            <div className="achievement earned">
              <span className="achievement-icon">🔍</span>
              <div className="achievement-info">
                <h4>初心者探偵</h4>
                <p>初回プレイクリア</p>
              </div>
            </div>
            <div className="achievement earned">
              <span className="achievement-icon">🎯</span>
              <div className="achievement-info">
                <h4>鋭い洞察</h4>
                <p>3回連続正解</p>
              </div>
            </div>
            <div className="achievement locked">
              <span className="achievement-icon">🏅</span>
              <div className="achievement-info">
                <h4>名探偵</h4>
                <p>5回連続正解</p>
              </div>
            </div>
            <div className="achievement locked">
              <span className="achievement-icon">👑</span>
              <div className="achievement-info">
                <h4>推理の王</h4>
                <p>正解率90%達成</p>
              </div>
            </div>
          </div>
        </section>

        <section className="history-section">
          <h3>📜 プレイ履歴</h3>
          <div className="history-list">
            {history.map(game => (
              <div key={game.id} className={`history-item ${game.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="history-result">
                  {game.isCorrect ? '✅' : '❌'}
                </div>
                <div className="history-details">
                  <div className="history-date">
                    {game.date.toLocaleDateString('ja-JP')} {game.date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="history-info">
                    <span>選択: {game.selectedSuspect}</span>
                    <span>正解: {game.correctSuspect}</span>
                    <span>質問数: {game.questionsUsed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-actions">
          <Link to="/game" className="play-button">
            🎮 ゲームをプレイ
          </Link>
          <button className="settings-button">
            ⚙️ 設定
          </button>
        </section>
      </div>
    </div>
  )
}

export default ProfilePage
