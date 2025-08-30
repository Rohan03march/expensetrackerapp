import { StyleSheet, Text, View, ScrollView, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import Header from "@/components/Header";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { BarChart } from "react-native-gifted-charts";
import Loading from "@/components/Loading";
import { useAuth } from "@/contexts/authContext";
import {
  fetchMonthlyStats,
  fetchWeeklyStats,
} from "@/services/transactionService";
import TransactionList from "@/components/TransactionList";

const Statistics = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useAuth();
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (activeIndex === 0) getWeeklyStats();
    if (activeIndex === 1) getMonthlyStats();
    if (activeIndex === 2) getYearlyStats();
  }, [activeIndex]);

  const getWeeklyStats = async () => {
    setChartLoading(true);
    let res = await fetchWeeklyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  const getMonthlyStats = async () => {
    setChartLoading(true);
    let res = await fetchMonthlyStats(user?.uid as string);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  const getYearlyStats = async () => {
    setChartData([]); // todo: implement yearly API
    setTransactions([]);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title="Statistics" />

        <ScrollView
          contentContainerStyle={{
            gap: spacingY._20,
            paddingTop: spacingY._5,
            paddingBottom: verticalScale(100),
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Segmented Control */}
          <SegmentedControl
            values={["Weekly", "Monthly", "Yearly"]}
            selectedIndex={activeIndex}
            onChange={(event) => {
              setActiveIndex(event.nativeEvent.selectedSegmentIndex);
            }}
            tintColor={colors.neutral200}
            backgroundColor={colors.neutral800}
            appearance="dark"
            activeFontStyle={styles.segmentActiveFont}
            style={styles.segmentStyle}
            fontStyle={{ ...styles.segmentFontStyle, color: colors.white }}
          />

          {/* Chart */}
          <View style={styles.chartContainer}>
            {chartData.length > 0 ? (
              <BarChart
                data={chartData.map((item) => ({
                  ...item,
                  value: Math.abs(item.value),
                  frontColor:
                    item.type?.toLowerCase() === "expense"
                      ? "#F44336"
                      : "#4CAF50",
                }))}
                barWidth={scale(14)}
                spacing={[1, 2].includes(activeIndex) ? scale(25) : scale(30)}
                roundedTop
                roundedBottom
                hideRules
                yAxisLabelPrefix="₹"
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisLabelWidth={scale(60)}
                yAxisTextStyle={{ color: colors.neutral350 }}
                xAxisLabelTextStyle={{
                  color: colors.neutral350,
                  fontSize: verticalScale(12),
                }}
                noOfSections={3}
                minHeight={5}
              />
            ) : (
              <View style={styles.noChart}>
                <Text style={{ color: colors.neutral300 }}>
                  No data available
                </Text>
              </View>
            )}
            {chartLoading && (
              <View style={styles.chartLoadingContainer}>
                <Loading color={colors.white} />
              </View>
            )}
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: "#4CAF50" }]} />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: "#F44336" }]} />
              <Text style={styles.legendText}>Expenses</Text>
            </View>
          </View>

          {/* Transactions */}
          <TransactionList
            title="Transactions"
            emptyListMessage="No transactions found"
            data={transactions}
          />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Statistics;

const styles = StyleSheet.create({
  chartContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: spacingY._10,
    borderRadius: radius._12,
  },
  chartLoadingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: radius._12,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  noChart: {
    justifyContent: "center",
    alignItems: "center",
    height: verticalScale(210),
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacingX._20,
    marginTop: spacingY._10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  legendText: {
    color: colors.white,
    fontSize: verticalScale(12),
  },
  segmentStyle: {
    height: scale(37),
    borderRadius: scale(8),
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: "600",
  },
  segmentActiveFont: {
    fontSize: verticalScale(13),
    fontWeight: "700",
    color: colors.black,
  },
  container: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5,
    gap: spacingY._10,
    flex: 1,
  },
});
