import React from "react";
import styled from "styled-components";
import { VerticalTimelineElement } from "react-vertical-timeline-component";
import { motion } from "framer-motion";

const Top = styled.div`
  width: 100%;
  display: flex;
  max-width: 100%;
  gap: 12px;
`;
const Image = styled.img`
  height: 50px;
  width: 50px;
  border-radius: 10px;
  margin-top: 4px;
  border: 2px solid #7042f8;
  box-shadow: 0 0 10px rgba(112, 66, 248, 0.4);
  transition: all 0.3s ease-in-out;

  @media only screen and (max-width: 768px) {
    height: 40px;
    width: 40px;
  }
`;
const Body = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Name = styled.div`
  font-size: 18px;
  font-weight: 600px;
  background: linear-gradient(90deg, #7042f8, #b8a9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media only screen and (max-width: 768px) {
    font-size: 14px;
  }
`;
const Degree = styled.div`
  font-size: 14px;
  font-weight: 500px;
  color: ${({ theme }) => theme.text_secondary + 99};

  @media only screen and (max-width: 768px) {
    font-size: 12px;
  }
`;
const Date = styled.div`
  font-size: 12px;
  font-weight: 400px;
  color: ${({ theme }) => theme.text_secondary + 80};

  @media only screen and (max-width: 768px) {
    font-size: 10px;
  }
`;
const Grade = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #7042f8;
  @media only screen and (max-width: 768px) {
    font-size: 12px;
  }
`;

const Description = styled.div`
  width: 100%;
  font-size: 15px;
  font-weight: 400;
  color: ${({ theme }) => theme.text_primary + 99};
  margin-bottom: 10px;
  @media only screen and (max-width: 768px) {
    font-size: 12px;
  }
`;
const Span = styled.div``;

const EducationCard = ({ education, index = 0 }) => {
  return (
    <VerticalTimelineElement
      icon={
        <motion.img
          width="100%"
          height="100%"
          alt={education.school}
          style={{ borderRadius: "50%", objectFit: "cover" }}
          src={education.img}
          whileHover={{ scale: 1.15, rotate: -10 }}
          transition={{ duration: 0.3 }}
        />
      }
      contentStyle={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        background: "linear-gradient(135deg, #0f0a1f 0%, #1a0f2e 100%)",
        color: "#fff",
        boxShadow: "0 0 20px rgba(112, 66, 248, 0.3), inset 0 0 20px rgba(112, 66, 248, 0.05)",
        border: "1.5px solid #7042f8",
        borderRadius: "6px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease-in-out",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 0 30px rgba(112, 66, 248, 0.5), inset 0 0 20px rgba(112, 66, 248, 0.1)";
        e.currentTarget.style.transform = "translateY(-5px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 20px rgba(112, 66, 248, 0.3), inset 0 0 20px rgba(112, 66, 248, 0.05)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      contentArrowStyle={{
        borderRight: "7px solid #7042f8",
      }}
      date={education.date}
    >
        <Top>
          <Image src={education.img} />
          <Body>
            <Name>{education.school}</Name>
            <Degree>{education.degree}</Degree>
            <Date>{education.date}</Date>
          </Body>
        </Top>
        <Grade>
          <b>✦ Grade:</b> {education.grade}
        </Grade>
        <Description>
          <Span>{education.desc}</Span>
        </Description>
      </VerticalTimelineElement>
    );
};

export default EducationCard;
