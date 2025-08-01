import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { gameStorage } from '../utils/gameStorage'
import type { GameData } from '../utils/gameStorage'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  label: string
  description: string
}

const StarRating = ({ value, onChange, label, description }: StarRatingProps) => {
  const [hoveredStar, setHoveredStar] = useState(0)

  return (
    <div className="survey-question">
      <h3 className="question-label">{label}</h3>
      <p className="question-description">{description}</p>
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star ${star <= (hoveredStar || value) ? 'active' : ''}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
          >
            ★
          </button>
        ))}
        <span className="rating-value">
          {value > 0 && (
            <span className="current-rating">
              {value}点 {['', '不満', 'やや不満', '普通', '満足', '非常に満足'][value]}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

const SurveyPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // アンケート回答の状態
  const [overallSatisfaction, setOverallSatisfaction] = useState(0)
  const [difficultyAppropriate, setDifficultyAppropriate] = useState(0)
  const [aiCharacterRealism, setAiCharacterRealism] = useState(0)
  const [mysteryInteresting, setMysteryInteresting] = useState(0)
  const [freeComment, setFreeComment] = useState('')

  const gameId = searchParams.get('gameId')

  useEffect(() => {
    const loadGameData = async () => {
      if (!gameId) {
        console.error('ゲームIDが指定されていません')
        setLoading(false)
        return
      }

      try {
        const data = gameStorage.getGameData(gameId)
        if (!data) {
          console.error('ゲームデータが見つかりません')
          setLoading(false)
          return
        }

        setGameData(data)
        setLoading(false)
      } catch (error) {
        console.error('ゲームデータの読み込みに失敗:', error)
        setLoading(false)
      }
    }

    loadGameData()
  }, [gameId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!gameId || !gameData) {
      alert('ゲームデータが見つかりません')
      return
    }

    // 必須項目のバリデーション
    if (overallSatisfaction === 0 || difficultyAppropriate === 0 ||
        aiCharacterRealism === 0 || mysteryInteresting === 0) {
      alert('すべての項目を評価してください')
      return
    }

    setSubmitting(true)

    try {
      // アンケートデータを保存
      await gameStorage.saveSurveyData(gameId, {
        overallSatisfaction,
        difficultyAppropriate,
        aiCharacterRealism,
        mysteryInteresting,
        freeComment: freeComment.trim() || undefined
      })

      alert('アンケートの回答ありがとうございました！')
      navigate('/profile') // プロフィール画面に遷移
    } catch (error) {
      console.error('アンケートデータの保存に失敗:', error)
      alert('アンケートの保存に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = () => {
    if (confirm('アンケートをスキップしますか？\n（後からプロフィール画面で回答することもできます）')) {
      navigate('/profile')
    }
  }

  if (loading) {
    return (
      <div className="survey-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>ゲームデータを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!gameData) {
    return (
      <div className="survey-page">
        <div className="error-container">
          <h2>エラー</h2>
          <p>ゲームデータが見つかりませんでした。</p>
          <Link to="/" className="back-button">トップに戻る</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="survey-page">
      <div className="survey-container">
        <header className="survey-header">
          <h1>🎯 ユーザー満足度アンケート</h1>
          <p className="survey-subtitle">
            ゲーム体験についてお聞かせください（約2分）
          </p>
          <div className="game-info">
            <span>プレイ日時: {new Date(gameData.timestamp).toLocaleString('ja-JP')}</span>
            <span>結果: {gameData.isCorrect ? '正解 🎉' : '不正解'}</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="survey-form">
          <div className="survey-questions">
            <StarRating
              value={overallSatisfaction}
              onChange={setOverallSatisfaction}
              label="1. 全体的な満足度"
              description="ゲーム体験全体にどの程度満足しましたか？"
            />

            <StarRating
              value={difficultyAppropriate}
              onChange={setDifficultyAppropriate}
              label="2. 難易度の適切さ"
              description="問いかけや推理の難易度は適切でしたか？"
            />

            <StarRating
              value={aiCharacterRealism}
              onChange={setAiCharacterRealism}
              label="3. AIキャラクターのリアリティ"
              description="容疑者役AIの演技（回答）は自然でしたか？"
            />

            <StarRating
              value={mysteryInteresting}
              onChange={setMysteryInteresting}
              label="4. 推理要素の面白さ"
              description="謎解き・推理部分は面白かったですか？"
            />

            <div className="survey-question">
              <h3 className="question-label">5. ご感想・ご意見（任意）</h3>
              <p className="question-description">
                ゲームの改善点やご意見があればお聞かせください
              </p>
              <textarea
                value={freeComment}
                onChange={(e) => setFreeComment(e.target.value)}
                placeholder="ご自由にお書きください..."
                className="comment-textarea"
                rows={4}
                maxLength={500}
              />
              <div className="char-count">
                {freeComment.length}/500文字
              </div>
            </div>
          </div>

          <div className="survey-actions">
            <button
              type="submit"
              disabled={submitting || overallSatisfaction === 0 || difficultyAppropriate === 0 ||
                       aiCharacterRealism === 0 || mysteryInteresting === 0}
              className="submit-button"
            >
              {submitting ? '送信中...' : 'アンケートを送信'}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="skip-button"
              disabled={submitting}
            >
              スキップ
            </button>
          </div>

          <div className="survey-note">
            <p>
              📝 このアンケートは大学のオープンキャンパス用のデモ展示の一環として実施しており、
              いただいた回答は研究・改善目的でのみ使用いたします。
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SurveyPage
