import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, Animated, TouchableOpacity, Text } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video'; // Import from expo-video

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Define the golden ratio for box dimensions
const goldenRatio = 1.618;
const boxWidth = 100 * goldenRatio;  // Width of the box
const boxHeight = 100;  // Height of the box

// Calculate initial positions relative to the center of the screen
const initialBoxPositions = [
  { x: -200, y: -150 }, // Box 1
  { x: 0, y: -150 },    // Box 2
  { x: 200, y: -150 }   // Box 3
];

export default function App() {
  // Initialize Animated.ValueXY for box positions
  const [boxPositions] = useState(initialBoxPositions.map(pos => new Animated.ValueXY(pos)));

  // State to store box coordinates relative to the center of the screen
  const [boxCoords, setBoxCoords] = useState(initialBoxPositions);

  // Create PanResponders for each box to handle dragging
  const panResponders = boxPositions.map((position, index) =>
    usePanResponder(position, (x, y) => {
      const adjustedX = x - width / 2;
      const adjustedY = y - height / 2;
      setBoxCoords(prevCoords =>
        prevCoords.map((coord, i) => (i === index ? { x: adjustedX, y: adjustedY } : coord))
      );
    })
  );

  // Function to handle button press inside a box
  const handlePress = (boxNumber) => {
    alert(`Button in Box ${boxNumber} pressed!`);
  };

  // Create video player instance for Box 2
  const videoPlayer = useVideoPlayer('https://storage.googleapis.com/gtv-videos-bucket/sample/Google_I_O_2013_Keynote.mp4', player => {
    player.loop = true;
    player.play(); // Start playing the video automatically
   
  });

  useEffect(() => {
    if (videoPlayer) {
      videoPlayer.play(); // Ensure video is playing when player is ready
    }
  }, [videoPlayer]);

  return (
    <View style={styles.container}>
      {boxPositions.map((position, index) => (
        <Animated.View
          key={index}
          style={[
            styles.box,
            { transform: position.getTranslateTransform() }
          ]}
          {...panResponders[index].panHandlers}
        >
          {index === 1 ? ( // Box 2: Display video
            <View style={styles.videoContainer}>
              <VideoView
                style={styles.video}
                player={videoPlayer}
                allowsFullscreen
                allowsPictureInPicture
              />
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

// Hook to create PanResponder for a box
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

// Styles for the app
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background
    justifyContent: 'center', // Center boxes vertically
    alignItems: 'center', // Center boxes horizontally
  },
  box: {
    width: boxWidth,
    height: boxHeight,
    borderRadius: 10, // Rounded edges
    borderWidth: 2,
    borderColor: '#fff', // White outline
    backgroundColor: 'transparent', // No fill
    justifyContent: 'center', // Center content inside the box
    alignItems: 'center', // Center content inside the box
    position: 'absolute', // Absolute positioning for draggable effect
  },
  button: {
    backgroundColor: '#fff', // Button background color
    borderRadius: 5, // Rounded corners for the button
    padding: 10, // Button padding
  },
  buttonText: {
    color: '#000', // Button text color
    fontSize: 16, // Button text size
  },
  coordinatesText: {
    position: 'absolute', // Position coordinates text inside the box
    bottom: 10, // Position from the bottom of the box
    left: 10, // Position from the left of the box
    color: '#fff', // White color for text
    fontSize: 12, // Font size for coordinates
  },
  videoContainer: {
    width: boxWidth,
    height: boxHeight,
    justifyContent: 'center', // Center the video within the container
    alignItems: 'center', // Center the video within the container
  },
  video: {
    width: '100%', // Make the video fill the container width
    height: '100%', // Make the video fill the container height
  },
});
