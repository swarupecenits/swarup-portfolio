import { useEffect } from "react";
import NyanCat from "./NyanCat";

const BOX = "font-size: 16px; font-weight: bold; background-color: #050505; padding: 10px; border-radius: 10px;";
const MAGIC_WORDS = ["swarup", "Swarup", "SWARUP"];
let greeted = false;

function greet() {
  console.log(
    "%cWhoa, look at you! 🕵️‍♂️\n" +
      "You seem to have discovered the secret console! 🔍\n" +
      "Want to see some magic? ✨\n" +
      "Just type %cswarup%c and hit enter! 🎩🐇",
    `color: #FFD700; ${BOX} margin-top: 20px;`,
    `color: #00FF00; ${BOX} margin-top: 20px;`,
    `color: #FFD700; ${BOX}`,
  );

  // Typing one of the magic words in the console evaluates this getter.
  for (const name of MAGIC_WORDS) {
    if (Object.hasOwn(window, name)) continue;
    Object.defineProperty(window, name, {
      configurable: true,
      get() {
        console.log(
          "%c✨ Expelliarmus! ✨\n\n" +
            "You just summoned the magic of Swarup! 🧙‍♂️\n" +
            "What??? you're not impressed? Fine, but remember: The Fire within you is what makes you shine! 💻⚡",
          `color: #FF4500; ${BOX} font-size: 18px; margin-top: 10px;`,
        );
        setTimeout(() => {
          console.log(
            "%cPssttt! 🤫\n\n" +
              "Do you like pokemon?? 😺 If yes, then press 'n' on viewport and see what happens! 🐱✨",
            `color: #FF69B4; ${BOX}`,
          );
        }, 7000);
        return "Magic activated!";
      },
    });
  }
}

export default function EasterEggs() {
  useEffect(() => {
    if (greeted) return;
    greeted = true;
    greet();
  }, []);

  return <NyanCat />;
}
