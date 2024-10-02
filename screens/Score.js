import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, ScrollView } from "react-native";
import styled from "styled-components/native";
import { Line, PageTitle, StyledContainer } from "../components/styles";
import { getGameStatsByEmail } from "../utils/SupabaseClient.js";

const Score = () => {
  // State to hold game statistics
  const [gameStats, setGameStats] = useState([]);
  const [totalWins, setTotalWins] = useState(0);
  const [totalLosses, setTotalLosses] = useState(0);

  useEffect(() => {
    const getGameStats = async () => {
      const email = "axiomshah@gmail.com"; // Assuming userEmail.current holds the user's email
      const fetchedStats = await getGameStatsByEmail(email);

      if (fetchedStats instanceof Error) {
        console.error("Error fetching game stats:", fetchedStats);
      } else {
        setGameStats(fetchedStats);
        setTotalWins(fetchedStats.filter((stat) => stat.wins === 1).length); // Example logic for wins
        setTotalLosses(fetchedStats.filter((stat) => stat.losses === 1).length); // Example logic for losses
      }
    };

    getGameStats();
  }, []); // Empty dependency array to run on mount

  return (
    <StyledContainer>
      <ScrollView>
        <PageTitle>Player Statistics</PageTitle>

        {/* Wins and Losses */}
        <StatsSummary>
          <StatItem>
            <StatIcon>
              <Ionicons name="trophy" size={24} color="gold" />
            </StatIcon>
            <StatText>Total Wins: {totalWins}</StatText>
          </StatItem>

          <StatItem>
            <StatIcon>
              <Ionicons name="skull" size={24} color="red" />
            </StatIcon>
            <StatText>Total Losses: {totalLosses}</StatText>
          </StatItem>
        </StatsSummary>

        {/* Divider */}
        <Line />

        {/* List of games */}
        <FlatList
          data={gameStats}
          keyExtractor={(item) => item.game_id.toString()}
          renderItem={({ item }) => (
            <GameCard>
              <GameTitle>Game {item.game_id}</GameTitle>

              <GameDetail>
                <DetailLabel>Total Clicks:</DetailLabel>
                <DetailValue>{item.total_clicks}</DetailValue>
              </GameDetail>

              <GameDetail>
                <DetailLabel>Time Between Clicks:</DetailLabel>
                <DetailValue>
                  {item.time_between_clicks.join(", ")} sec
                </DetailValue>
              </GameDetail>

              <GameDetail>
                <DetailLabel>Click Order:</DetailLabel>
                <DetailValue>{item.click_order.join(", ")}</DetailValue>
              </GameDetail>

              <GameDetail>
                <DetailLabel>Game Duration:</DetailLabel>
                <DetailValue>{item.game_duration}</DetailValue>
              </GameDetail>

              <Line />
            </GameCard>
          )}
        />
      </ScrollView>
    </StyledContainer>
  );
};

export default Score;

const StatsSummary = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 20px;
`;

const StatItem = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StatIcon = styled.View`
  margin-right: 10px;
`;

const StatText = styled.Text`
  font-size: 18px;
  color: #1f2937;
  font-weight: bold;
`;

const GameCard = styled.View`
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  elevation: 3;
`;

const GameTitle = styled.Text`
  font-size: 22px;
  color: #6d28d9;
  font-weight: bold;
  margin-bottom: 10px;
`;

const GameDetail = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const DetailLabel = styled.Text`
  font-size: 16px;
  color: #374151;
`;

const DetailValue = styled.Text`
  font-size: 16px;
  color: #1f2937;
  font-weight: bold;
`;
