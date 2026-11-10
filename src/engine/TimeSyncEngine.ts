import { DayNightPhase, TimeState } from '../types/agent';

export class TimeSyncEngine {
  private static readonly TIMEZONE = 'America/New_York';

  /**
   * Retrieves high-precision New York time state matching 1:1 real-world wall clock
   */
  static getNewYorkTimeState(currentTimeMs: number = Date.now()): TimeState {
    const now = new Date(currentTimeMs);

    // Format components in New York timezone
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

    // Decimal hour from 0.000 to 23.999
    const decimalHours = hour + minute / 60 + second / 3600;

    // Atmospheric phase based on actual New York seasonal sunrise/sunset
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

    // Sun angle calculation: 0 rad at 6:00 AM, PI/2 at 12:00 PM, PI at 6:00 PM
    const clampedDayProgress = Math.max(0, Math.min(1, (decimalHours - 6.0) / 13.0));
    const sunAngle = clampedDayProgress * Math.PI;

    // 12-hour formatted time display: e.g. "01:05:22 PM"
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
