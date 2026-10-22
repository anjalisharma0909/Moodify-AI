import { useEffect, useRef, useState } from "react";
import { setup } from "../utils/utils";

function FaceExpression() {
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  const [expression, setExpression] = useState("Detecting...");
  const [error, setError] = useState("");

  useEffect(() => {
    // Start everything
    setup({
      faceLandmarkerRef,
      videoRef,
      streamRef,
      animationFrameRef,
      setExpression,
      setError,
    });

    // =====================================
    // CLEANUP
    // =====================================
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      <h1>Face Expression Detection</h1>

      {error && (
        <p
          style={{
            color: "red",
            background: "#300",
            padding: "10px 20px",
            borderRadius: "8px",
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          position: "relative",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "640px",
            height: "480px",
            objectFit: "cover",
            background: "black",
            borderRadius: "15px",
            transform: "scaleX(-1)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.75)",
            padding: "10px 25px",
            borderRadius: "30px",
            fontSize: "22px",
          }}
        >
          {expression}
        </div>
      </div>
    </div>
  );
}

export default FaceExpression;