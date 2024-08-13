
// the weeknd web react

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, Animated, TouchableOpacity, Text } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import transcript from './assets/transcript.json';                                // Import transcript from assets folder

const { width, height } = Dimensions.get('window');                               // Set screen width and height


const goldenRatio = 1.618;                                                        // Golden ratio for boxes
const boxWidth = 100 * goldenRatio;                                               // Box width
const boxHeight = 100;                                                            // Box height

const initialBoxPositions = [                                                     // Set initial positions relative to center of screen
  { x: -200, y: -150 },                                                           // Box 1
  { x: 0, y: -150 },                                                              // Box 2
  { x: 200, y: -150 }                                                             // Box 3
];

export default function App() {
                                                                                  // Initialize boxes for movement

  const [boxPositions] = useState(initialBoxPositions.map(pos => new Animated.ValueXY(pos)));

                                                                                  // Initialize boxes relative to center of screen
  const [boxCoords, setBoxCoords] = useState(initialBoxPositions);

                                                                                  // Initialize captions
  const [currentText, setCurrentText] = useState('');

                                                                                  // Enable drag - drop
  const panResponders = boxPositions.map((position, index) =>
    usePanResponder(position, (x, y) => {
      const adjustedX = x - width / 2;
      const adjustedY = y - height / 2;
      setBoxCoords(prevCoords =>
        prevCoords.map((coord, i) => (i === index ? { x: adjustedX, y: adjustedY } : coord))
      );
    })
  );

                                                                                  // Enable button within boxes
  const handlePress = (boxNumber) => {
    alert(`Button in Box ${boxNumber} pressed!`);
  };

                                                                                  // Create video player instance for Box 2

  const videoPlayer = useVideoPlayer('https://storage.googleapis.com/gtv-videos-bucket/sample/Google_I_O_2013_Keynote.mp4', player => {
    player.loop = true;
    player.play();
    player.muted = true;
  });

  useEffect(() => {
    if (videoPlayer) {
      videoPlayer.pause();                                                        // Start paused, note this is done outside of the video player instance
    }
  }, [videoPlayer]);

                                                                                  // Update captions based on video currentTime
  useEffect(() => {
    const updateCaptions = () => {
      const currentTime = videoPlayer?.currentTime || 0;
      const caption = transcript.find(({ start, duration }) =>
        currentTime >= start && currentTime <= start + duration
      );
      setCurrentText(caption ? caption.text : '');
    };

    const intervalId = setInterval(updateCaptions, 100);                          // Update captions every 100 ms
    return () => clearInterval(intervalId);
  }, [videoPlayer]);                                                              // Unload timer

  return (                                                                        // Boxes 1, 2, 3 == index 0, 1, 2
    <View style={styles.container}>
      {boxPositions.map((position, index) => (
        <Animated.View                                                            // Box 1: Empty
          key={index}
          style={[
            styles.box,
            { transform: position.getTranslateTransform() }
          ]}
          {...panResponders[index].panHandlers}
        >
          {index === 1 ? (                                                        // Box 2: Video Player
            <View style={styles.videoContainer}>
              <VideoView
                style={styles.video}
                player={videoPlayer}
                allowsFullscreen
              />
            </View>
          ) : index === 2 ? (                                                     // Box 3: Transcript
            <View style={styles.overlayContainer}>
              <Text style={styles.transcriptText}>{currentText}</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity onPress={() => handlePress(index + 1)} style={styles.button}>
                <Text style={styles.buttonText}>Box {index + 1}</Text>
              </TouchableOpacity>
              <Text style={styles.coordinatesText}>
                X: {Math.round(boxCoords[index].x)} Y: {Math.round(boxCoords[index].y)}
              </Text>
            </>
          )}
        </Animated.View>
      ))}
    </View>
  );
}

                                                                                  // Hook for drag drop box
const usePanResponder = (position, onMove) => {
  return useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.__getValue().x,
          y: position.__getValue().y
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        {
          useNativeDriver: false,
          listener: (event, gestureState) => {
            const centerX = width / 2;
            const centerY = height / 2;
            onMove(gestureState.moveX + centerX, gestureState.moveY + centerY);
          }
        }
      ),
      onPanResponderRelease: () => {
        position.flattenOffset();
      }
    })
  ).current;
};

                                                                                  // Styles for the Weeknd
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',                                                      // Black background
    justifyContent: 'center',                                                     // Center boxes vertically
    alignItems: 'center',                                                         // Center boxes horizontally
  },
  box: {                                                                          // Box style
    width: boxWidth,
    height: boxHeight,
    borderRadius: 10,                                                             // Rounded edges for boxes
    borderWidth: 2,
    borderColor: '#fff',                                                          // White outline
    backgroundColor: 'transparent',                                               // No fill
    justifyContent: 'center',                                                     // Center content inside box
    alignItems: 'center',                                                         // Center content inside box
    userSelect: 'none',                                                           // Text selection off
    position: 'absolute',                                                         // Absolute positioning for draggable effect
  },
  button: {
    backgroundColor: '#fff',                                                      // Button background color
    borderRadius: 5,                                                              // Rounded corners for the button
    padding: 10,                                                                  // Button padding
  },
  buttonText: {
    color: '#000',                                                                // Button text color
    fontSize: 16,                                                                 // Button text size
  },
  coordinatesText: {
    position: 'absolute',                                                         // Position coordinates text inside the box
    bottom: 10,                                                                   // Position from the bottom of the box
    left: 10,                                                                     // Position from the left of the box
    color: '#fff',                                                                // White color for text
    fontSize: 12,                                                                 // Font size for coordinates
  },
  videoContainer: {
    width: boxWidth,
    height: boxHeight,
    justifyContent: 'center',                                                     // Center video within container
    alignItems: 'center',                                                         // Center video within container
  },
  video: {
    width: '95%',                                                                 // 95% zoom for inside edge
    height: '95%',                                                                // 95% zoom for inside edge
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,                                             // Parent container
    justifyContent: 'center',
    alignItems: 'center',
  },
  transcriptText: {
    color: '#fff',                                                                // White transcript text
    fontSize: 16,                                                                 // Transcript text size
    textAlign: 'center',                                                          // Center text
    backgroundColor: 'rgba(0, 0, 0, 0.5)',                                        // Semi-transparent alpha
    padding: 10,
  },
});
