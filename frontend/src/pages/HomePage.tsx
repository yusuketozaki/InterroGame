import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="title-overlay">
          <h1 className="game-title">🕵️‍♂️ 犯人を導けワトソン！</h1>
          <p className="game-subtitle">推理ゲーム</p>
        </div>

        <div className="game-description">
          <div className="text-box">
            <h2>🔍 ゲーム概要</h2>
            <p>ワトソン（ユーザ）は殺人事件の現場に到着。</p>
            <p>犯人候補は 3人、手がかりとなる証拠も判明済み。</p>

            <h3>🎯 あなたの役目</h3>
            <ul>
              <li>犯人候補に聞き取り調査を行い、矛盾点を発見</li>
              <li>犯人特定する！</li>
            </ul>

            <h3>👥 登場人物</h3>
            <div className="characters">
              <div className="character">
                <h4>🗣 ワトソン（あなた）</h4>
                <p>犯人候補に数回だけ質問できる</p>
              </div>
              <div className="character">
                <h4>🤖 犯人候補たち（LLM）</h4>
                <p>それぞれ特定の発言パターンを学習したLLM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="game-flow">
          <div className="text-box">
            <h3>🔎 ゲームの進め方</h3>
            <ol>
              <li>現場情報（状況の説明文）が与えられる</li>
              <li>ワトソンが犯人候補に質問</li>
              <li>各候補からの証言を収集</li>
              <li>証言と現場状況を照らし合わせ、矛盾や不自然な点を指摘</li>
              <li>犯人を特定でゲームクリア！</li>
            </ol>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/game" className="start-button">
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
