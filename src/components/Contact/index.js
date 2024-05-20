import React from "react";
import styled, { keyframes } from 'styled-components';
import { useRef } from "react";
import emailjs from "@emailjs/browser";
import { Snackbar } from "@mui/material";
import EarthCanvas from "../../components/canvas/Earth";

// const rotateBackground = keyframes`
//   from {
//     transform: rotate(0deg);
//   }
//   to {
//     transform: rotate(360deg);
//   }
// `;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
  align-items: center;
  @media (max-width: 960px) {
    padding: 0px;
  }
`;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 100%;
  max-width: 1350px;
  padding: 0px 0px 80px 0px;
  gap: 12px;
  @media (max-width: 960px) {
    flex-direction: column;
  }
`;

const Title = styled.div`
  font-size: 42px;
  text-align: center;
  font-weight: 600;
  margin-top: 20px;
  color: ${({ theme }) => theme.text_primary};
  @media (max-width: 768px) {
    margin-top: 12px;
    font-size: 32px;
  }
`;

const Desc = styled.div`
  font-size: 18px;
  text-align: center;
  max-width: 600px;
  color: ${({ theme }) => theme.text_secondary};
  @media (max-width: 768px) {
    margin-top: 12px;
    font-size: 16px;
  }
`;

const ContactForm = styled.form`
  width: 95%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.card};
  padding: 32px;
  border-radius: 16px;
  box-shadow: rgba(23, 92, 230, 0.15) 0px 4px 24px;
  margin-top: 28px;
  gap: 12px;
`;

const ContactTitle = styled.div`
  font-size: 24px;
  margin-bottom: 6px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;

const ContactInput = styled.input`
  flex: 1;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.text_secondary + 90};
  outline: none;
  font-size: 18px;
  color: ${({ theme }) => theme.text_primary};
  border-radius: 12px;
  padding: 12px 16px;
  &:focus {
    border: 1px solid #0551ff};
  }
`;

const ContactInputMessage = styled.textarea`
  flex: 1;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.text_secondary + 90};
  outline: none;
  font-size: 18px;
  color: ${({ theme }) => theme.text_primary};
  border-radius: 12px;
  padding: 12px 16px;
  &:focus {
    border: 1px solid #0551ff;
  }
`;


const ContactButton = styled.input`
  padding: 13px 16px;
  font-weight: 600;
  height:50px;
  align-items: center;
  background-image: linear-gradient(144deg, #af40ff, #5b42f3 50%, #00ddeb);
  border: 0;
  border-radius: 8px;
  box-shadow: rgba(151, 65, 252, 0.2) 0 15px 30px -5px;
  box-sizing: border-box;
  color: #ffffff;
  display: flex;
  font-family: Phantomsans, sans-serif;
  font-size: 18px;
  justify-content: center;
  line-height: 1em;
  max-width: 100%;
  min-width: 140px;
  padding: 3px;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s;
  outline: 0;

  &:active,
  &:hover {
    outline: 0;
  }

  span {
    background-color: rgb(5, 6, 45);
    padding: 16px 24px;
    border-radius: 6px;
    width: 100%;
    height: 100%;
    transition: 300ms;
  }

  &:hover span {
    background: none;
  }

  &:active {
    transform: scale(0.9);
  }
`

const Contact = () => {
  // hooks
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const form = useRef();

  
  const isEmailValid = (email) => {
    // Simple email validation regex
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(form.current);
    const user_email = formData.get("user_email");
    const user_name = formData.get("user_name");
    const subject = formData.get("subject");
    const message = formData.get("message");

    if (!user_email || !user_name || !subject || !message) {
      setErrorMsg("Please fill in all fields.");
      setError(true);
      return;
    }

    if (!isEmailValid(user_email)) {
      setErrorMsg("Please enter a valid email address.");
      setError(true);
      return;
    }

    emailjs
      .sendForm(
        "service_w7dzhh5",
        "template_b0q19al",
        form.current,
        "LXKUbff1C0vzu7wIX"
      )
      .then(
        (result) => {
          setOpen(true);
          form.current.reset();
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  return (
    <Container>
      <Wrapper>
        <EarthCanvas />
        <Title>Contact</Title>
        <Desc>
          Feel free to reach out to me for any questions or opportunities!
        </Desc>
        <ContactForm ref={form} onSubmit={handleSubmit}>
          <ContactTitle>Email Me </ContactTitle>
          <ContactInput placeholder="Your Email" name="user_email" />
          <ContactInput placeholder="Your Name" name="user_name" />
          <ContactInput placeholder="Subject" name="subject" />
          <ContactInputMessage placeholder="Message" rows="4" name="message" />
          <ContactButton type="submit" value="Send Message" />
        </ContactForm>
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={() => setOpen(false)}
          message="Email sent successfully!"
          severity="success"
        />
        <Snackbar
          open={error}
          autoHideDuration={6000}
          onClose={() => setError(false)}
          message={errorMsg}
          severity="error"
        />
      </Wrapper>
    </Container>
  );
};

export default Contact;
