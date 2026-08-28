import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import DecisionROI from "./pages/DecisionROI";
import DecisionHistory from "./pages/DecisionHistory";

import "./index.css";


// ============================================================
// HOME PAGE
// ============================================================

function Home() {

  const navigate = useNavigate();

  return (
    <div className="home-page">

      <div className="home-card">

        <div className="home-icon">
          📊
        </div>

        <h1>
          Supply Prescript
        </h1>

        <p>
          Closed-Loop Prescriptive Analytics
        </p>

        <p className="home-description">
          Monitor supply-chain decisions, evaluate outcomes,
          and measure prescription performance.
        </p>


        {/* ================================================== */}
        {/* NAVIGATION BUTTONS */}
        {/* ================================================== */}

        <div className="home-buttons">

          <button
            className="home-button roi-button"
            onClick={() => navigate("/decision-roi")}
          >
            <span className="button-icon">
              📈
            </span>

            <span>
              Decision ROI
            </span>
          </button>


          <button
            className="home-button history-button"
            onClick={() => navigate("/decision-history")}
          >
            <span className="button-icon">
              📋
            </span>

            <span>
              Decision History
            </span>
          </button>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// APP
// ============================================================

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* DECISION ROI */}

        <Route
          path="/decision-roi"
          element={<DecisionROI />}
        />


        {/* DECISION HISTORY */}

        <Route
          path="/decision-history"
          element={<DecisionHistory />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;
