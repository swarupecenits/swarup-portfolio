import { FaFacebookF, FaGithub, FaInstagram, FaLinkedinIn, FaRedditAlien, FaYoutube } from "react-icons/fa";
import { Bio } from "./constants";

/** Every social profile, in display order. */
export const SOCIAL_LINKS = [
  { id: "github", label: "GitHub", href: Bio.github, Icon: FaGithub },
  { id: "linkedin", label: "LinkedIn", href: Bio.linkedin, Icon: FaLinkedinIn },
  { id: "instagram", label: "Instagram", href: Bio.insta, Icon: FaInstagram },
  { id: "youtube", label: "YouTube", href: Bio.youtube, Icon: FaYoutube },
  { id: "facebook", label: "Facebook", href: Bio.facebook, Icon: FaFacebookF },
  { id: "reddit", label: "Reddit", href: Bio.reddit, Icon: FaRedditAlien },
].filter((link) => Boolean(link.href));

const PRIMARY_IDS = ["github", "linkedin", "instagram"];

/** The profiles shown in compact places such as the navbar and hero. */
export const PRIMARY_SOCIAL_LINKS = SOCIAL_LINKS.filter((link) => PRIMARY_IDS.includes(link.id));

/** In-page navigation shared by the navbar and footer. */
export const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

export const NAV_SECTION_IDS = NAV_LINKS.map((link) => link.id);
