import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import person1Image from '../assets/person1.png'
import person2Image from '../assets/person2.png'
import person3Image from '../assets/person3.png'

interface Suspect {
  id: number
  name: string
  description: string
  avatar: string
}

interface Testimony {
  suspectId: number
  question: string
  answer: string
  timestamp: Date
}

const GamePage = () => {
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [selectedSuspect, setSelectedSuspect] = useState<number | null>(null)
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [questionsRemaining, setQuestionsRemaining] = useState(5)
  const [gamePhase, setGamePhase] = useState<'scene-briefing' | 'questioning' | 'selection'>('scene-briefing')
  const [activeTestimonyTab, setActiveTestimonyTab] = useState<number | 'all'>('all')

  // タイプライター効果用のstate
  const [displayedScene, setDisplayedScene] = useState({
    location: '',
    time: '',
    victim: '',
    evidence: '',
    details: ''
  })
  const [currentTypingField, setCurrentTypingField] = useState<keyof typeof displayedScene | null>('location')
  const [sceneBriefingComplete, setSceneBriefingComplete] = useState(false)
  const [allowSkip, setAllowSkip] = useState(false)

  // 回答ストリーミング用のstate
  const [isAnswerStreaming, setIsAnswerStreaming] = useState(false)
  const [streamingAnswer, setStreamingAnswer] = useState('')
  const [streamingSuspectId, setStreamingSuspectId] = useState<number | null>(null)

  const suspects: Suspect[] = [
    {
      id: 1,
      name: '田中太郎',
      description: '被害者の同僚',
      avatar: person1Image
    },
    {
      id: 2,
      name: '佐藤花子',
      description: '被害者の友人',
      avatar: person2Image
    },
    {
      id: 3,
      name: '山田次郎',
      description: '警備員',
      avatar: person3Image
    }
  ]

  const crimeScene = {
    location: 'オフィスビルの20階',
    time: '午後8時頃',
    victim: '鈴木一郎（会社員、45歳）',
    evidence: '窓際で発見、机の上に散乱した書類、ドアは施錠されていた',
    details: 'エレベーターの防犯カメラには午後7時30分に3人の容疑者全員がビルに入る姿が記録されている。'
  }

  // タイプライター効果の実装
  useEffect(() => {
    const typewriterEffect = async () => {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

      const typeText = async (text: string, field: keyof typeof displayedScene) => {
        setCurrentTypingField(field)
        for (let i = 0; i <= text.length; i++) {
          setDisplayedScene(prev => ({
            ...prev,
            [field]: text.slice(0, i)
          }))
          // 文字の種類によって速度を変える（フルスクリーン表示用に調整）
          const char = text[i]
          if (char === '、' || char === '。') {
            await delay(200) // 句読点は長めに停止（臨場感演出）
          } else if (char === ' ') {
            await delay(30) // スペースは短く
          } else if (char === '（' || char === '）') {
            await delay(80) // 括弧は中程度
          } else {
            await delay(60) // 通常の文字（少し遅めで読みやすく）
          }
        }
        await delay(800) // 各フィールド完了後の長めの休止
      }

      // 開始前の演出的な待機
      await delay(1000)

      // 3秒後にスキップを許可
      setTimeout(() => setAllowSkip(true), 3000)

      // 順番にタイプライター効果を実行
      await typeText(crimeScene.location, 'location')
      await typeText(crimeScene.time, 'time')
      await typeText(crimeScene.victim, 'victim')
      await typeText(crimeScene.evidence, 'evidence')
      await typeText(crimeScene.details, 'details')

      // 全完了後にカーソルを消す
      setCurrentTypingField(null)
      await delay(1200)
      setSceneBriefingComplete(true)

      // さらに少し待ってからゲーム段階を進める
      await delay(3000)
      setGamePhase('questioning')
    }

    typewriterEffect()
  }, []) // 空の依存配列でマウント時のみ実行

  const handleQuestionSubmit = async () => {
    if (!currentQuestion.trim() || selectedSuspect === null) return

    console.log('質問送信開始:', { selectedSuspect, currentQuestion })

    // 実際にはAPIコールを行う、今はモックレスポンスを使用
    const mockResponse = getMockResponse(selectedSuspect, currentQuestion)
    console.log('モックレスポンス:', mockResponse)

    // 現在の値を保存（stateが変更されても影響を受けないように）
    const currentSelectedSuspect = selectedSuspect
    const currentQuestionText = currentQuestion

    // ストリーミング開始
    setIsAnswerStreaming(true)
    setStreamingSuspectId(currentSelectedSuspect)
    setStreamingAnswer('')

    console.log('ストリーミング状態設定完了:', {
      isAnswerStreaming: true,
      streamingSuspectId: currentSelectedSuspect
    })

    // stateの更新を確実に反映させるため、少し待機
    await new Promise(resolve => setTimeout(resolve, 100))

    // タイプライター効果でストリーミング表示
    await streamAnswer(mockResponse)

    // ストリーミング完了後、証言履歴に追加
    const newTestimony: Testimony = {
      suspectId: currentSelectedSuspect,
      question: currentQuestionText,
      answer: mockResponse,
      timestamp: new Date()
    }

    setTestimonies(prev => [...prev, newTestimony])
    setCurrentQuestion('')
    setQuestionsRemaining(prev => prev - 1)

    // ストリーミング状態をクリア
    setIsAnswerStreaming(false)
    setStreamingAnswer('')
    setStreamingSuspectId(null)

    console.log('ストリーミング完了、状態クリア')

    if (questionsRemaining <= 1) {
      setGamePhase('selection')
    }
  }

  const streamAnswer = async (answer: string) => {
    console.log('ストリーミング開始:', answer)
    console.log('ストリーミング開始時の状態:', { isAnswerStreaming, streamingSuspectId })

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    for (let i = 0; i <= answer.length; i++) {
      const currentText = answer.slice(0, i)
      setStreamingAnswer(currentText)

      if (i % 10 === 0) { // 10文字ごとにログ出力
        console.log('ストリーミング中:', { currentText, i, totalLength: answer.length })
      }

      // 文字の種類によって速度を変える
      const char = answer[i]
      if (char === '、' || char === '。') {
        await delay(200) // 句読点は長めに停止
      } else if (char === ' ') {
        await delay(30) // スペースは短く
      } else {
        await delay(50) // 通常の文字
      }
    }

    // 完了後の小休止
    console.log('ストリーミング表示完了、最終テキスト:', answer)
    await delay(1000)
  }

  const getMockResponse = (suspectId: number, _question: string): string => {
    // 実際にはLLM APIを呼び出す
    const responses = {
      1: '午後7時45分頃にオフィスに着きました。鈴木さんとは少し話をしましたが、特に変わった様子はありませんでした。',
      2: '私は8時頃に到着しましたが、その時にはもう鈴木さんは倒れていました。すぐに119番通報しました。',
      3: 'ビルの見回りをしていましたが、7時50分頃に20階で大きな音がしたのを覚えています。'
    }
    return responses[suspectId as keyof typeof responses] || '覚えていません。'
  }

  const handleSuspectSelection = (suspectId: number) => {
    // ここで結果ページに遷移
    // 実際にはstateとして犯人選択を渡す
    window.location.href = `/result?selected=${suspectId}`
  }

  const handleSkipBriefing = () => {
    if (allowSkip && gamePhase === 'scene-briefing') {
      setCurrentTypingField(null)
      setSceneBriefingComplete(true)
      setGamePhase('questioning')
    }
  }

  // 現場情報フルスクリーン表示の場合
  if (gamePhase === 'scene-briefing') {
    return (
      <div className="game-page scene-briefing-page">
        <div className="scene-briefing-container">
          <div className="scene-briefing-content">
            <h1 className="briefing-title">🔍 事件現場レポート</h1>

            <div className="briefing-details">
              <div className="briefing-item">
                <span className="briefing-label">事件発生場所:</span>
                <span className={`briefing-value ${currentTypingField === 'location' ? 'typewriter-text' : ''}`}>
                  {displayedScene.location}
                </span>
              </div>

              <div className="briefing-item">
                <span className="briefing-label">発生時刻:</span>
                <span className={`briefing-value ${currentTypingField === 'time' ? 'typewriter-text' : ''}`}>
                  {displayedScene.time}
                </span>
              </div>

              <div className="briefing-item">
                <span className="briefing-label">被害者:</span>
                <span className={`briefing-value ${currentTypingField === 'victim' ? 'typewriter-text' : ''}`}>
                  {displayedScene.victim}
                </span>
              </div>

              <div className="briefing-item">
                <span className="briefing-label">現場状況:</span>
                <span className={`briefing-value ${currentTypingField === 'evidence' ? 'typewriter-text' : ''}`}>
                  {displayedScene.evidence}
                </span>
              </div>

              <div className="briefing-item">
                <span className="briefing-label">重要情報:</span>
                <span className={`briefing-value ${currentTypingField === 'details' ? 'typewriter-text' : ''}`}>
                  {displayedScene.details}
                </span>
              </div>
            </div>

            {sceneBriefingComplete && (
              <div className="briefing-footer">
                <p className="briefing-instruction">捜査を開始します...</p>
              </div>
            )}

            {allowSkip && !sceneBriefingComplete && (
              <div className="briefing-skip">
                <button className="skip-button" onClick={handleSkipBriefing}>
                  スキップ →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="game-page">
      <header className="game-header">
        <Link to="/" className="back-button">← トップに戻る</Link>
        <h1>🕵️‍♂️ 犯人を導けワトソン！</h1>
        <div className="questions-counter">残り質問数: {questionsRemaining}</div>
      </header>

      <div className="game-content">
        {/* 左側カラム */}
        <div className="left-column">
          {/* 現場情報 */}
          <section className="crime-scene">
            <h2>🔍 現場情報</h2>
            <div className="scene-details">
              <p><strong>場所:</strong> <span className="typewriter-text">{displayedScene.location}{currentTypingField === 'location' && '|'}</span></p>
              <p><strong>時刻:</strong> <span className="typewriter-text">{displayedScene.time}{currentTypingField === 'time' && '|'}</span></p>
              <p><strong>被害者:</strong> <span className="typewriter-text">{displayedScene.victim}{currentTypingField === 'victim' && '|'}</span></p>
              <p><strong>状況:</strong> <span className="typewriter-text">{displayedScene.evidence}{currentTypingField === 'evidence' && '|'}</span></p>
              <p><strong>詳細:</strong> <span className="typewriter-text">{displayedScene.details}{currentTypingField === 'details' && '|'}</span></p>
            </div>
          </section>

          {/* 証言履歴 */}
          <section className="testimonies">
            <h2>📝 証言履歴</h2>

            {/* タブ */}
            <div className="testimony-tabs">
              <button
                className={`tab-button ${activeTestimonyTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTestimonyTab('all')}
              >
                すべて
              </button>
              {suspects.map(suspect => {
                const suspectTestimonies = testimonies.filter(t => t.suspectId === suspect.id)
                return (
                  <button
                    key={suspect.id}
                    className={`tab-button ${activeTestimonyTab === suspect.id ? 'active' : ''}`}
                    onClick={() => setActiveTestimonyTab(suspect.id)}
                  >
                    <img src={suspect.avatar} alt={suspect.name} className="tab-avatar" />
                    {suspect.name}
                    {suspectTestimonies.length > 0 && (
                      <span className="testimony-count">{suspectTestimonies.length}</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* 証言リスト */}
            <div className="testimonies-list">
              {(() => {
                const filteredTestimonies = activeTestimonyTab === 'all'
                  ? testimonies
                  : testimonies.filter(t => t.suspectId === activeTestimonyTab)

                if (filteredTestimonies.length === 0) {
                  return (
                    <p className="no-testimonies">
                      {activeTestimonyTab === 'all'
                        ? 'まだ証言がありません'
                        : `${suspects.find(s => s.id === activeTestimonyTab)?.name}の証言はまだありません`
                      }
                    </p>
                  )
                }

                return filteredTestimonies.map((testimony, index) => {
                  const suspect = suspects.find(s => s.id === testimony.suspectId)
                  return (
                    <div key={index} className="testimony-item">
                      <div className="testimony-header">
                        <div className="testimony-suspect-info">
                          <img
                            src={suspect?.avatar}
                            alt={suspect?.name}
                            className="testimony-avatar"
                          />
                          <span className="suspect-name">{suspect?.name}</span>
                        </div>
                        <span className="timestamp">
                          {testimony.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="question">
                        <strong>質問:</strong> {testimony.question}
                      </div>
                      <div className="answer">
                        <strong>回答:</strong> {testimony.answer}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </section>
        </div>

        {/* 右側カラム */}
        <div className="right-column">
          {gamePhase === 'questioning' ? (
            <>
              {/* 容疑者選択 */}
              <section className="suspects">
                <div className="suspects-grid">
                  {suspects.map(suspect => (
                    <div
                      key={suspect.id}
                      className={`suspect-card ${selectedSuspect === suspect.id ? 'selected' : ''}`}
                      onClick={() => setSelectedSuspect(suspect.id)}
                    >
                      <img
                        src={suspect.avatar}
                        alt={suspect.name}
                        className="suspect-image"
                      />
                      <h3>{suspect.name}</h3>
                      <p>{suspect.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 回答ストリーミング表示エリア */}
              {isAnswerStreaming && streamingSuspectId && (
                <section className="answer-streaming">
                  <div className="streaming-header">
                    <div className="streaming-suspect">
                      <img
                        src={suspects.find(s => s.id === streamingSuspectId)?.avatar}
                        alt={suspects.find(s => s.id === streamingSuspectId)?.name}
                        className="streaming-avatar"
                      />
                      <span className="streaming-name">
                        {suspects.find(s => s.id === streamingSuspectId)?.name}の証言
                      </span>
                    </div>
                  </div>
                  <div className="streaming-content">
                    <p className="streaming-text">
                      {streamingAnswer}
                      <span className="streaming-cursor">|</span>
                    </p>
                  </div>
                </section>
              )}

              {/* 質問入力 */}
              <section className="question-input">
                <div className="input-area">
                  <textarea
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder="容疑者に質問したい内容を入力してください..."
                    disabled={selectedSuspect === null || isAnswerStreaming}
                  />
                  <button
                    onClick={handleQuestionSubmit}
                    disabled={!currentQuestion.trim() || selectedSuspect === null || isAnswerStreaming}
                    className="submit-question"
                  >
                    {isAnswerStreaming ? '回答中...' : '質問する'}
                  </button>
                </div>
                {isAnswerStreaming ? (
                  <p className="instruction">容疑者が回答しています...</p>
                ) : selectedSuspect === null ? (
                  <p className="instruction">まず容疑者を選択してください</p>
                ) : null}
              </section>
            </>
          ) : (
            <section className="suspect-selection">
              <div className="final-suspects-grid">
                {suspects.map(suspect => (
                  <div
                    key={suspect.id}
                    className="final-suspect-card"
                    onClick={() => handleSuspectSelection(suspect.id)}
                  >
                    <img
                      src={suspect.avatar}
                      alt={suspect.name}
                      className="suspect-image"
                    />
                    <h3>{suspect.name}</h3>
                    <p>{suspect.description}</p>
                    <button className="select-culprit">この人が犯人</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default GamePage
