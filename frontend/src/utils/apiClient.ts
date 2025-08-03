// API関連の型定義とユーティリティ関数
import AdminConfigManager from './adminConfig'

export interface ApiMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatCompletionRequest {
  model?: string
  system_message: string
  messages: Record<string, ApiMessage>
  stream?: boolean
  think?: boolean
}

export interface ChatCompletionResponse {
  message: string
}

// バックエンドAPIのベースURL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export class ApiClient {
  static async sendChatCompletion(request: ChatCompletionRequest): Promise<string> {
    try {
      // 管理者設定から現在のモデルを取得
      const currentModel = AdminConfigManager.getCurrentModel()
      const finalRequest = {
        ...request,
        model: currentModel
      }

      console.log('API送信直前の最終データ:', {
        url: `${API_BASE_URL}/v1/api/chat`,
        model: currentModel,
        request: {
          ...finalRequest,
          system_message: finalRequest.system_message.substring(0, 300) + '...',
        }
      })

      const response = await fetch(`${API_BASE_URL}/v1/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalRequest),
      })

      console.log('APIレスポンス受信:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ChatCompletionResponse = await response.json()
      console.log('APIレスポンスデータ:', {
        messageLength: data.message.length,
        messagePreview: data.message.substring(0, 100) + '...'
      })
      return data.message
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  }

  // 容疑者向けのシステムプロンプトを生成（外部設定から取得）
  static generateSuspectSystemPrompt(_suspectId: number, systemPrompt: string): string {
    return systemPrompt || '容疑者として質問に答えてください。短く自然な日本語で答える。'
  }

  // 会話履歴をAPI形式に変換（容疑者ごとにフィルタリング）
  static convertTestimoniesToMessages(testimonies: Array<{
    suspectId: number
    question: string
    answer: string
  }>, currentQuestion: string, targetSuspectId: number): Record<string, ApiMessage> {
    const messages: Record<string, ApiMessage> = {}
    let messageIndex = 1

    // 指定された容疑者の過去の会話履歴のみを追加
    const suspectTestimonies = testimonies.filter(testimony => testimony.suspectId === targetSuspectId)

    suspectTestimonies.forEach((testimony) => {
      messages[`message${messageIndex}`] = {
        role: 'user',
        content: testimony.question
      }
      messageIndex++

      messages[`message${messageIndex}`] = {
        role: 'assistant',
        content: testimony.answer
      }
      messageIndex++
    })

    // 現在の質問を追加
    messages[`message${messageIndex}`] = {
      role: 'user',
      content: currentQuestion
    }

    return messages
  }

  // 容疑者ごとの対話履歴を取得するヘルパー関数
  static getSuspectConversationHistory(testimonies: Array<{
    suspectId: number
    question: string
    answer: string
    timestamp: Date
  }>, suspectId: number): Array<{
    suspectId: number
    question: string
    answer: string
    timestamp: Date
  }> {
    return testimonies.filter(testimony => testimony.suspectId === suspectId)
  }

  // 容疑者ごとの質問数を取得
  static getSuspectQuestionCount(testimonies: Array<{
    suspectId: number
    question: string
    answer: string
  }>, suspectId: number): number {
    return testimonies.filter(testimony => testimony.suspectId === suspectId).length
  }
}
