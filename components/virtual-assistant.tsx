'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, X, Send, Bot, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ollamaService, OllamaMessage } from '@/lib/ollamaService'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

export function VirtualAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm Nour, your ASI assistant. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [ollamaError, setOllamaError] = useState<string>('')
  const [userMessageCount, setUserMessageCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Check Ollama status when component mounts
  useEffect(() => {
    console.log('VirtualAssistant component mounted!')
    checkOllamaStatus()
  }, [])

  const checkOllamaStatus = async () => {
    try {
      setOllamaStatus('checking')
      const health = await ollamaService.checkHealth()
      
      if (health.running && health.modelAvailable) {
        setOllamaStatus('connected')
        setOllamaError('')
      } else {
        setOllamaStatus('error')
        setOllamaError(health.error || 'Ollama service unavailable')
      }
    } catch (error) {
      setOllamaStatus('error')
      setOllamaError(error instanceof Error ? error.message : 'Failed to check Ollama status')
    }
  }

  const resetContext = () => {
    setMessages([{
      id: '1',
      content: "Hi! I'm Nour, your ASI assistant. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date()
    }])
    setUserMessageCount(0)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping || isStreaming) return

    const newUserCount = userMessageCount + 1
    
    // Check if we've reached the message limit
    if (newUserCount > 10) {
      resetContext()
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setUserMessageCount(newUserCount)
    setInputValue('')
    setIsTyping(true)
    setIsStreaming(true)
    setStreamingContent('')

    try {
      // Convert messages to Ollama format
      const ollamaMessages: OllamaMessage[] = [
        {
          role: 'system',
          content: 'You are Nour, a helpful virtual assistant for the Algerian Startup Initiative (ASI) website. You help users with information about startups, entrepreneurship, and business development. Be concise, helpful, and professional.'
        },
        ...messages.map(msg => ({
          role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage.content
        }
      ]

      // Generate streaming response
      let fullResponse = ''
      for await (const chunk of ollamaService.generateStreamResponse(ollamaMessages)) {
        fullResponse += chunk
        setStreamingContent(fullResponse)
      }

      // Add the complete response to messages
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: fullResponse,
        sender: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setStreamingContent('')
    } catch (error) {
      console.error('Error generating response:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error while processing your request. Please try again or check if Ollama is running.",
        sender: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
      setIsStreaming(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const retryConnection = () => {
    checkOllamaStatus()
  }

  return (
    <>
      {/* Enhanced Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-3xl",
          "bg-gradient-to-br from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary hover:to-primary",
          isOpen && "from-destructive via-destructive/90 to-destructive/80 hover:from-destructive/90 hover:via-destructive hover:to-destructive",
          "backdrop-blur-sm border border-white/20 text-white"
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="h-8 w-8 drop-shadow-lg" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-8 w-8 drop-shadow-lg" />
            <div className={cn(
              "absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white",
              ollamaStatus === 'connected' ? "bg-green-400 animate-pulse" : 
              ollamaStatus === 'error' ? "bg-red-400" : "bg-yellow-400"
            )}></div>
          </div>
        )}
      </Button>

      {/* Enhanced Chat Interface */}
      {isOpen && (
        <Card className="fixed bottom-28 right-6 z-40 h-96 w-80 shadow-2xl border-0 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 rounded-2xl overflow-hidden border border-border/50">
          {/* Enhanced Header */}
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border/50">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className={cn(
                  "absolute -top-1 -right-1 h-2 w-2 rounded-full",
                  ollamaStatus === 'connected' ? "bg-green-400 animate-pulse" : 
                  ollamaStatus === 'error' ? "bg-red-400" : "bg-yellow-400"
                )}></div>
              </div>
              <div>
              
                <div className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                  {ollamaStatus === 'connected' && (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      AI Connected
                    </>
                  )}
                  {ollamaStatus === 'error' && (
                    <>
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      AI Disconnected
                    </>
                  )}
                  {ollamaStatus === 'checking' && (
                    <>
                      <div className="h-3 w-3 rounded-full bg-yellow-400 animate-pulse" />
                      Checking...
                    </>
                  )}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Enhanced Messages Area */}
            <ScrollArea className="h-64 px-4 pb-4 bg-gradient-to-b from-transparent to-muted/20">
              <div className="space-y-4 pt-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border transition-all duration-200",
                        message.sender === 'user'
                          ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary/30 shadow-primary/20"
                          : "bg-card text-card-foreground border-border/50 shadow-muted/20 hover:shadow-md"
                      )}
                    >
                      {message.sender === 'assistant' ? (
                        <div>
                          <div className="prose prose-sm max-w-none prose-headings:text-card-foreground prose-p:text-card-foreground prose-strong:text-card-foreground prose-code:text-card-foreground prose-pre:bg-muted prose-pre:text-card-foreground">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                          <button
                            onClick={() => window.open('mailto:anisbensab@gmail.com', '_blank')}
                            className="mt-3 text-xs font-bold underline text-primary hover:text-primary/80 transition-colors duration-200"
                          >
                            Contact Team
                          </button>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Streaming response */}
                {isStreaming && streamingContent && (
                  <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 justify-start">
                    <div className="bg-card rounded-2xl px-4 py-3 text-sm border border-border/50 shadow-muted/20">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                          <div className="h-2 w-2 animate-bounce rounded-full bg-primary/70" style={{ animationDelay: '0.1s' }}></div>
                          <div className="h-2 w-2 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-muted-foreground">AI is typing...</span>
                      </div>
                      <div className="mt-2 text-card-foreground">
                        <div className="prose prose-sm max-w-none prose-headings:text-card-foreground prose-p:text-card-foreground prose-strong:text-card-foreground prose-code:text-card-foreground prose-pre:bg-muted prose-pre:text-card-foreground">
                          <ReactMarkdown>{streamingContent}</ReactMarkdown>
                        </div>
                        <button
                          onClick={() => window.open('mailto:anisbensab@gmail.com', '_blank')}
                          className="mt-3 text-xs font-bold underline text-primary hover:text-primary/80 transition-colors duration-200"
                        >
                          Contact Team
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Connection error message */}
                {ollamaStatus === 'error' && (
                  <div className="flex items-start gap-3 justify-start">
                    <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-800">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="font-medium">Connection Error</span>
                      </div>
                      <p className="text-red-700 text-xs mb-2">{ollamaError}</p>
                      <Button
                        onClick={retryConnection}
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs border-red-300 text-red-700 hover:bg-red-100"
                      >
                        Retry Connection
                      </Button>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Enhanced Input Area */}
            <div className="border-t border-border/50 py-4 px-4 bg-gradient-to-t from-muted/30 to-transparent">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={ollamaStatus === 'connected' ? "Type your message..." : "AI not connected..."}
                    className="w-full rounded-2xl border-border/50 bg-background/80 backdrop-blur-sm focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 pr-12"
                    disabled={ollamaStatus !== 'connected' || isTyping || isStreaming}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  disabled={!inputValue.trim() || ollamaStatus !== 'connected' || isTyping || isStreaming}
                  className="shrink-0 rounded-2xl bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {/* Message limit notification */}
              <div className="mt-3 text-xs text-muted-foreground text-center">
                <span className="bg-muted/50 px-2 py-1 rounded-md">
                  Messages: {userMessageCount}/10 • Context restarts after limit
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
