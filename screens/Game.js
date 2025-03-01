import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { saveGameStatsFunction } from "../utils/SupabaseClient.js";
const backgroundMusicSource = require("../assets/sounds/background-music.mp3");
const actionImageSources = {
  Acar: require("../assets/Acarbose.png"),
  Piog: require("../assets/Pioglitazone.png"),
  Sema: require("../assets/Semaglutide.png"),
  Sita: require("../assets/Sitagliptin.png"),
  Dapag: require("../assets/Dapagliflozin.png"),
  Pram: require("../assets/Pramlintide.png"),
  Glim: require("../assets/Glimepiride.png"),
  Meta: require("../assets/Metformin.png"),
};

const DRUGS = [
  { name: "Acarbose", action: "Acar" },
  { name: "Pioglitazone", action: "Piog" },
  { name: "Semaglutide", action: "Sema" },
  { name: "Sitagliptin", action: "Sita" },
  { name: "Dapaglifozin", action: "Dapag" },
  { name: "Pramlintide", action: "Pram" },
  { name: "Glimepiride", action: "Glim" },
  { name: "Metformin", action: "Meta" },
];
const DrugName = ({ card }) => <Text style={styles.cardText}>{card.name}</Text>;

const DrugImage = ({ card }) => (
  <Image source={actionImageSources[card.action]} style={styles.cardImage} />
);

function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

function generateInitialCards() {
  const shuffledDrugs = shuffleArray(DRUGS);
  const drugPairs = shuffledDrugs.flatMap((drug, index) => [
    { ...drug, id: index, isFlipped: false, backgroundColor: drug.color },
    {
      ...drug,
      id: index + 6,
      isFlipped: false,
      backgroundColor: drug.color,
      isAction: true,
    },
  ]);
  return shuffleArray(drugPairs);
}

