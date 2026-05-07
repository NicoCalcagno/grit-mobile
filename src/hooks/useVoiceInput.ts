import { useState, useCallback, useEffect, useRef } from 'react';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import client from '../api/client';
import { VoiceResponseRequest, VoiceResponseResult, VoiceModificationAction } from '../types';
import { useWorkoutStore } from '../stores/workoutStore';

interface UseVoiceInputOptions {
  onResponse: (text: string) => void;
  language?: string;
  currentExerciseName?: string;
  currentSet?: number;
  heartRate?: number;
  perceivedExertion?: number;
  elapsedMinutes?: number;
}

interface UseVoiceInputReturn {
  isRecording: boolean;
  transcript: string;
  startRecording: () => void;
  stopRecording: () => void;
}

export function useVoiceInput({
  onResponse,
  language = 'it-IT',
  currentExerciseName,
  currentSet,
  heartRate,
  perceivedExertion,
  elapsedMinutes,
}: UseVoiceInputOptions): UseVoiceInputReturn {
  const [isRecording, setIsRecording] = useState(false);
  const transcriptRef = useRef('');
  const [transcript, setTranscript] = useState('');
  const { skipExercise } = useWorkoutStore();

  useEffect(() => {
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0] ?? '';
      transcriptRef.current = text;
      setTranscript(text);
    };
    Voice.onSpeechError = (_e: SpeechErrorEvent) => {
      setIsRecording(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startRecording = useCallback(async () => {
    transcriptRef.current = '';
    setTranscript('');
    setIsRecording(true);
    try {
      await Voice.start(language);
    } catch {
      setIsRecording(false);
    }
  }, [language]);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    try {
      await Voice.stop();
    } catch { /* ignore */ }

    const text = transcriptRef.current.trim();
    if (!text) return;

    try {
      const reqBody: VoiceResponseRequest = {
        transcribed_text: text,
        exercise_name: currentExerciseName,
        set_number: currentSet,
        heart_rate: heartRate,
        perceived_exertion: perceivedExertion,
        elapsed_minutes: elapsedMinutes,
        session_context: {},
      };

      const { data } = await client.post<VoiceResponseResult>('/coach/voice-response', reqBody);
      onResponse(data.text);

      // Apply modifications
      for (const mod of data.modifications ?? []) {
        if (mod.action === 'skip_exercise') {
          skipExercise();
        }
        // Other action types (reduce_sets, change_weight) require access to activePlan
        // They are handled at screen level by listening to the voice response
      }
    } catch {
      // Silent — voice input is non-critical
    }
  }, [currentExerciseName, currentSet, heartRate, perceivedExertion, elapsedMinutes, onResponse, skipExercise]);

  return { isRecording, transcript, startRecording, stopRecording };
}
