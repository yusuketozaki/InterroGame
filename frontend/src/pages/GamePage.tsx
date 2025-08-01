import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiClient } from '../utils/apiClient'
import { gameStorage } from '../utils/gameStorage'
import type { GameData } from '../utils/gameStorage'
import ConfigLoader, { type Suspect, type Scenario, type GameSettings } from '../utils/configLoader'

interface Testimony {
  suspectId: number
  question: string
  answer: string
  timestamp: Date
}

const GamePage = () => {
  const [searchParams] = useSearchParams()
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [selectedSuspect, setSelectedSuspect] = useState<number | null>(null)
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [questionsRemaining, setQuestionsRemaining] = useState(5)
  const [gamePhase, setGamePhase] = useState<'scene-briefing' | 'questioning' | 'selection'>('scene-briefing')
  const [activeTestimonyTab, setActiveTestimonyTab] = useState<number | 'all'>('all')
  const [suspects, setSuspects] = useState<Suspect[]>([])
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null)
  const [loading, setLoading] = useState(true)

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

  // ゲーム統計用のstate
  const [gameId] = useState(() => gameStorage.generateGameId())
  const [gameStartTime] = useState(() => Date.now())

  // 設定データの読み込み
  useEffect(() => {
    const loadGameData = async () => {
      try {
        const scenarioId = searchParams.get('scenario') || undefined
        const { scenario, suspects: loadedSuspects } = await ConfigLoader.loadCurrentScenario(scenarioId)
        const settings = await ConfigLoader.loadGameSettings()

        setCurrentScenario(scenario)
        setSuspects(loadedSuspects)
        setGameSettings(settings)
        setQuestionsRemaining(settings.gameplay.maxQuestions)
        setLoading(false)
      } catch (error) {
        console.error('Failed to load game data:', error)
        setLoading(false)
      }
    }

    loadGameData()
  }, [searchParams])

  // タイプライター効果の実装
  useEffect(() => {
    if (!currentScenario || !gameSettings) return

    const typewriterEffect = async () => {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

      const typeText = async (text: string, field: keyof typeof displayedScene) => {
        setCurrentTypingField(field)
        for (let i = 0; i <= text.length; i++) {
          setDisplayedScene(prev => ({
            ...prev,
            [field]: text.slice(0, i)
          }))
          // 文字の種類によって速度を変える（設定から取得）
          const char = text[i]
          const speeds = gameSettings.gameplay.typewriterSpeed
          if (char === '、' || char === '。') {
            await delay(speeds.punctuation)
          } else if (char === ' ') {
            await delay(speeds.space)
          } else if (char === '（' || char === '）') {
            await delay(speeds.bracket)
          } else {
            await delay(speeds.normal)
          }
        }
        await delay(gameSettings.gameplay.delays.fieldComplete)
      }

      // スキップを最初から許可
      setAllowSkip(true)

      // 開始前の演出的な待機
      await delay(gameSettings.gameplay.delays.gameStart)

      // 順番にタイプライター効果を実行
      await typeText(currentScenario.crimeScene.location, 'location')
      await typeText(currentScenario.crimeScene.time, 'time')
      await typeText(currentScenario.crimeScene.victim, 'victim')
      await typeText(currentScenario.crimeScene.evidence, 'evidence')
      await typeText(currentScenario.crimeScene.details, 'details')

      // 全完了後にカーソルを消す
      setCurrentTypingField(null)
      await delay(gameSettings.gameplay.delays.briefingComplete)
      setSceneBriefingComplete(true)

      // さらに少し待ってからゲーム段階を進める
      await delay(gameSettings.gameplay.delays.phaseTransition)
      setGamePhase('questioning')
    }

    typewriterEffect()
  }, [currentScenario, gameSettings])

  const handleQuestionSubmit = async () => {
    if (!currentQuestion.trim() || selectedSuspect === null) return

    console.log('質問送信開始:', { selectedSuspect, currentQuestion })

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

    try {
      // 容疑者のシステムプロンプトを取得
      const suspect = suspects.find(s => s.id === currentSelectedSuspect)
      if (!suspect || !currentScenario) {
        throw new Error('Suspect or scenario not found')
      }

      // 真犯人かどうかを判定
      const isGuilty = currentSelectedSuspect === currentScenario.criminalId
      const systemPrompt = isGuilty ? suspect.systemPrompts.guilty : suspect.systemPrompts.innocent

      console.log('システムプロンプト選択結果:', {
        suspectId: currentSelectedSuspect,
        criminalId: currentScenario.criminalId,
        isGuilty,
        systemPromptLength: systemPrompt.length,
        systemPromptPreview: systemPrompt.substring(0, 100) + '...'
      })

      // APIクライアントを使用してLLMに質問
      const apiRequest = {
        system_message: ApiClient.generateSuspectSystemPrompt(currentSelectedSuspect, systemPrompt),
        messages: ApiClient.convertTestimoniesToMessages(testimonies, currentQuestionText, currentSelectedSuspect),
        stream: false,
        think: false
      }

      // 容疑者ごとの対話履歴を確認するためのログ
      console.log('容疑者ごとの対話履歴管理:', {
        targetSuspectId: currentSelectedSuspect,
        totalTestimonies: testimonies.length,
        suspectTestimonies: testimonies.filter(t => t.suspectId === currentSelectedSuspect).length,
        suspectQuestionCount: ApiClient.getSuspectQuestionCount(testimonies, currentSelectedSuspect),
        allSuspectStats: suspects.map(s => ({
          id: s.id,
          name: s.name,
          questionCount: ApiClient.getSuspectQuestionCount(testimonies, s.id)
        }))
      })

      console.log('API送信データ:', {
        system_message_length: apiRequest.system_message.length,
        system_message_preview: apiRequest.system_message.substring(0, 200) + '...',
        messages_count: Object.keys(apiRequest.messages).length,
        filtered_for_suspect: currentSelectedSuspect
      })

      const response = await ApiClient.sendChatCompletion(apiRequest)

      console.log('APIレスポンス:', response)

      // タイプライター効果でストリーミング表示
      await streamAnswer(response)

      // ストリーミング完了後、証言履歴に追加
      const newTestimony: Testimony = {
        suspectId: currentSelectedSuspect,
        question: currentQuestionText,
        answer: response,
        timestamp: new Date()
      }

      setTestimonies(prev => [...prev, newTestimony])
    } catch (error) {
      console.error('API呼び出しエラー:', error)
      // エラー時はフォールバック応答を表示
      const fallbackResponse = "申し訳ございませんが、現在システムに問題が発生しています。しばらく時間をおいてから再度お試しください。"
      await streamAnswer(fallbackResponse)

      // エラー時も証言履歴に記録（デバッグ用）
      const newTestimony: Testimony = {
        suspectId: currentSelectedSuspect,
        question: currentQuestionText,
        answer: fallbackResponse,
        timestamp: new Date()
      }

      setTestimonies(prev => [...prev, newTestimony])
    }

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

    if (!gameSettings) return

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    for (let i = 0; i <= answer.length; i++) {
      const currentText = answer.slice(0, i)
      setStreamingAnswer(currentText)

      if (i % 10 === 0) { // 10文字ごとにログ出力
        console.log('ストリーミング中:', { currentText, i, totalLength: answer.length })
      }

      // 文字の種類によって速度を変える（設定から取得）
      const char = answer[i]
      const speeds = gameSettings.gameplay.streamingSpeed
      if (char === '、' || char === '。') {
        await delay(speeds.punctuation)
      } else if (char === ' ') {
        await delay(speeds.space)
      } else {
        await delay(speeds.normal)
      }
    }

    // 完了後の小休止
    console.log('ストリーミング表示完了、最終テキスト:', answer)
    await delay(gameSettings.gameplay.delays.streamingComplete)
  }

  const handleSuspectSelection = (suspectId: number) => {
    if (!currentScenario || !gameSettings) return

    // ゲーム終了時のデータを保存
    const gameEndTime = Date.now()
    const playTimeSeconds = Math.round((gameEndTime - gameStartTime) / 1000)
    const correctSuspect = currentScenario.criminalId
    const isCorrect = suspectId === correctSuspect
    const questionsUsed = gameSettings.gameplay.maxQuestions - questionsRemaining

    const gameData: GameData = {
      id: gameId,
      timestamp: gameEndTime,
      selectedSuspect: suspectId,
      correctSuspect,
      isCorrect,
      questionsUsed,
      playTimeSeconds,
      testimonies: testimonies.map(t => ({
        suspectId: t.suspectId,
        question: t.question,
        answer: t.answer,
        timestamp: t.timestamp
      }))
    }

    // ゲームデータを保存
    gameStorage.saveGameData(gameData)

    // 結果ページに遷移（選択した容疑者IDを含む）
    window.location.href = `/result?selected=${suspectId}&gameId=${gameId}`
  }

  const handleSkipBriefing = () => {
    if (allowSkip && gamePhase === 'scene-briefing') {
      setCurrentTypingField(null)
      setSceneBriefingComplete(true)
      setGamePhase('questioning')
    }
  }

  // ローディング中の表示
  if (loading || !currentScenario || !gameSettings) {
    return (
      <div className="game-page loading">
        <div className="loading-content">
          <h1>🎮 ゲームを準備中...</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
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

  // 背景スタイルを動的に適用
  const backgroundStyle = currentScenario?.background ? {
    backgroundImage: currentScenario.background.image ? `url(${currentScenario.background.image})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  } : {}

  return (
    <div className={`game-page atmosphere-${currentScenario?.background?.atmosphere || 'dark'}`} style={backgroundStyle}>
      <header className="game-header">
        <Link to="/" className="back-button">← トップに戻る</Link>
        {/* <h1>🕵️‍♂️ 犯人を導けワトソン！</h1> */}
        <div className="header-right">
          <div className="header-stats">
            <div className="questions-counter">残り可能質問数: {questionsRemaining}</div>
            {gamePhase === 'questioning' && suspects.length > 0 && (
              <div className="suspect-stats">
                {suspects.map(suspect => {
                  const questionCount = ApiClient.getSuspectQuestionCount(testimonies, suspect.id)
                  return (
                    <div key={suspect.id} className="suspect-stat">
                      <img src={suspect.avatar} alt={suspect.name} className="stat-avatar" />
                      <span className="stat-name">{suspect.name}</span>
                      <span className="stat-count">{questionCount}問</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          {/* 推理終了ボタンをヘッダに移動 */}
          {gamePhase === 'questioning' && (
            <button
              onClick={() => setGamePhase('selection')}
              className="finish-investigation-header"
              disabled={isAnswerStreaming || testimonies.length === 0}
            >
              🎯 推理を終了して犯人を選ぶ
            </button>
          )}
        </div>
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
                const suspectQuestionCount = ApiClient.getSuspectQuestionCount(testimonies, suspect.id)
                return (
                  <button
                    key={suspect.id}
                    className={`tab-button ${activeTestimonyTab === suspect.id ? 'active' : ''}`}
                    onClick={() => setActiveTestimonyTab(suspect.id)}
                  >
                    <img src={suspect.avatar} alt={suspect.name} className="tab-avatar" />
                    {suspect.name}
                    {suspectQuestionCount > 0 && (
                      <span className="testimony-count">{suspectQuestionCount}</span>
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
                {suspects.map(suspect => {
                  const questionCount = ApiClient.getSuspectQuestionCount(testimonies, suspect.id)
                  return (
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
                      <div className="suspect-questions-info">
                        質問回数: {questionCount}回
                      </div>
                      <button className="select-culprit">この人が犯人</button>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default GamePage
