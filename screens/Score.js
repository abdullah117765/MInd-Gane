import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { getGameStatsByEmail } from "../utils/SupabaseClient.js";

const Score = () => {
  const [gameStats, setGameStats] = useState([]);
  const [totalWins, setTotalWins] = useState(0);
  const [totalLosses, setTotalLosses] = useState(0);
  const [showMoreTimeBetween, setShowMoreTimeBetween] = useState({});
  const [showMoreClickOrder, setShowMoreClickOrder] = useState({});

  useEffect(() => {
    const getGameStats = async () => {
      const email = "axiomshah@gmail.com"; // Replace with dynamic email
      const fetchedStats = await getGameStatsByEmail(email);

      if (fetchedStats instanceof Error) {
        console.error("Error fetching game stats:", fetchedStats);
      } else {
        setGameStats(fetchedStats);
        setTotalWins(fetchedStats.filter((stat) => stat.wins === 1).length);
        setTotalLosses(fetchedStats.filter((stat) => stat.losses === 1).length);
      }
    };

    getGameStats();
  }, []);

  // Toggle "Show More" for time between clicks and click order
  const toggleShowMore = (gameId, type) => {
    if (type === "timeBetween") {
      setShowMoreTimeBetween((prev) => ({
        ...prev,
        [gameId]: !prev[gameId],
      }));
    } else if (type === "clickOrder") {
      setShowMoreClickOrder((prev) => ({
        ...prev,
        [gameId]: !prev[gameId],
      }));
    }
  };

  return (
    <StyledContainer>
      <PageTitle>🎮 Player Statistics</PageTitle>

      {/* Wins and Losses */}
      <StatsSummary>
        <StatItem>
          <StatIcon>
            <Ionicons name="football" size={30} color="#ffcc00" />
          </StatIcon>
          <StatText>Total Games</StatText>
          <StatBadge>{totalWins + totalLosses}</StatBadge>
        </StatItem>

        <StatItem>
          <StatIcon>
            <Ionicons name="trophy" size={30} color="#ffcc00" />
          </StatIcon>
          <StatText>Total Wins</StatText>
          <StatBadge>{totalWins}</StatBadge>
        </StatItem>

        <StatItem>
          <StatIcon>
            <Ionicons name="skull" size={30} color="#ff4d4d" />
          </StatIcon>
          <StatText>Total Losses</StatText>
          <StatBadge>{totalLosses}</StatBadge>
        </StatItem>
      </StatsSummary>

      {/* Divider */}
      <Line2 />

      {/* List of games */}
      <FlatList
        data={gameStats}
        keyExtractor={(item) => item.game_id.toString()}
        renderItem={({ item, index }) => (
          <GameCard>
            <GameTitle>Game {index + 1}</GameTitle>

            <GameDetail>
              <DetailLabel>🔥 Total Clicks:</DetailLabel>
              <DetailValue>{item.total_clicks}</DetailValue>
            </GameDetail>

            <GameDetail>
              <DetailLabel>⏱️ Time Between Clicks:</DetailLabel>
              <ArrayContainer>
                {(showMoreTimeBetween[item.game_id]
                  ? item.time_between_clicks
                  : item.time_between_clicks.slice(0, 5)
                ).map((time, index) => (
                  <ArrayItem key={index}>{time} sec</ArrayItem>
                ))}
              </ArrayContainer>
              {item.time_between_clicks.length > 5 && (
                <ToggleButton
                  onPress={() => toggleShowMore(item.game_id, "timeBetween")}
                >
                  <ButtonText>
                    {showMoreTimeBetween[item.game_id]
                      ? "Show Less"
                      : "Show More"}
                  </ButtonText>
                </ToggleButton>
              )}
            </GameDetail>

            <GameDetail>
              <DetailLabel>🔄 Click Order:</DetailLabel>
              <ArrayContainer>
                {(showMoreClickOrder[item.game_id]
                  ? item.click_order
                  : item.click_order.slice(0, 5)
                ).map((click, index) => (
                  <ArrayItem key={index}>{click}</ArrayItem>
                ))}
              </ArrayContainer>
              {item.click_order.length > 5 && (
                <ToggleButton
                  onPress={() => toggleShowMore(item.game_id, "clickOrder")}
                >
                  <ButtonText>
                    {showMoreClickOrder[item.game_id]
                      ? "Show Less"
                      : "Show More"}
                  </ButtonText>
                </ToggleButton>
              )}
            </GameDetail>

            <GameDetail>
              <DetailLabel>⌛ Game Duration:</DetailLabel>
              <DetailValue>{item.game_duration}</DetailValue>
            </GameDetail>

            <Line />
          </GameCard>
        )}
      />
    </StyledContainer>
  );
};

export default Score;

// Styled Components
const StyledContainer = styled.View`
  flex: 1;
  background-color: #f7f7f7;
  padding: 20px;
`;

const PageTitle = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: #4a4a4a;
  text-align: center;
  margin-bottom: 20px;
  margin-top: 40px;
`;

const StatsSummary = styled.View`
  flex-direction: row;
  justify-content: space-between;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 15px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  elevation: 4;
`;

const StatItem = styled.View`
  align-items: center;
`;

const StatIcon = styled.View`
  margin-bottom: 10px;
`;

const StatText = styled.Text`
  font-size: 16px;
  color: #4a4a4a;
`;

const StatBadge = styled.Text`
  font-size: 18px;
  color: #fff;
  background-color: #4a56e2;
  padding: 8px;
  border-radius: 8px;
  margin-top: 5px;
  font-weight: bold;
`;

const GameCard = styled.View`
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  shadow-color: #000;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 4;
`;

const GameTitle = styled.Text`
  font-size: 22px;
  color: #4a56e2;
  font-weight: bold;
  margin-bottom: 12px;
`;

const GameDetail = styled.View`
  margin-bottom: 10px;
`;

const DetailLabel = styled.Text`
  font-size: 16px;
  color: #4a4a4a;
  font-weight: bold;
`;

const DetailValue = styled.Text`
  font-size: 16px;
  color: #4a4a4a;
  margin-top: 5px;
`;

const ArrayContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const ArrayItem = styled.Text`
  font-size: 14px;
  color: #fff;
  background-color: #4a56e2;
  padding: 6px;
  margin-right: 6px;
  margin-bottom: 6px;
  border-radius: 6px;
`;

const ToggleButton = styled(TouchableOpacity)`
  margin-top: 8px;
  align-self: flex-start;
`;

const ButtonText = styled.Text`
  font-size: 14px;
  color: #4a56e2;
  font-weight: bold;
`;

const Line = styled.View`
  height: 1px;
  background-color: #eaeaea;
  margin: 12px 0;
`;

const Line2 = styled.View`
  height: 1px;
  background-color: #eaeaea;
  margin: 2px 0;
`;
