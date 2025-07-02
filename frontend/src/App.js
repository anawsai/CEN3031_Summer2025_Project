import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  //react state for backend data
  const [statusData, setStatusData] = useState({
    message: "",
    status: "",
    app: "",
  });

  // useEffect to call flask backend once on load
  useEffect(() => {
    fetch("/api/health") //react proxy will redirect to flask
      .then((res) => res.json())
      .then((data) => {
        setStatusData({
          message: data.message,
          status: data.status,
          app: data.app,
        });
      })
      .catch((err) => {
        console.error("Error contacting backend:", err);
        setStatusData({
          message: "Failed to contact backend",
          status: "error",
          app: "swampscheduler",
        });
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Backend Status</h1>
        <p>App: {statusData.app}</p>
        <p>Status: {statusData.status}</p>
        <p>Message: {statusData.message}</p>
      </header>
    </div>
  );
}

export default App;

