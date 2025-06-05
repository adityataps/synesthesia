import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL ?? "";

function App() {
  const [phrase, setPhrase] = useState("");
  const [tokens, setTokens] = useState([]);
  const [color, setColor] = useState({ R: 0, G: 0, B: 0 });

  useEffect(() => {
    const apiResponse = fetch(`${API_URL}/tokenized_phrase`).then((res) =>
      res.json().then((data) => {
        setPhrase(data.phrase);
        setTokens(data.tokens);
      }),
    );
  });

  return (
    <>
      <p>{phrase}</p>
      <p>{JSON.stringify(tokens)}</p>
    </>
  );
}

export default App;
