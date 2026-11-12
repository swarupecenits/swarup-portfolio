import { lazy, Suspense, useEffect, useId, useRef, useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowUpRight, FiMenu, FiSearch, FiX } from "react-icons/fi";
import { Bio } from "../../data/constants";
import { NAV_LINKS, NAV_SECTION_IDS, PRIMARY_SOCIAL_LINKS } from "../../data/socials";
import { useActiveSection, useScrolled } from "../../hooks/useActiveSection";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { usePreloader } from "../Preloader/context";
import ErrorBoundary from "../ui/ErrorBoundary";
import { iconButton, monoLabel, primaryButton } from "../ui/styles";

const loadCommandPalette = () => import("../CommandPalette");
const CommandPalette = lazy(loadCommandPalette);
// Fetch the palette's code as soon as someone shows interest in it.
const preloadCommandPalette = () => {
  loadCommandPalette().catch(() => {});
};

const DESKTOP_QUERY = "(min-width: 1024px)";
const EASE_OUT = [0.22, 1, 0.36, 1];
const IS_APPLE =
  typeof navigator !== "undefined" &&
  /mac|iphone|ipad|ipod/i.test(navigator.userAgentData?.platform || navigator.platform || "");
const SHORTCUT_LABEL = IS_APPLE ? "⌘K" : "Ctrl K";
const SHORTCUT_KEYS = IS_APPLE ? "Meta+K" : "Control+K";

// Another dialog (e.g. an open project) already owns the page.
const isOtherDialogOpen = () =>
  [...document.querySelectorAll('[aria-modal="true"]')].some((dialog) => !dialog.closest("[data-command-palette]"));

const Header = styled.header`
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  height: var(--nav-height);
  border-bottom: 1px solid transparent;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;

  &[data-solid="true"] {
    border-bottom-color: var(--line);
    background: rgb(var(--bg-rgb) / 0.72);
    -webkit-backdrop-filter: blur(16px) saturate(150%);
    backdrop-filter: blur(16px) saturate(150%);
  }

  /* Without a GPU, re-blurring the moving 3D scene behind the bar on every frame is too costly. */
  html[data-perf="low"] &[data-solid="true"] {
    background: rgb(var(--bg-rgb) / 0.94);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
`;

const Bar = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  width: min(1200px, 100% - 32px);
  height: 100%;
  margin: 0 auto;

  @media (min-width: 640px) {
    width: min(1200px, 100% - 64px);
  }

  /* Logo | links | tools, with the links centred on the page. */
  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  }
`;

const Logo = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  justify-self: start;
  min-width: 0;
  color: var(--text);
  text-decoration: none;
`;

const Mark = styled.span`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--accent);
  box-shadow:
    inset 0 -2px 0 rgb(0 0 0 / 0.15),
    0 8px 24px -10px rgb(var(--accent-rgb) / 0.7);
  color: var(--accent-ink);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.02em;
  transition: rotate 0.35s var(--ease-out);

  ${Logo}:hover & {
    rotate: -8deg;
  }
`;

const LogoText = styled.span`
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DesktopNav = styled.nav`
  display: none;

  @media (min-width: 1024px) {
    display: block;
  }

  ul {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: rgb(var(--bg-rgb) / 0.6);
    list-style: none;
  }
`;

const NavLink = styled.a`
  position: relative;
  display: block;
  padding: 8px 14px;
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover,
  &[aria-current="true"] {
    color: var(--text);
  }
`;

const NavLabel = styled.span`
  position: relative;
  z-index: 1;
`;

const ActivePill = styled(motion.span)`
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.08);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08);
`;

const Tools = styled.div`
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 8px;
`;

const SearchButton = styled.button`
  ${iconButton}
  color: var(--text);
  font-size: 19px;

  .label,
  kbd {
    display: none;
  }

  @media (min-width: 1024px) {
    display: inline-flex;
    gap: 10px;
    width: auto;
    height: 40px;
    padding: 0 7px 0 14px;
    background: rgb(var(--bg-rgb) / 0.6);
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 500;

    > svg {
      font-size: 16px;
    }

    kbd {
      display: inline-block;
      padding: 3px 8px;
      border: 1px solid var(--line-strong);
      border-radius: 999px;
      background: rgb(255 255 255 / 0.04);
      font-family: var(--font-mono);
      font-size: 11px;
      line-height: 1.3;
    }

    &:hover {
      transform: none;
    }
  }

  @media (min-width: 1280px) {
    .label {
      display: inline;
    }
  }
`;

const ResumeLink = styled.a`
  ${primaryButton}
  display: none;
  gap: 6px;
  min-height: 40px;
  padding: 0 16px;
  font-size: 14px;

  @media (min-width: 1024px) {
    display: inline-flex;
  }
`;

const MenuButton = styled.button`
  ${iconButton}
  color: var(--text);
  font-size: 20px;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const Panel = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 12px;
  right: 12px;
  max-height: calc(100dvh - var(--nav-height) - 24px);
  overflow-y: auto;
  padding: 10px;
  border: 1px solid var(--line-strong);
  border-radius: 22px;
  background: rgb(14 14 17 / 0.98);
  box-shadow: 0 30px 80px -20px rgb(0 0 0 / 0.9);
  transform-origin: top center;

  ul {
    list-style: none;
  }
