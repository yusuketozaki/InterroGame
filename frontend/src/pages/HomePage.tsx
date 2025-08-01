import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ConfigLoader, { type Scenario } from '../utils/configLoader'

const HomePage = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const loadedScenarios = await ConfigLoader.loadScenarios()
        setScenarios(loadedScenarios)
        setLoading(false)
      } catch (error) {
        console.error('Failed to load scenarios:', error)
        setLoading(false)
      }
    }

    loadScenarios()
  }, [])
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="title-overlay">
          <h1 className="game-title">🕵️‍♂️ 犯人を導け！</h1>
          <p className="game-subtitle">AI対話型 推理ゲーム</p>
        </div>

        <div className="game-description">
          <div className="text-box">
            <h2>🔍 ゲーム概要</h2>
            <p>あなたは殺人事件の現場に到着。</p>
            <p>犯人候補は 2人、手がかりとなる証拠も判明済み。</p>

            <h3>🎯 あなたの役目</h3>
            <ul>
              <li>犯人候補に聞き取り調査を行い、矛盾点を発見</li>
              <li>犯人特定する！</li>
            </ul>

            <h3>👥 登場人物</h3>
            <div className="characters">
              <div className="character">
                <h4>🗣 あなた</h4>
                <p>犯人候補に数回だけ質問できる</p>
              </div>
              <div className="character">
                <h4>🤖 犯人候補たち（AI）</h4>
                <p>それぞれ特定の発言パターンを学習したAI</p>
              </div>
            </div>
          </div>
        </div>

        <div className="game-flow">
          <div className="text-box">
            <h3>🔎 ゲームの進め方</h3>
            <ol>
              <li>現場情報（状況の説明文）が与えられる</li>
              <li>あなたが犯人候補に質問</li>
              <li>各候補からの証言を収集</li>
              <li>証言と現場状況を照らし合わせ、矛盾や不自然な点を指摘</li>
              <li>犯人を特定でゲームクリア！</li>
            </ol>
          </div>
        </div>

        {!loading && (
          <div className="scenario-selection">
            <h3>🎭 シナリオを選択</h3>
            <div className="scenario-grid">
              {scenarios.map(scenario => (
                <div
                  key={scenario.id}
                  className={`scenario-card ${selectedScenario === scenario.id ? 'selected' : ''}`}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <h4>{scenario.title}</h4>
                  <p>{scenario.description}</p>
                </div>
              ))}
              <div
                className={`scenario-card ${selectedScenario === '' ? 'selected' : ''}`}
                onClick={() => setSelectedScenario('')}
              >
                <h4>🎲 ランダム選択</h4>
                <p>利用可能なシナリオからランダムに選択します</p>
              </div>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <Link
            to={selectedScenario ? `/game?scenario=${selectedScenario}` : "/game"}
            className="start-button"
          >
            🎮 ゲーム開始
          </Link>
          <Link to="/profile" className="profile-button">
            👤 プロフィール
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage
