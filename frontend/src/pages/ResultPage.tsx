import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import person1Image from '../assets/person1.png'
import person2Image from '../assets/person2.png'
import person3Image from '../assets/person3.png'

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

  const suspects = [
    { id: 1, name: '田中太郎', avatar: person1Image },
    { id: 2, name: '佐藤花子', avatar: person2Image },
    { id: 3, name: '山田次郎', avatar: person3Image }
  ]

  useEffect(() => {
    const selectedId = parseInt(searchParams.get('selected') || '1')

    // 実際にはAPIで判定結果を取得
    // 今はモックデータを使用
    const mockResult: GameResult = {
      selectedSuspect: selectedId,
      correctSuspect: 2, // 佐藤花子が犯人という設定
      isCorrect: selectedId === 2,
      explanation: selectedId === 2
        ? '正解！佐藤花子の証言には矛盾がありました。彼女は「8時頃に到着した」と言いましたが、防犯カメラには7時30分に入館する姿が記録されており、また警備員の証言と時刻が合いません。'
        : `不正解。正解は佐藤花子でした。彼女の証言「8時頃に到着した」は防犯カメラの記録（7時30分入館）と矛盾していました。${selectedId === 1 ? '田中太郎' : '山田次郎'}は無実でした。`
    }

    setTimeout(() => {
      setResult(mockResult)
      setLoading(false)
    }, 1000)
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
        </div>

        <div className="game-stats">
          <h3>📈 統計情報</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">正解率</span>
              <span className="stat-value">75%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">プレイ回数</span>
              <span className="stat-value">12回</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">最高連続正解</span>
              <span className="stat-value">3回</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultPage
