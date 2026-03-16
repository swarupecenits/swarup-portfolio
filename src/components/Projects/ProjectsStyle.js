import styled from 'styled-components';
import { TypographyH2, TypographyLead } from "../ui/Typography";
// import _default from '../../themes/default';

export const Container = styled.div`
    background: linear-gradient(343.07deg, rgba(59, 130, 246, 0.1) 5.71%, rgba(59, 130, 246, 0) 64.83%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    z-index: 1;
    align-items: center;
    clip-path: polygon(0 0, 100% 0, 100% 100%,100% 98%, 0 100%);
`;

export const Wrapper = styled.div`
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    width: 100%;
    max-width: 1350px;
    padding: 10px 0px 100px 0;
    gap: 12px;
    @media (max-width: 960px) {
        flex-direction: column;
    }
`;

export const Title = styled(TypographyH2)`
font-size: 42px;
text-align: center;
margin-top: 20px;
border-bottom: none;
  color: ${({ theme }) => theme.text_primary};
  @media (max-width: 768px) {
      margin-top: 12px;
      font-size: 32px;
  }
`;

export const Desc = styled(TypographyLead)`
    text-align: center;
    max-width: 600px;
    color: ${({ theme }) => theme.text_secondary};
    @media (max-width: 768px) {
        margin-top: 12px;
        font-size: 16px;
        padding: 0 20px;
    }
`;

export const ToggleButtonGroup = styled.div`
    display: flex;
    background: rgba(3, 7, 18, 0.8);
    border: 1.5px solid rgba(59, 130, 246, 0.4);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
    color: #3b82f6;
    font-size: 16px;
    border-radius: 100px;
    font-weight: 500;
    margin: 30px 0px;
    padding: 6px;
    gap: 4px;
    @media (max-width: 768px) {
        font-size: 13px;
        border-radius: 50px;
        padding: 4px;
        gap: 2px;
    }
`

export const ToggleButton = styled.div`
    padding: 10px 24px;
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.3s ease;
    pointer-events: auto;
    font-weight: 600;
    color: ${({ active }) => active ? "#ffffff" : "#3b82f6"};
    background: ${({ active }) => active ? "linear-gradient(144deg, #1e3a8a, #3b82f6 50%, #00ddeb)" : "transparent"};
    box-shadow: ${({ active }) => active ? "0 4px 15px rgba(59, 130, 246, 0.5)" : "none"};

    @media (min-width: 769px) {
        &:hover {
            background: ${({ active }) => active ? "linear-gradient(144deg, #1e3a8a, #3b82f6 50%, #00ddeb)" : "rgba(59, 130, 246, 0.15)"};
            color: ${({ active }) => active ? "#ffffff" : "#8eb6ff"};
        }
    }
    @media (max-width: 768px) {
        padding: 6px 12px;
        border-radius: 50px;
    }
`
export const Divider = styled.div`
    width: 1.5px;
    background: rgba(59, 130, 246, 0.3);
    margin: 6px 0;
`


export const CardContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 28px;
    flex-wrap: wrap;
    // display: grid;
    // grid-template-columns: repeat(3, 1fr);
    // grid-gap: 32px;
    // grid-auto-rows: minmax(100px, auto);
    // @media (max-width: 960px) {
    //     grid-template-columns: repeat(2, 1fr);
    // }
    // @media (max-width: 640px) {
    //     grid-template-columns: repeat(1, 1fr);
    // }
`;

export const ShowMoreButton = styled.button`
    margin-top: 36px;
    padding: 14px 32px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(144deg, #1e3a8a, #3b82f6 50%, #00ddeb);
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.5);
    pointer-events: auto;

    &:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 15px 25px -5px rgba(59, 130, 246, 0.7);
        filter: brightness(1.1);
    }

    &:active {
        transform: translateY(0) scale(0.98);
    }
`;

/* Center Swiper slides content on small viewports so cards appear centered */
export const SwiperMobileCenter = styled.div`
    @media (max-width: 768px) {
        .swiper-slide {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
`;
