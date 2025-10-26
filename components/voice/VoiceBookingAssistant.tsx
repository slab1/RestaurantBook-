'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Bot, User, Loader } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface VoiceBookingProps {
  onBookingComplete: (bookingData: any) => void;
  className?: string;
}

interface ConversationState {
  currentStep: 'greeting' | 'restaurant' | 'datetime' | 'party_size' | 'confirmation' | 'complete';
  extractedData: {
    restaurantName?: string;
    date?: string;
    time?: string;
    partySize?: number;
    preferences?: string[];
  };
  conversation: Array<{
    speaker: 'user' | 'assistant';
    message: string;
    timestamp: Date;
  }>;
}

const CONVERSATION_FLOWS = {
  greeting: [
    "Hi! I'm your voice booking assistant. I can help you make a restaurant reservation.",
    "What restaurant would you like to book? You can name any restaurant you have in mind."
  ],
  restaurant: [
    "Great choice! What date would you like to make the reservation?",
    "On what date would you like to dine?"
  ],
  datetime: [
    "What time would you prefer for your reservation?",
    "What time works best for you?"
  ],
  party_size: [
    "How many people will be dining?",
    "What's the party size for your reservation?"
  ],
  confirmation: [
    "Let me confirm your reservation details:",
    "Here's what I've got for you:"
  ],
  complete: [
    "Your reservation has been confirmed!",
    "Perfect! Your booking is all set."
  ]
};

const KEYWORDS = {
  restaurants: ['pizza', 'italian', 'chinese', 'mexican', 'indian', 'burger', 'seafood', 'steak'],
  times: ['6:00', '6:30', '7:00', '7:30', '8:00', '8:30'],
  partySizes: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'],
  confirmations: ['yes', 'confirm', 'correct', 'right', 'okay', 'sure'],
  negations: ['no', 'wrong', 'change', 'different', 'no']
};

