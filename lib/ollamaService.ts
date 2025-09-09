export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OllamaResponse {
  model: string
  created_at: string
  message: {
    role: 'assistant'
    content: string
  }
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

export interface OllamaHealth {
  running: boolean
  modelAvailable: boolean
  error?: string
}

class OllamaService {
  private baseUrl: string
  private defaultModel: string

  constructor(baseUrl: string = 'http://localhost:11434', defaultModel: string = 'qwen2.5:7b-instruct') {
    this.baseUrl = baseUrl
    this.defaultModel = defaultModel
  }

  /**
   * Check if Ollama service is running and the default model is available
   */
  async checkHealth(): Promise<OllamaHealth> {
    try {
      // Check if Ollama service is running
      const response = await fetch(`${this.baseUrl}/api/tags`)
      if (!response.ok) {
        return {
          running: false,
          modelAvailable: false,
          error: `Ollama service not responding (${response.status})`
        }
      }

      const tags = await response.json()
      const models = tags.models || []
      
      // Check if our default model is available
      const modelAvailable = models.some((model: any) => 
        model.name === this.defaultModel || model.name.startsWith(this.defaultModel)
      )

      return {
        running: true,
        modelAvailable,
        error: modelAvailable ? undefined : `Model ${this.defaultModel} not found`
      }
    } catch (error) {
      return {
        running: false,
        modelAvailable: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Ollama'
      }
    }
  }

  /**
   * Generate a response using the Ollama API
   */
  async generateResponse(messages: OllamaMessage[], model?: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || this.defaultModel,
        messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          num_predict: 1000,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    const data: OllamaResponse = await response.json()
    return data.message.content
  }

  /**
   * Generate a streaming response using the Ollama API
   */
  async *generateStreamResponse(messages: OllamaMessage[], model?: string): AsyncGenerator<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || this.defaultModel,
        messages,
        stream: true,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          num_predict: 1000,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('No response body for streaming')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const data: OllamaResponse = JSON.parse(line)
            if (data.message?.content) {
              yield data.message.content
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            continue
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * Pull the default model if it's not available
   */
  async pullModel(model?: string): Promise<void> {
    const modelName = model || this.defaultModel
    
    const response = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: modelName
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to pull model ${modelName}: ${response.status} ${response.statusText}`)
    }

    // Wait for the model to be fully pulled
    const reader = response.body?.getReader()
    if (reader) {
      const decoder = new TextDecoder()
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.trim())
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line)
              if (data.status === 'success') {
                return
              }
            } catch (parseError) {
              continue
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/tags`)
    
    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.status} ${response.statusText}`)
    }

    const tags = await response.json()
    return (tags.models || []).map((model: any) => model.name)
  }

  /**
   * Get model information
   */
  async getModelInfo(model?: string): Promise<any> {
    const modelName = model || this.defaultModel
    
    const response = await fetch(`${this.baseUrl}/api/show`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: modelName
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to get model info: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }
}

// Export a singleton instance
export const ollamaService = new OllamaService()

// Export the class for testing or custom instances
export { OllamaService }

