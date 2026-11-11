import { TimeState, DayNightPhase } from '../types/agent';

export type TimeMode = 'live' | 'day' | 'sunset' | 'night';

export class TimeSyncEngine {
  private static readonly TIMEZONE = 'America/New_York';
  private static activeTimeMode: TimeMode = 'live';

  static setTimeMode(mode: TimeMode) {
    this.activeTimeMode = mode;
  }

  static getTimeMode(): TimeMode {
    return this.activeTimeMode;
  }

  /**
   * Retrieves high-precision New York time state or overridden daylight mode
   */
  static getNewYorkTimeState(currentTimeMs: number = Date.now()): TimeState {
    const now = new Date(currentTimeMs);

    // If manual override is active
    if (this.activeTimeMode === 'day') {
      return {
        gameHours: 13.5,
        dayCount: 1,
        timeScale: 1,
        phase: 'day',
        isNight: false,
        sunAngle: Math.PI / 2,
        formattedTime: '01:30 PM ☀️ Sunlit',
        timeZoneName: 'Day Mode (Bright)',
      };
    }

    if (this.activeTimeMode === 'sunset') {
      return {
        gameHours: 18.5,
        dayCount: 1,
        timeScale: 1,
        phase: 'dusk',
        isNight: false,
        sunAngle: Math.PI * 0.85,
        formattedTime: '06:30 PM 🌆 Golden',
        timeZoneName: 'Dusk Mode',
      };
    }

    if (this.activeTimeMode === 'night') {
      return {
        gameHours: 21.0,
        dayCount: 1,
        timeScale: 1,
        phase: 'night',
        isNight: true,
        sunAngle: Math.PI,
        formattedTime: '09:00 PM 🌙 Night',
        timeZoneName: 'Night Mode',
      };
    }

    // Default: 'live' New York Wall Clock
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.TIMEZONE,
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });

    const parts = formatter.formatToParts(now);
    let hour = 12;
    let minute = 0;
    let second = 0;
    let day = 1;

    for (const part of parts) {
      if (part.type === 'hour') hour = parseInt(part.value, 10);
      else if (part.type === 'minute') minute = parseInt(part.value, 10);
      else if (part.type === 'second') second = parseInt(part.value, 10);
      else if (part.type === 'day') day = parseInt(part.value, 10);
    }

    const decimalHours = hour + minute / 60 + second / 3600;

    let phase: DayNightPhase = 'day';
    let isNight = false;

    if (decimalHours >= 5.5 && decimalHours < 7.5) {
      phase = 'dawn';
      isNight = false;
    } else if (decimalHours >= 7.5 && decimalHours < 17.5) {
      phase = 'day';
      isNight = false;
    } else if (decimalHours >= 17.5 && decimalHours < 20.0) {
      phase = 'dusk';
      isNight = false;
    } else {
      phase = 'night';
      isNight = true;
    }

    const clampedDayProgress = Math.max(0, Math.min(1, (decimalHours - 6.0) / 13.0));
    const sunAngle = clampedDayProgress * Math.PI;

    const displayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const formattedTime = displayFormatter.format(now);

    return {
      gameHours: decimalHours,
      dayCount: day,
      timeScale: 1,
      phase,
      isNight,
      sunAngle,
      formattedTime,
      timeZoneName: 'NYC (UTC-4)',
    };
  }
}