export function VoiceBookingAssistant({ onBookingComplete, className }: VoiceBookingProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<ConversationState>({
    currentStep: 'greeting',
    extractedData: {},
    conversation: []
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'aborted') {
          toast({
            title: "Voice Recognition Error",
            description: "There was an issue with voice recognition. Please try again.",
            variant: "destructive",
          });
        }
      };

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        handleUserInput(transcript);
      };

      recognitionRef.current = recognition;
      synthRef.current = window.speechSynthesis;
      setIsInitialized(true);
    } else {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition. Please use Chrome or Safari.",
        variant: "destructive",
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleUserInput = (input: string) => {
    const userMessage = {
      speaker: 'user' as const,
      message: input,
      timestamp: new Date()
    };

    setConversation(prev => ({
      ...prev,
      conversation: [...prev.conversation, userMessage]
    }));

    // Process the input based on current step
    processInput(input);
  };

  const processInput = (input: string) => {
    const lowerInput = input.toLowerCase();
    const extractedData = { ...conversation.extractedData };

    // Extract information based on current step
    switch (conversation.currentStep) {
      case 'greeting':
      case 'restaurant':
        // Extract restaurant name
        const restaurantMatch = extractRestaurant(lowerInput);
        if (restaurantMatch) {
          extractedData.restaurantName = restaurantMatch;
          advanceToNextStep('datetime');
        } else {
          respondWithClarification("I couldn't find that restaurant. Could you try again?");
        }
        break;

      case 'datetime':
        // Extract date and time
        const dateMatch = extractDate(lowerInput);
        const timeMatch = extractTime(lowerInput);
        
        if (dateMatch) extractedData.date = dateMatch;
        if (timeMatch) extractedData.time = timeMatch;

        if (extractedData.date && extractedData.time) {
          advanceToNextStep('party_size');
        } else {
          respondWithClarification("I need both the date and time. Could you provide both?");
        }
        break;

      case 'party_size':
        // Extract party size
        const partyMatch = extractPartySize(lowerInput);
        if (partyMatch) {
          extractedData.partySize = partyMatch;
          advanceToNextStep('confirmation');
        } else {
          respondWithClarification("How many people will be dining?");
        }
        break;

      case 'confirmation':
        // Handle confirmation or changes
        if (isPositiveResponse(lowerInput)) {
          makeBooking(extractedData);
        } else {
          respondWithClarification("Let me help you correct the information. What would you like to change?");
          conversation.currentStep = 'greeting'; // Restart flow
        }
        break;
    }

    setConversation(prev => ({
      ...prev,
      extractedData
    }));
  };

  const advanceToNextStep = (nextStep: ConversationState['currentStep']) => {
    const assistantMessage = {
      speaker: 'assistant' as const,
      message: getAssistantResponse(nextStep),
      timestamp: new Date()
    };

    setConversation(prev => ({
      ...prev,
      currentStep: nextStep,
      conversation: [...prev.conversation, assistantMessage]
    }));

    speak(getAssistantResponse(nextStep));
  };

  const makeBooking = async (bookingData: any) => {
    try {
      // Call booking API
      const response = await fetch('/api/bookings/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantName: bookingData.restaurantName,
          bookingDate: bookingData.date,
          bookingTime: bookingData.time,
          partySize: bookingData.partySize,
          source: 'voice',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onBookingComplete(result.data);
        advanceToNextStep('complete');
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an issue making your reservation. Please try again or use the web form.",
        variant: "destructive",
      });
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    }
  };

  const getAssistantResponse = (step: ConversationState['currentStep']) => {
    const responses = CONVERSATION_FLOWS[step];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const extractRestaurant = (input: string): string | null => {
    // Simple restaurant extraction - in production, this would use NLP
    const words = input.split(' ');
    for (const word of words) {
      if (KEYWORDS.restaurants.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1) + ' Restaurant';
      }
    }
    
    // Check if input looks like a restaurant name
    const restaurantPattern = /\b([A-Za-z\s]+(?:restaurant|cafe|grill|bistro|bar))\b/i;
    const match = input.match(restaurantPattern);
    return match ? match[1].trim() : null;
  };

  const extractDate = (input: string): string | null => {
    const datePatterns = [
      /\b(today|tomorrow|today)\b/i,
      /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b\s*(\d{1,2})?\b/i
    ];

    for (const pattern of datePatterns) {
      const match = input.match(pattern);
      if (match) {
        // Convert to proper date format
        const today = new Date();
        if (input.includes('today')) {
          return today.toISOString().split('T')[0];
        } else if (input.includes('tomorrow')) {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          return tomorrow.toISOString().split('T')[0];
        }
        return new Date().toISOString().split('T')[0]; // Default to today
      }
    }
    return null;
  };

  const extractTime = (input: string): string | null => {
    const timePatterns = [
      /\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/i,
      /\b(\d{1,2})\s*(am|pm)\b/i,
      /\b(6|7|8|9):?\s*30?\s*(pm)?\b/i
    ];

    for (const pattern of timePatterns) {
      const match = input.match(pattern);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const ampm = match[3] || '';

        if (ampm.toLowerCase() === 'pm' && hour !== 12) {
          hour += 12;
        } else if (ampm.toLowerCase() === 'am' && hour === 12) {
          hour = 0;
        }

        // Default to evening if no AM/PM specified
        if (!ampm && hour < 6) {
          hour += 12;
        }

        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
    }
    return null;
  };

  const extractPartySize = (input: string): number | null => {
    // Extract numbers from input
    const numberMatch = input.match(/\b(\d+)\b/);
    if (numberMatch) {
      return parseInt(numberMatch[1]);
    }

    // Check for word-based numbers
    const wordNumbers: Record<string, number> = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    };

    for (const [word, number] of Object.entries(wordNumbers)) {
      if (input.includes(word)) {
        return number;
      }
    }
    return null;
  };

  const isPositiveResponse = (input: string): boolean => {
    return KEYWORDS.confirmations.some(word => input.includes(word));
  };

  const respondWithClarification = (message: string) => {
    const assistantMessage = {
      speaker: 'assistant' as const,
      message,
      timestamp: new Date()
    };

    setConversation(prev => ({
      ...prev,
      conversation: [...prev.conversation, assistantMessage]
    }));

    speak(message);
  };

  const toggleMute = () => {
    if (synthRef.current) {
      if (isSpeaking) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
    }
  };

  const clearConversation = () => {
    setConversation({
      currentStep: 'greeting',
      extractedData: {},
      conversation: []
    });
  };

  if (!isInitialized) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Initializing voice assistant...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Voice Booking Assistant
        </CardTitle>
        <CardDescription>
          Make a reservation using voice commands
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="flex items-center gap-2"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening ? 'Stop Listening' : 'Start Voice Booking'}
          </Button>
          
          {isSpeaking && (
            <Button
              onClick={toggleMute}
              variant="outline"
              size="lg"
            >
              <VolumeX className="h-4 w-4" />
              Stop Speaking
            </Button>
          )}
        </div>

        {/* Current Step Indicator */}
        <div className="text-center">
          <Badge variant="secondary" className="mb-2">
            Step: {conversation.currentStep.replace('_', ' ')}
          </Badge>
        </div>

        {/* Conversation Display */}
        <div className="max-h-64 overflow-y-auto space-y-3 border rounded-lg p-4 bg-gray-50">
          {conversation.conversation.length === 0 && (
            <div className="text-center text-gray-500">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Click "Start Voice Booking" to begin your conversation</p>
            </div>
          )}
          
          {conversation.conversation.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.speaker === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.speaker === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                  <span className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{message.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Extracted Data Summary */}
        {Object.keys(conversation.extractedData).length > 0 && (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Booking Details:</h4>
              <div className="space-y-1 text-sm">
                {conversation.extractedData.restaurantName && (
                  <div><strong>Restaurant:</strong> {conversation.extractedData.restaurantName}</div>
                )}
                {conversation.extractedData.date && (
                  <div><strong>Date:</strong> {conversation.extractedData.date}</div>
                )}
                {conversation.extractedData.time && (
                  <div><strong>Time:</strong> {conversation.extractedData.time}</div>
                )}
                {conversation.extractedData.partySize && (
                  <div><strong>Party Size:</strong> {conversation.extractedData.partySize} people</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-center">
          <Button onClick={clearConversation} variant="outline" size="sm">
            Clear Conversation
          </Button>
        </div>

        {/* Voice Recognition Status */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Listening...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
