import { useState } from "react";
import { Link } from "react-router";
import styled from "styled-components";
import { FiArrowLeft } from "react-icons/fi";
import SplineScene from "../components/SplineScene";
import { monoLabel, primaryButton } from "../components/ui/styles";

const SCENE_URL = `${import.meta.env.BASE_URL}assets/404.splinecode`;
const SCENE_STYLE = { position: "absolute", inset: 0 };

const Page = styled.main`
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  outline: none;
`;

const Overlay = styled.div`
  position: absolute;
  left: 50%;
  bottom: clamp(24px, 8vh, 72px);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: min(92vw, 420px);
  text-align: center;
  pointer-events: none;
`;

const FallbackHeading = styled.h1`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  font-size: clamp(6rem, 28vw, 16rem);
  font-weight: 600;
  letter-spacing: -0.06em;
  background: linear-gradient(180deg, var(--text) 20%, rgb(var(--accent-rgb) / 0.85) 110%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  pointer-events: none;
`;

const Code = styled.p`
  ${monoLabel}
  color: var(--accent);
`;

const Message = styled.p`
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.5;
`;

const HomeLink = styled(Link)`
  ${primaryButton}
  pointer-events: auto;

  &:hover svg {
    translate: -3px 0;
  }
`;

export default function NotFoundPage() {
  const [sceneFailed, setSceneFailed] = useState(false);

  return (
    <Page id="main" tabIndex={-1}>
      <title>Page not found | Swarup Chanda</title>
      <meta name="robots" content="noindex" />
      {sceneFailed ? (
        <FallbackHeading aria-label="404 - Page not found">404</FallbackHeading>
      ) : (
        <>
          <SplineScene scene={SCENE_URL} onError={() => setSceneFailed(true)} aria-hidden="true" style={SCENE_STYLE} />
          <h1 className="sr-only">404 - Page not found</h1>
        </>
      )}
      <Overlay>
        <Code aria-hidden="true">Error 404 · Lost in space</Code>
        <Message>The page you are looking for drifted off into space.</Message>
        <HomeLink to="/">
          <FiArrowLeft aria-hidden="true" />
          Back to home
        </HomeLink>
      </Overlay>
    </Page>
  );
}
