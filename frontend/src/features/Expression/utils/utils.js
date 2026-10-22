import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// =====================================
// 5. FACE DETECTION
// =====================================
export const detectFace = ({
  faceLandmarkerRef,
  videoRef,
  animationFrameRef,
  setExpression,
}) => {
  if (!videoRef.current || !faceLandmarkerRef.current) {
    return;
  }

  const video = videoRef.current;

  if (video.readyState >= 2) {
    try {
      const result = faceLandmarkerRef.current.detectForVideo(
        video,
        performance.now()
      );

      if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
        const blendshapes = result.faceBlendshapes[0].categories;

        const getScore = (name) => {
          const item = blendshapes.find((shape) => shape.categoryName === name);
          return item ? item.score : 0;
        };

        // ===============================
        // SMILE
        // ===============================
        const smile =
          (getScore("mouthSmileLeft") + getScore("mouthSmileRight")) / 2;

        // ===============================
        // JAW
        // ===============================
        const jawOpen = getScore("jawOpen");

        // ===============================
        // BLINK
        // ===============================
        const blink =
          (getScore("eyeBlinkLeft") + getScore("eyeBlinkRight")) / 2;

        // ===============================
        // EXPRESSION
        // ===============================
        if (smile > 0.5) {
          setExpression("😊 Happy");
        } else if (jawOpen > 0.6) {
          setExpression("😮 Surprised");
        } else if (blink > 0.6) {
          setExpression("😉 Blinking");
        } else {
          setExpression("😐 Neutral");
        }
      } else {
        setExpression("No face detected");
      }
    } catch (err) {
      console.error("Face detection error:", err);
    }
  }

  animationFrameRef.current = requestAnimationFrame(() => {
    detectFace({
      faceLandmarkerRef,
      videoRef,
      animationFrameRef,
      setExpression,
    });
  });
};

// =====================================
// SETUP (MEDIAPIPE + CAMERA + START)
// =====================================
export const setup = async ({
  faceLandmarkerRef,
  videoRef,
  streamRef,
  animationFrameRef,
  setExpression,
  setError,
}) => {
  try {
    // =====================================
    // 1. MEDIAPIPE WASM
    // =====================================
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
    );
    console.log("MediaPipe WASM loaded");

    // =====================================
    // 2. FACE LANDMARKER
    // =====================================
    const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/models/face_landmarker.task",
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: true,
    });

    faceLandmarkerRef.current = faceLandmarker;
    console.log("Face Landmarker initialized");

    // =====================================
    // 3. LAPTOP CAMERA
    // =====================================
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

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

        console.log("Camera video started");
        console.log("Video size:", video.videoWidth, video.videoHeight);

        detectFace({
          faceLandmarkerRef,
          videoRef,
          animationFrameRef,
          setExpression,
        });
      } catch (err) {
        console.error("Video play error:", err);
        if (setError) {
          setError("Camera video could not start.");
        }
      }
    };
  } catch (err) {
    console.error("MediaPipe / Camera Error:", err);
    if (setError) {
      setError(err.message || "Something went wrong.");
    }
  }
};