export default function Game({ route, navigation }) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(90); // initial 90
  const [totalClicks, setTotalClicks] = useState(0);
  const clickTimes = useRef([]); //track time between clicks
  const clickTimes2 = useRef([]); //track time between clicks
  const clickOrder = useRef({}); // track order of clicks
  const clickOrder2 = useRef([]); // track order of clicks
  const gameStartTime = useRef(null);
  const gameEndTime = useRef(null);
  let wins = 0;
  let losses = 0;
  let incomplete = 0;
  const FCount = useRef(0);
  const userEmail = useRef(null);
  const user = useRef(null);

  const timerIntervalRef = useRef(null);

  // Refs for the sounds
  const matchSoundRef = useRef(null);
  const noMatchSoundRef = useRef(null);
  const backgroundMusic = useRef(null);

  const { profile } = route.params; // this is the user profile from the login screen, profile.full_name is the user's name, profile.email is the user's email profile.email is the user's email

  useEffect(() => {
    if (profile) {
      userEmail.current = profile.email;
      user.current = profile.id;
    }
  }, [profile]);

  useEffect(() => {
    if (!showWelcome) {
      startGame();
    }
  }, [showWelcome]);

  useEffect(() => {
    if (selectedCards.length === 2) {
      const [firstCard, secondCard] = selectedCards;
      if (
        cards[firstCard].name === cards[secondCard].name &&
        cards[firstCard].isAction !== cards[secondCard].isAction
      ) {
        setMatchedPairs((prev) => prev + 1);
        playSound(matchSoundRef.current); // Play the match sound
        setMessage("Correct match!");
        checkGameEnd();
      } else {
        setTimeout(() => {
          playSound(noMatchSoundRef.current); // Play the no-match sound
          flipBackSelectedCards();
          setMessage("Incorrect match. Try again.");
        }, 1000);
      }
    }
  }, [selectedCards, cards]);

  // Load sounds once when the component mounts
  useEffect(() => {
    loadSounds();
    return () => {
      unloadSounds(); // Clean up sounds when the component unmounts
    };
  }, []);

  // Unload background music when component is unmounted to release resources
  useEffect(() => {
    return () => {
      if (backgroundMusic.current) {
        backgroundMusic.current.unloadAsync();
      }
    };
  }, []);

  const loadSounds = async () => {
    const { sound: matchSound } = await Audio.Sound.createAsync(
      require("../assets/sounds/match.mp3")
    );
    const { sound: noMatchSound } = await Audio.Sound.createAsync(
      require("../assets/sounds/no-match.mp3")
    );
    matchSoundRef.current = matchSound;
    noMatchSoundRef.current = noMatchSound;
  };

  const unloadSounds = async () => {
    if (matchSoundRef.current) {
      await matchSoundRef.current.unloadAsync();
    }
    if (noMatchSoundRef.current) {
      await noMatchSoundRef.current.unloadAsync();
    }
  };

  const playSound = async (sound) => {
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        console.error("Error playing sound:", error);
      }
    }
  };

  // Load and play background music when game starts or restarts
  const playBackgroundMusic = async () => {
    if (!backgroundMusic.current) {
      const { sound } = await Audio.Sound.createAsync(backgroundMusicSource, {
        isLooping: true, // Ensures the background music loops
      });
      backgroundMusic.current = sound;
    }

    await backgroundMusic.current.playAsync();
  };

  // Stop background music
  const stopBackgroundMusic = async () => {
    if (backgroundMusic.current) {
      await backgroundMusic.current.stopAsync();
    }
  };

  // // Detect when the user navigates away from the game screen
  // useFocusEffect(
  //   useCallback(() => {
  //     return () => {
  //       // The game was incomplete when the user navigated away
  //       console.log("time interval", timerIntervalRef.current);
  //       if (
  //         // timerIntervalRef.current > 0 &&
  //         wins.current != 0 ||
  //         losses.current != 0
  //       ) {
  //         handleIncompleteGame();
  //       }
  //     };
  //   }, [])
  // );

  // const handleIncompleteGame = () => {
  //   incomplete += 1;
  //   gameEndTime.current = new Date();
  //   console.log("incomlete", incomplete);
  //   saveGameStats2();
  // };

  const startGame = () => {
    // Stop existing background music if restarting the game
    stopBackgroundMusic();

    // Play background music at the start of the game
    playBackgroundMusic();

    if (FCount.current != 0 && clickTimes.current.length > 0) {
      incomplete += 1;
      gameEndTime.current = new Date();
      saveGameStats2(); // save stats if restarted game in the middle of the game
    }
    console.log("Starting game...");
    // Clear any existing timer interval before starting a new one
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // Reset the timer to the initial value
    setTimer(90); // was 90 seconds

    // Reset other game state variables
    setCards(generateInitialCards());
    setSelectedCards([]);
    setMatchedPairs(0);
    setMessage("");
    setTotalClicks(0);
    FCount.current = 0;
    clickTimes.current = [];
    clickTimes2.current = [];
    clickOrder2.current = [];
    clickOrder.current = {};
    wins = 0;
    losses = 0;
    incomplete = 0;

    const timerDelay = setTimeout(() => {
      startTimer();
      gameStartTime.current = new Date();
    }, 2000);
  };

  // Card click handler, including click order and timing tracking
  const handleCardPress = (index) => {
    if (selectedCards.length === 2) {
      return;
    }
    setTotalClicks((prevTotalClicks) => prevTotalClicks + 1);
    FCount.current += 1;

    const now = new Date();
    // Track the time of the click
    console.log("now", now);
    if (clickTimes.current.length > 1) {
      const difference =
        clickTimes2.current[clickTimes2.current.length - 1] -
        clickTimes2.current[clickTimes2.current.length - 2]; // difference in milliseconds

      const seconds = Math.floor(difference / 1000);
      clickTimes.current.push(seconds);
      clickTimes2.current.push(now);
    } else {
      clickTimes.current.push(0); // this store the difference in time
      clickTimes2.current.push(now); // this stores time
    }

    const cardName = cards[index].name;

    // Check if clickOrder.current[cardName] exists, if not, initialize it as an empty array
    if (!clickOrder.current[cardName]) {
      clickOrder.current[cardName] = [];
    }

    clickOrder.current[cardName].push(totalClicks + 1);

    clickOrder2.current.push(cards[index].name);

    setSelectedCards((prev) => [...prev, index]);
    setCards((prevCards) => {
      const newCards = [...prevCards];
      newCards[index].isFlipped = true;
      return newCards;
    });
  };

  const flipBackSelectedCards = () => {
    setCards((prevCards) => {
      const newCards = [...prevCards];
      selectedCards.forEach((index) => {
        newCards[index].isFlipped = false;
      });
      setSelectedCards([]);
      return newCards;
    });
  };

  const checkGameEnd = () => {
    if (matchedPairs + 1 === DRUGS.length) {
      wins += 1;
      gameEndTime.current = new Date();
      clearInterval(timerIntervalRef.current); // Stop the timer

      setMessage("Congratulations! You matched all pairs.");
      stopBackgroundMusic(); // Stop the background music on game completion

      saveGameStats2(); // Save win stats   you win saving the stats to supabase
    }
    setSelectedCards([]);
  };

  const startTimer = () => {
    // Set a new interval and save its ID
    timerIntervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerIntervalRef.current); // Stop the timer when it reaches 0
          handleTimeout();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    setMessage("Time is up! Game over.");
    clearInterval(timerIntervalRef.current); // Ensure the timer stops when time is up
    //here

    losses += 1;
    gameEndTime.current = new Date();
    saveGameStats2(); // Save loss stats    you lost the game so save the game stats
  };

  const saveGameStats2 = async () => {
    const gameDuration = (gameEndTime.current - gameStartTime.current) / 1000; // Duration in seconds

    const stats = {
      user_email: userEmail.current,
      user: user.current,
      // total_games_played: 1,
      wins: wins,
      losses: losses,
      incomplete: incomplete,
      total_clicks: FCount.current,
      time_between_clicks: clickTimes.current,
      click_order: clickOrder.current,
      click_order2: clickOrder2.current,
      game_duration: gameDuration,
    };

    console.log("Game stats:", stats);

    let result = await saveGameStatsFunction(stats); // Save the data using Supabase

    setMessage(result);
  };

  const renderCard = (card, index) => {
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.card,
          { backgroundColor: card.isFlipped ? card.backgroundColor : "white" },
        ]}
        onPress={() => handleCardPress(index)}
        disabled={card.isFlipped || selectedCards.length === 2}
      >
        {!card.isFlipped && (
          <Image
            source={require("../assets/Pill.png")}
            style={styles.cardImage}
          />
        )}
        {card.isFlipped && !card.isAction && (
          <Text style={styles.cardText}>{card.name}</Text>
        )}
        {card.isFlipped && card.isAction && <DrugImage card={card} />}
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      {showWelcome && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showWelcome}
          onRequestClose={() => {
            setShowWelcome(false);
          }}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.welcomeHeader}>Welcome to Memory Quest</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setShowWelcome(false)}
            >
              <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      {!showWelcome && (
        <View style={styles.gameContainer}>
          <Text style={styles.gameHeader}>Memory Quest</Text>
          <Text style={styles.clicks}>Total clicks: {totalClicks}</Text>
          <Text style={styles.timer}>
            Time left: {Math.floor(timer / 60)}:
            {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
          </Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.cardsContainer}>
            {cards.map((card, index) => renderCard(card, index))}
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={startGame}>
            <Text style={styles.resetButtonText}>Restart Game</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  welcomeHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  gameHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  timer: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "blue",
    textAlign: "center",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    width: 80,
    height: 100,
    margin: 5,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "black",
  },
  cardText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 12,
  },
  resetButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    alignSelf: "center",
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  startButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#2ecc71",
    borderRadius: 8,
  },
  startButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  gameContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },
});
