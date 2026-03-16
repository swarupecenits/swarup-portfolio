
import React from 'react'
import styled from 'styled-components'
import { education} from '../../data/constants';
import EducationCard from '../Cards/EducationCard';
import { VerticalTimeline } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { TypographyH2, TypographyLead } from "../ui/Typography";

const Container = styled.div`
margin-top: 100px;
display: flex;
padding: 0 10px;
flex-direction: column;
justify-content-center;
position: relative;
z-index: 1;
align-items: center;
`;
const Wrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 100%;
  max-width: 1100px;
  gap: 12px;
  @media (max-width: 960px) {
    flex-direction: column;
  }
`;

const Title = styled(TypographyH2)`
  font-size: 52px;
  text-align: center;
  margin-top: 20px;
  border-bottom: none;
  color: ${({ theme }) => theme.text_primary};
  @media (max-width: 768px) {
    margin-top: 12px;
    font-size: 32px;
  }
`;

const Desc = styled(TypographyLead)`
  text-align: center;
  padding: 0 30px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_secondary};
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const Education = () => {
  return (
    <Container id="education">
      <Wrapper>
        <Title>Education</Title>
        <Desc
          style={{
            marginBottom: "40px",
          }}
        >
          My education has been a journey of self-discovery and growth. My
          educational details are as follows.
        </Desc>

        <VerticalTimeline>
          {education.map((education, index) => (
            <EducationCard key={`education-${index}`} education={education} index={index} />
          ))}
        </VerticalTimeline>
      </Wrapper>
    </Container>
  );
};

export default Education;
