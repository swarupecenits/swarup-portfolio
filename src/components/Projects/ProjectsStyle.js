import styled from 'styled-components';
import { TypographyH2, TypographyLead } from "../ui/Typography";
// import _default from '../../themes/default';

export const Container = styled.div`
    background: linear-gradient(343.07deg, rgba(112, 66, 248, 0.1) 5.71%, rgba(112, 66, 248, 0) 64.83%);
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
    }
`;

export const ToggleButtonGroup = styled.div`
    display: flex;
    border: 1.5px solid #7042f8;
    color: #7042f8;
    font-size: 16px;
    border-radius: 12px;
    font-weight: 500;
    margin: 22px 0px;
    @media (max-width: 768px) {
        font-size: 12px;
    }
`

export const ToggleButton = styled.div`
    padding: 8px 18px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    ${({ active }) =>
        active && `
    background: rgba(112, 66, 248, 0.2);
    `
    }
    @media (min-width: 769px) {
        &:hover {
            background: rgba(112, 66, 248, 0.15);
        }
    }
    @media (max-width: 768px) {
        padding: 6px 8px;
        border-radius: 4px;
    }
`
export const Divider = styled.div`
    width: 1.5px;
    background: #7042f8;
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
    margin-top: 8px;
    padding: 10px 18px;
    border-radius: 10px;
    border: 1px solid #7042f8;
    background: rgba(112, 66, 248, 0.14);
    color: ${({ theme }) => theme.text_primary};
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;

    &:hover {
        background: rgba(112, 66, 248, 0.24);
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
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
