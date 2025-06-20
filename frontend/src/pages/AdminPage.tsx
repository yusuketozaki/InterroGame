import { useState } from 'react'
import { Link } from 'react-router-dom'

interface CaseTemplate {
  id: number
  title: string
  location: string
  time: string
  victim: string
  evidence: string
  details: string
  suspects: {
    id: number
    name: string
    description: string
    personality: string
    isGuilty: boolean
  }[]
  createdAt: Date
  isActive: boolean
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<'cases' | 'create' | 'analytics'>('cases')
  const [cases, setCases] = useState<CaseTemplate[]>([
    {
      id: 1,
      title: 'オフィス殺人事件',
      location: 'オフィスビルの20階',
      time: '午後8時頃',
      victim: '鈴木一郎（会社員、45歳）',
      evidence: '窓際で発見、机の上に散乱した書類、ドアは施錠されていた',
      details: 'エレベーターの防犯カメラには午後7時30分に3人の容疑者全員がビルに入る姿が記録されている。',
      suspects: [
        {
          id: 1,
          name: '田中太郎',
          description: '被害者の同僚',
          personality: '真面目で几帳面だが、時々嘘をつく傾向がある',
          isGuilty: false
        },
        {
          id: 2,
          name: '佐藤花子',
          description: '被害者の友人',
          personality: '感情的で矛盾した発言をしやすい',
          isGuilty: true
        },
        {
          id: 3,
          name: '山田次郎',
          description: '警備員',
          personality: '正直で記憶力が良いが、時刻に関してはあいまい',
          isGuilty: false
        }
      ],
      createdAt: new Date('2025-06-15'),
      isActive: true
    }
  ])

  const [newCase, setNewCase] = useState<Partial<CaseTemplate>>({
    title: '',
    location: '',
    time: '',
    victim: '',
    evidence: '',
    details: '',
    suspects: []
  })

  const handleCreateCase = () => {
    if (!newCase.title || !newCase.location || !newCase.victim) {
      alert('必須項目を入力してください')
      return
    }

    const caseToAdd: CaseTemplate = {
      id: cases.length + 1,
      title: newCase.title!,
      location: newCase.location!,
      time: newCase.time || '',
      victim: newCase.victim!,
      evidence: newCase.evidence || '',
      details: newCase.details || '',
      suspects: newCase.suspects || [],
      createdAt: new Date(),
      isActive: false
    }

    setCases([...cases, caseToAdd])
    setNewCase({
      title: '',
      location: '',
      time: '',
      victim: '',
      evidence: '',
      details: '',
      suspects: []
    })
    alert('事件テンプレートが作成されました')
  }

