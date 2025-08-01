import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gameStorage } from '../utils/gameStorage'
import type { GameStats, GameData } from '../utils/gameStorage'
import ConfigLoader, { type Suspect } from '../utils/configLoader'

interface DetailedGameData extends GameData {
  // 追加のプロパティがあれば定義
}

const ProfilePage = () => {
  const [stats, setStats] = useState<GameStats | null>(null)
  const [history, setHistory] = useState<DetailedGameData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'surveys' | 'admin'>('history')
  const [suspects, setSuspects] = useState<Suspect[]>([])

  const getSuspectName = (id: number): string => {
    const suspect = suspects.find(s => s.id === id)
    return suspect ? suspect.name : '不明'
  }

  // CSV出力機能
  const downloadSurveyCSV = () => {
    try {
      const csvContent = gameStorage.exportSurveyDataAsCSV()
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `survey_results_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('CSV出力エラー:', error)
      alert('CSV出力に失敗しました')
    }
  }

  const downloadGameHistoryCSV = () => {
    try {
      const csvContent = gameStorage.exportGameHistoryAsCSV()
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `game_history_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('CSV出力エラー:', error)
      alert('CSV出力に失敗しました')
    }
  }

  // データクリア機能（管理者用）
  const clearAllData = () => {
    if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
      if (confirm('本当にすべてのデータを削除しますか？')) {
        gameStorage.clearAllData()
        setStats(null)
        setHistory([])
        alert('すべてのデータが削除されました')
      }
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // 実際のゲームデータから統計を計算
        const currentStats = gameStorage.calculateStats()
        const recentGames = gameStorage.getRecentGames(20)

        setStats(currentStats)
        setHistory(recentGames)

        // 設定ファイルから容疑者情報を読み込み
        const { suspects: loadedSuspects } = await ConfigLoader.loadCurrentScenario()
        setSuspects(loadedSuspects)

        setLoading(false)
      } catch (error) {
        console.error('データ読み込みエラー:', error)
        setLoading(false)
      }
    }

    loadData()
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
      <div className="container">
        <div className="page-header">
          <h1>📊 プロフィール & データ管理</h1>
          <p>ゲーム統計・履歴・アンケート結果を確認</p>
        </div>

        {/* タブナビゲーション */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📈 統計
          </button>
          <button
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 履歴
          </button>
          <button
            className={`tab-button ${activeTab === 'surveys' ? 'active' : ''}`}
            onClick={() => setActiveTab('surveys')}
          >
            📝 アンケート
          </button>
          <button
            className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            ⚙️ 管理者
          </button>
        </div>

        {/* 統計タブ */}
        {activeTab === 'stats' && stats && (
          <section className="stats-overview">
            <h2>📈 総合成績</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">🎯</span>
                <div className="stat-content">
                  <h3>正解率</h3>
                  <span className="stat-value">{stats.winRate}%</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🎮</span>
                <div className="stat-content">
                  <h3>プレイ回数</h3>
                  <span className="stat-value">{stats.totalGames}回</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">🔥</span>
                <div className="stat-content">
                  <h3>連続正解記録</h3>
                  <span className="stat-value">{stats.maxStreak}回</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⏱️</span>
                <div className="stat-content">
                  <h3>平均プレイ時間</h3>
                  <span className="stat-value">{Math.floor(stats.averagePlayTime / 60)}分{stats.averagePlayTime % 60}秒</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ゲーム履歴タブ */}
        {activeTab === 'history' && (
          <section className="game-history">
            <div className="section-header">
              <h2>🕒 プレイ履歴</h2>
              <button onClick={downloadGameHistoryCSV} className="csv-button">
                📊 履歴をCSV出力
              </button>
            </div>

            {history.length === 0 ? (
              <div className="no-data">
                <p>まだプレイ履歴がありません</p>
                <Link to="/game" className="play-button">🎮 ゲームをプレイ</Link>
              </div>
            ) : (
              <div className="history-list">
                {history.map(game => (
                  <div key={game.id} className="history-item">
                    <div className="game-result">
                      <span className={`result-badge ${game.isCorrect ? 'correct' : 'incorrect'}`}>
                        {game.isCorrect ? '正解' : '不正解'}
                      </span>
                      <span className="game-date">
                        {new Date(game.timestamp).toLocaleString('ja-JP')}
                      </span>
                    </div>

                    <div className="game-details">
                      <div className="detail-item">
                        <span>選択: {getSuspectName(game.selectedSuspect)}</span>
                      </div>
                      <div className="detail-item">
                        <span>正解: {getSuspectName(game.correctSuspect)}</span>
                      </div>
                      <div className="detail-item">
                        <span>質問数: {game.questionsUsed}問</span>
                      </div>
                      <div className="detail-item">
                        <span>時間: {Math.floor(game.playTimeSeconds / 60)}分{game.playTimeSeconds % 60}秒</span>
                      </div>
                    </div>

                    <details className="conversation-details" open>
                      <summary>対話履歴を表示 ({game.testimonies.length}件)</summary>
                      <div className="conversation-list">
                        {game.testimonies.map((testimony, index) => (
                          <div key={index} className="conversation-item">
                            <div className="conversation-header">
                              <span className="suspect-name">{getSuspectName(testimony.suspectId)}</span>
                              <span className="conversation-time">
                                {new Date(testimony.timestamp).toLocaleString('ja-JP')}
                              </span>
                            </div>
                            <div className="question">Q: {testimony.question}</div>
                            <div className="answer">A: {testimony.answer}</div>
                          </div>
                        ))}
                      </div>
                    </details>

                    {/* アンケート未回答の場合のリンク */}
                    {!game.surveyData && (
                      <div className="survey-prompt">
                        <Link to={`/survey?gameId=${game.id}`} className="survey-link">
                          📝 このゲームのアンケートに回答
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* アンケート結果タブ */}
        {activeTab === 'surveys' && (
          <section className="survey-results">
            <div className="section-header">
              <h2>📊 アンケート結果</h2>
              <button onClick={downloadSurveyCSV} className="csv-button">
                📊 アンケート結果をCSV出力
              </button>
            </div>

            {(() => {
              const surveysData = history.filter(game => game.surveyData)

              if (surveysData.length === 0) {
                return (
                  <div className="no-data">
                    <p>まだアンケート回答がありません</p>
                    <p>ゲームプレイ後にアンケートにご協力ください</p>
                  </div>
                )
              }

              // 平均値を計算
              const calculateAverage = (field: keyof typeof surveysData[0]['surveyData']) => {
                const sum = surveysData.reduce((acc, game) => acc + (game.surveyData![field] as number), 0)
                return (sum / surveysData.length).toFixed(1)
              }

              const averages = {
                overallSatisfaction: calculateAverage('overallSatisfaction'),
                difficultyAppropriate: calculateAverage('difficultyAppropriate'),
                aiCharacterRealism: calculateAverage('aiCharacterRealism'),
                mysteryInteresting: calculateAverage('mysteryInteresting')
              }

              return (
                <div className="surveys-container">
                  {/* 全体平均 */}
                  <div className="survey-summary">
                    <h3>📊 全体の平均評価 (回答数: {surveysData.length}件)</h3>
                    <div className="average-ratings">
                      <div className="average-item">
                        <span className="average-label">全体的な満足度:</span>
                        <span className="average-value">{averages.overallSatisfaction} / 5.0</span>
                        <span className="average-stars">
                          {'★'.repeat(Math.round(parseFloat(averages.overallSatisfaction)))}
                          {'☆'.repeat(5 - Math.round(parseFloat(averages.overallSatisfaction)))}
                        </span>
                      </div>
                      <div className="average-item">
                        <span className="average-label">難易度の適切さ:</span>
                        <span className="average-value">{averages.difficultyAppropriate} / 5.0</span>
                        <span className="average-stars">
                          {'★'.repeat(Math.round(parseFloat(averages.difficultyAppropriate)))}
                          {'☆'.repeat(5 - Math.round(parseFloat(averages.difficultyAppropriate)))}
                        </span>
                      </div>
                      <div className="average-item">
                        <span className="average-label">AIキャラクターのリアリティ:</span>
                        <span className="average-value">{averages.aiCharacterRealism} / 5.0</span>
                        <span className="average-stars">
                          {'★'.repeat(Math.round(parseFloat(averages.aiCharacterRealism)))}
                          {'☆'.repeat(5 - Math.round(parseFloat(averages.aiCharacterRealism)))}
                        </span>
                      </div>
                      <div className="average-item">
                        <span className="average-label">推理要素の面白さ:</span>
                        <span className="average-value">{averages.mysteryInteresting} / 5.0</span>
                        <span className="average-stars">
                          {'★'.repeat(Math.round(parseFloat(averages.mysteryInteresting)))}
                          {'☆'.repeat(5 - Math.round(parseFloat(averages.mysteryInteresting)))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 個別のアンケート結果 */}
                  <div className="surveys-list">
                    <h3>📝 個別の回答履歴</h3>
                    {surveysData.map(game => (
                    <div key={game.id} className="survey-item">
                      <div className="survey-header">
                        <span className="survey-date">
                          {new Date(game.timestamp).toLocaleDateString('ja-JP')}
                        </span>
                        <span className={`result-badge ${game.isCorrect ? 'correct' : 'incorrect'}`}>
                          {game.isCorrect ? '正解' : '不正解'}
                        </span>
                      </div>
                      <div className="survey-data">
                        <div className="rating-item">
                          <span>全体的な満足度:</span>
                          <span className="rating">{'★'.repeat(game.surveyData!.overallSatisfaction)}{'☆'.repeat(5 - game.surveyData!.overallSatisfaction)}</span>
                        </div>
                        <div className="rating-item">
                          <span>難易度の適切さ:</span>
                          <span className="rating">{'★'.repeat(game.surveyData!.difficultyAppropriate)}{'☆'.repeat(5 - game.surveyData!.difficultyAppropriate)}</span>
                        </div>
                        <div className="rating-item">
                          <span>AIキャラクターのリアリティ:</span>
                          <span className="rating">{'★'.repeat(game.surveyData!.aiCharacterRealism)}{'☆'.repeat(5 - game.surveyData!.aiCharacterRealism)}</span>
                        </div>
                        <div className="rating-item">
                          <span>推理要素の面白さ:</span>
                          <span className="rating">{'★'.repeat(game.surveyData!.mysteryInteresting)}{'☆'.repeat(5 - game.surveyData!.mysteryInteresting)}</span>
                        </div>
                        {game.surveyData!.freeComment && (
                          <div className="free-comment">
                            <strong>コメント:</strong> {game.surveyData!.freeComment}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )
            })()}
          </section>
        )}

        {/* 管理者タブ */}
        {activeTab === 'admin' && (
          <section className="admin-panel">
            <h2>🔧 管理者機能</h2>
            <div className="admin-actions">
              <div className="admin-section">
                <h3>📊 データエクスポート</h3>
                <p>デモ展示のレポート作成用</p>
                <div className="button-group">
                  <button onClick={downloadGameHistoryCSV} className="admin-button">
                    📋 ゲーム履歴・対話履歴をCSV出力
                  </button>
                  <button onClick={downloadSurveyCSV} className="admin-button">
                    📝 アンケート結果をCSV出力
                  </button>
                </div>
              </div>

              <div className="admin-section">
                <h3>🗃️ データ管理</h3>
                <p>デモ終了時のデータクリア用</p>
                <div className="button-group">
                  <button onClick={clearAllData} className="danger-button">
                    🗑️ 全データを削除
                  </button>
                </div>
              </div>

              <div className="admin-section">
                <h3>📈 統計サマリー</h3>
                {stats && (
                  <div className="admin-stats">
                    <div>総プレイ回数: {stats.totalGames}回</div>
                    <div>アンケート回答数: {history.filter(g => g.surveyData).length}回</div>
                    <div>回答率: {stats.totalGames > 0 ? Math.round((history.filter(g => g.surveyData).length / stats.totalGames) * 100) : 0}%</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="profile-actions">
          <Link to="/" className="back-button">🏠 ホームに戻る</Link>
          <Link to="/game" className="play-button">🎮 ゲームをプレイ</Link>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