`;

const PanelLink = styled.a`
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 12px;
  border-radius: 14px;
  color: var(--text-soft);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.03em;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  small {
    ${monoLabel}
    color: var(--text-dim);
    font-size: 11px;
  }

  svg {
    align-self: center;
    margin-left: auto;
    color: var(--text-dim);
    font-size: 18px;
  }

  &:hover,
  &[aria-current="true"] {
    background: rgb(255 255 255 / 0.05);
    color: var(--text);
  }

  &[aria-current="true"] small,
  &[aria-current="true"] svg {
    color: var(--accent);
  }
`;

const PanelFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
  padding: 14px 4px 4px;
  border-top: 1px solid var(--line);

  ul {
    display: flex;
    gap: 6px;
  }
`;

const PanelIcon = styled.a`
  ${iconButton}
`;

const PanelResume = styled.a`
  ${primaryButton}
  gap: 6px;
  min-height: 44px;
  padding: 0 18px;
  font-size: 14.5px;
`;

const LIST_VARIANTS = { visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } };
const ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE_OUT } },
};

export default function Navbar() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const scrolled = useScrolled(16);
  const activeSection = useActiveSection(NAV_SECTION_IDS);
  const { isLoading } = usePreloader();
  const [menuOpen, setMenuOpen] = useState(false);
  // null until first opened, so the palette is only downloaded once someone wants it.
  const [paletteOpen, setPaletteOpen] = useState(null);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const menuId = useId();

  // The dropdown only exists below the desktop breakpoint; forget it when the window grows.
  if (isDesktop && menuOpen) setMenuOpen(false);
  const showMenu = menuOpen && !isDesktop;

  useEffect(() => {
    if (!showMenu) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    const onPointerDown = (event) => {
      const target = event.target;
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [showMenu]);

  // ⌘K / Ctrl K toggles the command palette from anywhere on the page.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key?.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
      if (event.repeat || isLoading || isOtherDialogOpen()) return;
      event.preventDefault();
      setMenuOpen(false);
      setPaletteOpen((open) => !open);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isLoading]);

  const closeMenu = () => setMenuOpen(false);
  const openPalette = () => {
    setMenuOpen(false);
    setPaletteOpen(true);
  };
  const currentProps = (id) => (activeSection === id ? { "aria-current": "true" } : {});

  return (
    <>
      <Header data-solid={scrolled || showMenu}>
        <Bar>
          <Logo href="#top" aria-label={`${Bio.name}, back to top`}>
            <Mark aria-hidden="true">SC</Mark>
            <LogoText aria-hidden="true">{Bio.name}</LogoText>
          </Logo>

          <DesktopNav aria-label="Primary">
            <ul>
              {NAV_LINKS.map(({ id, label }) => (
                <li key={id}>
                  <NavLink href={`#${id}`} {...currentProps(id)}>
                    {activeSection === id && (
                      <ActivePill layoutId="nav-active-pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                    )}
                    <NavLabel>{label}</NavLabel>
                  </NavLink>
                </li>
              ))}
            </ul>
          </DesktopNav>

          <Tools>
            <SearchButton
              type="button"
              aria-label="Search the site"
              aria-haspopup="dialog"
              aria-keyshortcuts={SHORTCUT_KEYS}
              title={`Search (${SHORTCUT_LABEL})`}
              onClick={openPalette}
              onPointerEnter={preloadCommandPalette}
              onFocus={preloadCommandPalette}
            >
              <FiSearch aria-hidden="true" />
              <span className="label" aria-hidden="true">
                Search
              </span>
              <kbd aria-hidden="true">{SHORTCUT_LABEL}</kbd>
            </SearchButton>

            <ResumeLink href={Bio.resume} target="_blank" rel="noopener noreferrer">
              Resume
              <FiArrowUpRight aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </ResumeLink>

            <MenuButton
              ref={toggleRef}
              type="button"
              aria-label={showMenu ? "Close menu" : "Open menu"}
              aria-expanded={showMenu}
              aria-controls={menuId}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {showMenu ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
            </MenuButton>
          </Tools>
        </Bar>

        <AnimatePresence>
          {showMenu && (
            <Panel
              ref={panelRef}
              id={menuId}
              data-interactive
              data-lenis-prevent
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
            >
              <nav aria-label="Mobile">
                <motion.ul variants={LIST_VARIANTS} initial="hidden" animate="visible">
                  {NAV_LINKS.map(({ id, label }, index) => (
                    <motion.li key={id} variants={ITEM_VARIANTS}>
                      <PanelLink href={`#${id}`} onClick={closeMenu} {...currentProps(id)}>
                        <small aria-hidden="true">{String(index + 1).padStart(2, "0")}</small>
                        {label}
                        <FiArrowUpRight aria-hidden="true" />
                      </PanelLink>
                    </motion.li>
                  ))}
                </motion.ul>
              </nav>
              <PanelFooter>
                <ul aria-label="Social profiles">
                  {PRIMARY_SOCIAL_LINKS.map(({ id, label, href, Icon }) => (
                    <li key={id}>
                      <PanelIcon href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                        <Icon aria-hidden="true" />
                      </PanelIcon>
                    </li>
                  ))}
                </ul>
                <PanelResume href={Bio.resume} target="_blank" rel="noopener noreferrer">
                  Resume
                  <FiArrowUpRight aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </PanelResume>
              </PanelFooter>
            </Panel>
          )}
        </AnimatePresence>
      </Header>

      {paletteOpen !== null && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
}
