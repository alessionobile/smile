import { useRef, useState } from "react";
import { Flex, View, SwitchField  } from "@aws-amplify/ui-react";
import Webcam from "react-webcam";

import { useAuth } from "./hooks/useAuth";

import processImage from "./utils/requests";
import Auth from "./components/Auth";
import EngagementSummary from "./components/EngagementsSummary";
import Header from "./components/Header";

export default function App() {
  const [readyToStream, setReadyToStream] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const iterating = useRef(false);
  const webcam = useRef(undefined);

  const { signedIn, accessToken } = useAuth();

  const setupWebcam = (instance) => {
    webcam.current = instance;

    const checkIfReady = () => {
      if (webcam?.current?.state?.hasUserMedia) {
        setReadyToStream(true);
      } else setTimeout(checkIfReady, 250);
    };

    checkIfReady();
  };

  const getFrame = () => {
    const frame = webcam.current.getScreenshot();
    const b64Encoded = frame.split(",")[1];

    processImage(b64Encoded, accessToken).then((response) => {
      if (response) setTestResults(response);
      if (iterating.current) setTimeout(getFrame, 300);
      else setTestResults([]);
    });
  };

  const toggleRekognition = () => {
    iterating.current = !iterating.current;

    if (iterating.current) {
      getFrame();
    } else setTestResults([]);
  };

  return (
    <View>
      {signedIn ? (
        <>
          <Header />
          <Flex>
            <View>
              <Webcam
                ref={setupWebcam}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "user",
                }}
                style={{ width: "100%", marginTop: "10px" }}
              />
            </View>
            <View>
              <Flex>
                <SwitchField
                  size="large"
                  isDisabled={!readyToStream}
                  isChecked={isStreaming}
                  onChange={() => {
                    setIsStreaming(!isStreaming);
                    toggleRekognition();
                  }}
                  label={isStreaming ? "Stop detection" : "Start detection"}
                  labelPosition="start"
                />
              </Flex>
              <Flex>
                <EngagementSummary testResults={testResults} />
              </Flex>
            </View>
          </Flex>
        </>
      ) :
      ( <Auth /> )}
    </View>
  );
}
