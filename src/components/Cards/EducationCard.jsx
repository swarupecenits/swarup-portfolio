import styled from "styled-components";
import { FiAward } from "react-icons/fi";
import { TimelineCard, TimelineCardDate } from "../ui/Timeline";
import { monoLabel } from "../ui/styles";

const School = styled.h3`
  color: var(--text);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.3;
`;

const Degree = styled.p`
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 15px;
  font-weight: 500;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  margin-top: 12px;
`;

const Grade = styled.p`
  ${monoLabel}
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border: 1px solid rgb(var(--accent-rgb) / 0.35);
  border-radius: 999px;
  background: rgb(var(--accent-rgb) / 0.1);
  color: var(--accent);
  font-size: 11.5px;
`;

const Description = styled.p`
  margin-top: 14px;
  color: var(--text-soft);
  font-size: 15px;
  line-height: 1.7;
`;

export default function EducationCard({ education }) {
  const { school, degree, date, grade, desc } = education;

  return (
    <TimelineCard>
      <School>{school}</School>
      {degree && <Degree>{degree}</Degree>}
      <Meta>
        <TimelineCardDate>{date}</TimelineCardDate>
        {grade && (
          <Grade>
            <FiAward aria-hidden="true" />
            <span>
              <span className="sr-only">Grade: </span>
              {grade}
            </span>
          </Grade>
        )}
      </Meta>
      {desc && <Description>{desc}</Description>}
    </TimelineCard>
  );
}
