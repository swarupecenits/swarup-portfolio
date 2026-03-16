import React, { useEffect, useState } from "react";
import styled from "styled-components";
import NyanCat from "./NyanCat";

const EasterEggs = () => {
  useEffect(() => {
    // Check if devtools are likely open by looking at window geometry changes,
    // though a simple console greeting works everywhere.
    // The "hook" concept in the original code is complex, so we'll just run it.
    if (typeof console !== "undefined") {
      // Avoid clearing console in dev so we don't annoy you while coding,
      // but log the easter egg message.
      console.log(
        "%cWhoa, look at you! 🕵️‍♂️\n" +
          "You seem to have discovered the secret console! 🔍\n" +
          "Want to see some magic? ✨\n" +
          "Just type %cswarup%c and hit enter! 🎩🐇",
        "color: #FFD700; font-size: 16px; font-weight: bold; background-color: #050505; padding: 10px; border-radius: 10px; margin-top:20px",
        "color: #00FF00; font-size: 16px; font-weight: bold; background-color: #050505; padding: 10px; border-radius: 10px; margin-top:20px",
        "color: #FFD700; font-size: 16px; font-weight: bold; background-color: #050505; padding: 10px; border-radius: 10px;"
      );

      ["swarup", "Swarup", "SWARUP"].forEach((name) => {
        if (Object.hasOwn(window, name)) return;
        Object.defineProperty(window, name, {
          get() {
            console.log(
              "%c✨ Expelliarmus! ✨\n\n" +
                "You just summoned the magic of Swarup! 🧙‍♂️\n" +
                "What??? you're not impressed? Fine, but remember: The Fire within you is what makes you shine! 💻⚡",
              "color: #FF4500; font-size: 18px; font-weight: bold; background-color: #050505; padding: 10px; border-radius: 10px; margin-top:10px"
            );

            const timer = setTimeout(() => {
              console.log(
                "%cPssttt! 🤫\n\n" +
                  "Do you like pokemon?? 😺 If yes, then press 'n' on viewport and see what happens! 🐱✨",
                "color: #FF69B4; font-size: 16px; font-weight: bold; background-color: #050505; padding: 10px; border-radius: 10px;"
              );
              clearTimeout(timer);
            }, 7000);
            return "Magic activated!";
          },
        });
      });
    }
  }, []);

  return (
    <>
      <NyanCat />
    </>
  );
};

export default EasterEggs;
