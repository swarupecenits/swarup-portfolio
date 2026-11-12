import { useSyncExternalStore } from "react";
import styled from "styled-components";
import { FiMoon, FiSun } from "react-icons/fi";
import { describeTimeDifference, formatClock, getHourInZone, getUtcOffsetMinutes, getZoneName } from "../../utils/time";

const MINUTE = 60_000;

// Ticks at the start of every minute, and again whenever the tab becomes visible
// because timers in background tabs are throttled.
function subscribeToMinutes(onChange) {
  let timer = 0;
  const schedule = () => {
    timer = window.setTimeout(
      () => {
        onChange();
        schedule();
      },
      MINUTE - (Date.now() % MINUTE) + 50,
    );
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") onChange();
  };
  schedule();
  document.addEventListener("visibilitychange", onVisibilityChange);
  return () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}

const getCurrentMinute = () => Math.floor(Date.now() / MINUTE);

const Wrapper = styled.p`
  /* A size container must not shrink-to-fit (its content width counts as 0), so it stretches. */
  container-type: inline-size;
  align-self: stretch;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px 10px;
  color: var(--text-muted);
  font-size: 15px;
  font-variant-numeric: tabular-nums;

  svg {
    flex-shrink: 0;
    color: ${({ $daytime }) => ($daytime ? "var(--accent)" : "var(--text-soft)")};
  }

  strong {
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 500;
  }
`;

const Difference = styled.span`
  color: var(--text-dim);
  font-size: 14px;

  &::before {
    content: "·";
    margin-right: 10px;
    color: var(--text-dim);
  }

  /* Too narrow for one line: give the difference its own line rather than orphaning the dot. */
  @container (max-width: 400px) {
    flex-basis: 100%;
    text-align: center;

    &::before {
      content: none;
    }
  }
`;

/** The current time in `timeZone`, plus how far ahead or behind the visitor it is. */
export default function LocalTime({ timeZone }) {
  const minute = useSyncExternalStore(subscribeToMinutes, getCurrentMinute, getCurrentMinute);
  const now = new Date(minute * MINUTE);
  const hour = getHourInZone(now, timeZone);
  const daytime = hour >= 7 && hour < 22;
  const offset = getUtcOffsetMinutes(now, timeZone);
  // getTimezoneOffset() is the visitor's offset in minutes *behind* UTC.
  const difference = offset === null ? null : describeTimeDifference(offset + now.getTimezoneOffset());
  const zone = getZoneName(now, timeZone);

  return (
    <Wrapper $daytime={daytime}>
      {daytime ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
      <span>
        <strong>
          <time dateTime={now.toISOString()}>{formatClock(now, timeZone)}</time>
          {zone && ` ${zone}`}
        </strong>{" "}
        local time
      </span>
      {difference && <Difference>{difference}</Difference>}
    </Wrapper>
  );
}
