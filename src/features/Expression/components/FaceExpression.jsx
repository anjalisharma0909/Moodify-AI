import { useEffect, useRef, useState } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

function FaceExpression() {
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  const [expression, setExpression] =
    useState("Detecting...");

  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        // =====================================
        // 1. MEDIAPIPE WASM
        // =====================================
 const vision =
  await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
  );
        console.log("MediaPipe WASM loaded");

        // =====================================
        // 2. FACE LANDMARKER
        // =====================================

        const faceLandmarker =
          await FaceLandmarker.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath:
                  "/models/face_landmarker.task",
              },

              runningMode: "VIDEO",

              numFaces: 1,

              outputFaceBlendshapes: true,
            }
          );

        if (!isMounted) {
          faceLandmarker.close();
          return;
        }

        faceLandmarkerRef.current =
          faceLandmarker;

        console.log(
          "Face Landmarker initialized"
        );

        // =====================================
        // 3. LAPTOP CAMERA
        // =====================================

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: false,
            }
          );

        if (!isMounted) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          return;
        }

        streamRef.current = stream;

        console.log("Camera permission granted");

        // =====================================
        // 4. VIDEO ELEMENT
        // =====================================

        const video = videoRef.current;

        if (!video) {
          console.log("Video element not found");
          return;
        }

        video.srcObject = stream;

        video.onloadedmetadata = async () => {
          try {
            await video.play();

            console.log(
              "Camera video started"
            );

            console.log(
              "Video size:",
              video.videoWidth,
              video.videoHeight
            );

            detectFace();
          } catch (err) {
            console.error(
              "Video play error:",
              err
            );

            setError(
              "Camera video could not start."
            );
          }
        };
      } catch (err) {
        console.error(
          "MediaPipe / Camera Error:",
          err
        );

        setError(
          err.message ||
            "Something went wrong."
        );
      }
    };

    // =====================================
    // 5. FACE DETECTION
    // =====================================

    const detectFace = () => {
      if (
        !videoRef.current ||
        !faceLandmarkerRef.current
      ) {
        return;
      }

      const video = videoRef.current;

      if (video.readyState >= 2) {
        const result =
          faceLandmarkerRef.current.detectForVideo(
            video,
            performance.now()
          );

        if (
          result.faceBlendshapes &&
          result.faceBlendshapes.length > 0
        ) {
          const blendshapes =
            result.faceBlendshapes[0]
              .categories;

          const getScore = (name) => {
            const item =
              blendshapes.find(
                (shape) =>
                  shape.categoryName === name
              );

            return item
              ? item.score
              : 0;
          };

          // ===============================
          // SMILE
          // ===============================

          const smile =
            (getScore(
              "mouthSmileLeft"
            ) +
              getScore(
                "mouthSmileRight"
              )) /
            2;

          // ===============================
          // JAW
          // ===============================

          const jawOpen =
            getScore("jawOpen");

          // ===============================
          // BLINK
          // ===============================

          const blink =
            (getScore(
              "eyeBlinkLeft"
            ) +
              getScore(
                "eyeBlinkRight"
              )) /
            2;

          console.log({blendshapes});

          // ===============================
          // EXPRESSION
          // ===============================
 
          if (smile > 0.5) {
            setExpression("😊 Happy");
          } else if (jawOpen > 0.6) {
            setExpression(
              "😮 Surprised"
            );
          } else {
            setExpression(
              "😐 Neutral"
            );
          }
        } else {
          setExpression(
            "No face detected"
          );
        }
      }

      animationFrameRef.current =
        requestAnimationFrame(
          detectFace
        );
    };

    // Start everything
    setup();

    // =====================================
    // CLEANUP
    // =====================================

    return () => {
      isMounted = false;

      if (animationFrameRef.current) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();

        faceLandmarkerRef.current =
          null;
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
      <h1>
        Face Expression Detection
      </h1>

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
            transform:
              "translateX(-50%)",
            background:
              "rgba(0,0,0,0.75)",
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