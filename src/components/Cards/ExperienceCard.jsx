import styled from "styled-components";
import { isOngoing } from "../../utils/dates";
import { TimelineCard, TimelineCardDate } from "../ui/Timeline";
import { chip, monoLabel } from "../ui/styles";

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  h3 {
    color: var(--text);
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.3;
  }
`;

const Company = styled.p`
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 15px;
  font-weight: 500;
`;

const CurrentBadge = styled.span`
  ${monoLabel}
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 7px;
  padding: 4px 10px;
  border: 1px solid rgb(var(--accent-rgb) / 0.35);
  border-radius: 999px;
  background: rgb(var(--accent-rgb) / 0.1);
  color: var(--accent);
  font-size: 11px;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 8px currentColor;
  }
`;

const DateLine = styled(TimelineCardDate)`
  margin-top: 10px;
`;

const Description = styled.p`
  margin-top: 14px;
  color: var(--text-soft);
  font-size: 15px;
  line-height: 1.7;
`;

const Skills = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  list-style: none;

  li {
    ${chip}
  }
`;

export default function ExperienceCard({ experience }) {
  const { role, company, date, desc, skills = [] } = experience;

  return (
    <TimelineCard>
      <Header>
        <div>
          <h3>{role}</h3>
          <Company>{company}</Company>
        </div>
        {isOngoing(date) && <CurrentBadge>Current</CurrentBadge>}
      </Header>
      <DateLine>{date}</DateLine>
      {desc && <Description>{desc}</Description>}
      {skills.length > 0 && (
        <Skills aria-label="Skills used">
          {skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </Skills>
      )}
    </TimelineCard>
  );
}