  const toggleCaseStatus = (caseId: number) => {
    setCases(cases.map(c =>
      c.id === caseId ? { ...c, isActive: !c.isActive } : c
    ))
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <Link to="/" className="back-button">← ホームに戻る</Link>
        <h1>⚙️ 管理者画面</h1>
      </header>

      <div className="admin-content">
        <nav className="admin-tabs">
          <button
            className={`tab ${activeTab === 'cases' ? 'active' : ''}`}
            onClick={() => setActiveTab('cases')}
          >
            📁 事件管理
          </button>
          <button
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            ➕ 事件作成
          </button>
          <button
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 分析
          </button>
        </nav>

        {activeTab === 'cases' && (
          <section className="cases-management">
            <h2>事件テンプレート管理</h2>
            <div className="cases-list">
              {cases.map(caseItem => (
                <div key={caseItem.id} className={`case-card ${caseItem.isActive ? 'active' : 'inactive'}`}>
                  <div className="case-header">
                    <h3>{caseItem.title}</h3>
                    <div className="case-status">
                      <span className={`status-badge ${caseItem.isActive ? 'active' : 'inactive'}`}>
                        {caseItem.isActive ? '有効' : '無効'}
                      </span>
                      <button
                        onClick={() => toggleCaseStatus(caseItem.id)}
                        className="toggle-button"
                      >
                        {caseItem.isActive ? '無効化' : '有効化'}
                      </button>
                    </div>
                  </div>
                  <div className="case-details">
                    <p><strong>場所:</strong> {caseItem.location}</p>
                    <p><strong>被害者:</strong> {caseItem.victim}</p>
                    <p><strong>容疑者数:</strong> {caseItem.suspects.length}人</p>
                    <p><strong>作成日:</strong> {caseItem.createdAt.toLocaleDateString('ja-JP')}</p>
                  </div>
                  <div className="case-suspects">
                    <h4>容疑者:</h4>
                    {caseItem.suspects.map(suspect => (
                      <span key={suspect.id} className={`suspect-tag ${suspect.isGuilty ? 'guilty' : 'innocent'}`}>
                        {suspect.name} {suspect.isGuilty ? '(犯人)' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'create' && (
          <section className="case-creation">
            <h2>新しい事件テンプレートを作成</h2>
            <form className="case-form">
              <div className="form-group">
                <label>事件タイトル *</label>
                <input
                  type="text"
                  value={newCase.title || ''}
                  onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                  placeholder="例: オフィス殺人事件"
                />
              </div>

              <div className="form-group">
                <label>場所 *</label>
                <input
                  type="text"
                  value={newCase.location || ''}
                  onChange={(e) => setNewCase({...newCase, location: e.target.value})}
                  placeholder="例: オフィスビルの20階"
                />
              </div>

              <div className="form-group">
                <label>時刻</label>
                <input
                  type="text"
                  value={newCase.time || ''}
                  onChange={(e) => setNewCase({...newCase, time: e.target.value})}
                  placeholder="例: 午後8時頃"
                />
              </div>

              <div className="form-group">
                <label>被害者 *</label>
                <input
                  type="text"
                  value={newCase.victim || ''}
                  onChange={(e) => setNewCase({...newCase, victim: e.target.value})}
                  placeholder="例: 鈴木一郎（会社員、45歳）"
                />
              </div>

              <div className="form-group">
                <label>証拠・状況</label>
                <textarea
                  value={newCase.evidence || ''}
                  onChange={(e) => setNewCase({...newCase, evidence: e.target.value})}
                  placeholder="例: 窓際で発見、机の上に散乱した書類、ドアは施錠されていた"
                />
              </div>

              <div className="form-group">
                <label>詳細情報</label>
                <textarea
                  value={newCase.details || ''}
                  onChange={(e) => setNewCase({...newCase, details: e.target.value})}
                  placeholder="例: エレベーターの防犯カメラには午後7時30分に3人の容疑者全員がビルに入る姿が記録されている。"
                />
              </div>

              <button
                type="button"
                onClick={handleCreateCase}
                className="create-button"
              >
                事件テンプレートを作成
              </button>
            </form>
          </section>
        )}

        {activeTab === 'analytics' && (
          <section className="analytics">
            <h2>ゲーム分析</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>📊 総合統計</h3>
                <div className="stat-item">
                  <span>総プレイ数:</span>
                  <span>1,234回</span>
                </div>
                <div className="stat-item">
                  <span>平均正解率:</span>
                  <span>67.8%</span>
                </div>
                <div className="stat-item">
                  <span>アクティブユーザー:</span>
                  <span>89人</span>
                </div>
              </div>

              <div className="analytics-card">
                <h3>🎯 事件別正解率</h3>
                <div className="case-stats">
                  <div className="case-stat">
                    <span>オフィス殺人事件:</span>
                    <span>72.4%</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>❓ 質問パターン分析</h3>
                <div className="question-stats">
                  <div className="question-stat">
                    <span>平均質問数:</span>
                    <span>3.8回</span>
                  </div>
                  <div className="question-stat">
                    <span>最多質問タイプ:</span>
                    <span>アリバイ確認</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default AdminPage
