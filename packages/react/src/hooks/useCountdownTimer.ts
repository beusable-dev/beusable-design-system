import { useEffect, useState } from 'react';

/**
 * 초 단위 숫자를 `m:ss` 형식 문자열로 변환한다.
 *
 * @param seconds - 포맷할 남은 시간(초).
 * @returns `"m:ss"` 형식의 문자열.
 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * 초 단위 카운트다운 훅.
 *
 * - `timerSeconds`가 undefined면 훅은 비활성(no-op) 상태입니다.
 * - `timerSeconds`가 변경되면 카운트다운을 재시작합니다.
 * - 카운트다운이 0에 도달하면 `onTimerEnd`를 호출합니다.
 *
 * @param timerSeconds - 카운트다운 시작 초. `undefined`면 타이머를 비활성화한다.
 * @param onTimerEnd - 카운트다운이 0에 도달했을 때 한 번 호출할 콜백.
 * @returns `displayTimer` — `"m:ss"` 형식 문자열. `timerSeconds`가 없으면 `undefined`.
 *
 * @example
 * const { displayTimer } = useCountdownTimer(299, () => setExpired(true));
 */
export function useCountdownTimer(
  timerSeconds?: number,
  onTimerEnd?: () => void,
): { displayTimer: string | undefined } {
  const [remaining, setRemaining] = useState<number | null>(
    timerSeconds != null ? timerSeconds : null,
  );

  useEffect(() => {
    if (timerSeconds == null) return;
    setRemaining(timerSeconds);
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev == null || prev <= 1) {
          clearInterval(id);
          onTimerEnd?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  // onTimerEnd는 매 렌더마다 새 함수가 올 수 있어 의존성에서 제외
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerSeconds]);

  const displayTimer =
    timerSeconds != null ? (remaining != null ? formatTime(remaining) : '') : undefined;

  return { displayTimer };
}
