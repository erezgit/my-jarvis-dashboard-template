import { useEffect } from "react";
import { audioManager } from "./audioManager";
import { useVoiceChannel } from "./VoiceChannelProvider";

/**
 * App-level autoplay dispatcher. Subscribes to the voice channel regardless
 * of whether the panel is open, and plays new arrivals through the shared
 * audioManager when the user has voice_autoplay enabled.
 *
 * Renders nothing — it's purely a listener component.
 */
export function AutoplayManager() {
  const { settings, onSampleArrived } = useVoiceChannel();
  const autoplayEnabled = !!settings.voice_autoplay;

  useEffect(() => {
    const unsub = onSampleArrived((sample) => {
      if (!autoplayEnabled) return;
      if (!sample.audio_url) return;
      audioManager.play(sample.audio_url);
    });
    return unsub;
  }, [onSampleArrived, autoplayEnabled]);

  return null;
}
