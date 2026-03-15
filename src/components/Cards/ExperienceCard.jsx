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
  border: 2px solid #5f7bff;
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

const Role = styled.div`
  font-size: 18px;
  font-weight: 600px;
  color: ${({ theme }) => theme.text_primary + 99};
  background: linear-gradient(90deg, #5f7bff, #8eb6ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media only screen and (max-width: 768px) {
    font-size: 14px;
  }
`;
const Company = styled.div`
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
const Span = styled.div`
  display: -webkit-box;
  max-width: 100%;
`;
const Skills = styled.div`
  width: 100%;
  display: flex;
  gap: 12px;
  margin-top: -10px;
`;
const Skill = styled.div`
  font-size: 15px;
  font-weight: 400;
  color: ${({ theme }) => theme.text_primary + 99};
  @media only screen and (max-width: 768px) {
    font-size: 12px;
  }
`;

const ItemWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ExperienceCard = ({ experience, index = 0 }) => {
  return (
    <VerticalTimelineElement
      icon={
        <motion.img
          width="100%"
          height="100%"
          alt={experience.school}
          style={{ borderRadius: "50%", objectFit: "cover" }}
          src={experience.img}
          whileHover={{ scale: 1.15, rotate: 10 }}
          transition={{ duration: 0.3 }}
        />
      }
      contentStyle={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(32px)",
        color: "#fff",
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        borderRadius: "6px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease-in-out",
        pointerEvents: "auto",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 0 30px rgba(59, 130, 246, 0.3)";
        e.currentTarget.style.border = "1px solid rgba(59, 130, 246, 0.5)";
        e.currentTarget.style.background = "rgba(25, 25, 25, 0.8)";
        e.currentTarget.style.transform = "translateY(-5px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.3)";
        e.currentTarget.style.border = "1px solid rgba(59, 130, 246, 0.2)";
        e.currentTarget.style.background = "rgba(15, 15, 15, 0.6)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      contentArrowStyle={{
        borderRight: "7px solid rgba(59, 130, 246, 0.2)",
      }}
      date={experience.date}
    >
        <Top>
          <Image src={experience.img} />
          <Body>
            <Role>{experience.role}</Role>
            <Company>{experience.company}</Company>
            <Date>{experience.date}</Date>
          </Body>
        </Top>
        <Description>
          {experience?.desc && <Span>{experience?.desc}</Span>}
          {experience?.skills && (
            <>
              <br />
              <Skills>
                <b style={{ color: "#5f7bff" }}>✦ Skills:</b>
                <ItemWrapper>
                  {experience?.skills?.map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Skill>• {skill}</Skill>
                    </motion.div>
                  ))}
                </ItemWrapper>
              </Skills>
            </>
          )}
        </Description>
      </VerticalTimelineElement>
    );
};

export default ExperienceCard;



