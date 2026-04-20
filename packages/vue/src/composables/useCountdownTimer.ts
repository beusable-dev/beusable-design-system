import { ref, computed, watch, onUnmounted } from 'vue';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * 초 단위 카운트다운 composable.
 *
 * - timerSeconds() 가 undefined 면 비활성(no-op) 상태입니다.
 * - timerSeconds() 가 변경되면 카운트다운을 재시작합니다.
 * - 카운트다운이 0에 도달하면 onTimerEnd 를 호출합니다.
 *
 * @returns displayTimer — `"m:ss"` 형식 문자열. timerSeconds 없으면 undefined.
 *
 * @example
 * const { displayTimer } = useCountdownTimer(() => props.timerSeconds, () => setExpired(true));
 */
export function useCountdownTimer(
  timerSeconds: () => number | undefined,
  onTimerEnd?: () => void,
) {
  const remaining = ref<number | null>(null);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  function clearTimer() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  watch(
    timerSeconds,
    (seconds) => {
      clearTimer();
      if (seconds == null) {
        remaining.value = null;
        return;
      }
      remaining.value = seconds;
      intervalId = setInterval(() => {
        if (remaining.value == null || remaining.value <= 1) {
          clearTimer();
          onTimerEnd?.();
          remaining.value = 0;
          return;
        }
        remaining.value--;
      }, 1000);
    },
    { immediate: true },
  );

  onUnmounted(clearTimer);

  const displayTimer = computed<string | undefined>(() => {
    const seconds = timerSeconds();
    if (seconds == null) return undefined;
    return remaining.value != null ? formatTime(remaining.value) : '';
  });

  return { displayTimer };
}
