import React, { useState, useEffect, useCallback } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info, Settings } from 'lucide-react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationSystemProps {
  notifications: Notification[]
  onNotificationRead: (id: string) => void
  onNotificationDismiss: (id: string) => void
  onClearAll: () => void
}

export default function NotificationSystem({
  notifications,
  onNotificationRead,
  onNotificationDismiss,
  onClearAll
}: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    soundEnabled: true,
    desktopNotifications: true,
    autoHide: true,
    autoHideDelay: 5000
  })

  const unreadCount = notifications.filter(n => !n.read).length

  // Tocar som de notificação
  const playNotificationSound = useCallback(() => {
    if (settings.soundEnabled) {
      const audio = new Audio('/notification.mp3')
      audio.play().catch(() => {
        // Fallback para som simples se o arquivo não existir
        // Fallback para som simples se o arquivo não existir
        try {
          // @ts-expect-error - webkitAudioContext é suportado em alguns navegadores
          const AudioContextClass = window.AudioContext || window.webkitAudioContext
          const context = new AudioContextClass()
          const oscillator = context.createOscillator()
          const gainNode = context.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(context.destination)
          
          oscillator.frequency.setValueAtTime(800, context.currentTime)
          gainNode.gain.setValueAtTime(0.1, context.currentTime)
          
          oscillator.start(context.currentTime)
          oscillator.stop(context.currentTime + 0.2)
        } catch {
          console.log('Audio fallback não suportado')
        }
      })
    }
  }, [settings.soundEnabled])

  // Mostrar notificação desktop
  const showDesktopNotification = useCallback((notification: Notification) => {
    if (settings.desktopNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon.png',
          badge: '/icon.png'
        })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/icon.png',
              badge: '/icon.png'
            })
          }
        })
      }
    }
  }, [settings.desktopNotifications])

  // Auto-hide notificações
  useEffect(() => {
    if (settings.autoHide && isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false)
      }, settings.autoHideDelay)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, settings.autoHide, settings.autoHideDelay])

  // Tocar som quando nova notificação chegar
  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].read) {
      playNotificationSound()
      showDesktopNotification(notifications[0])
    }
  }, [notifications, playNotificationSound, showDesktopNotification])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }



  return (
    <div className="relative">
      {/* Botão de Notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        title="Notificações"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Painel de Notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              🔔 Notificações
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
                title="Configurações"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={onClearAll}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpar todas
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Configurações */}
          {showSettings && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-3">⚙️ Configurações</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Som de notificação</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.desktopNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, desktopNotifications: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Notificações desktop</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoHide}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoHide: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Auto-ocultar</span>
                </label>
                
                {settings.autoHide && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Delay (ms): {settings.autoHideDelay}
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="10000"
                      step="500"
                      value={settings.autoHideDelay}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoHideDelay: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de Notificações */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onNotificationRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onNotificationDismiss(notification.id)
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          
                          {notification.action && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                notification.action!.onClick()
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {notification.action.label}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
