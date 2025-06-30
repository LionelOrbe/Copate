import { Colors } from "@/assets/Contants/Colors"
import { GStyles } from "@/assets/Contants/GeneralStyles"
import Ionicons from '@expo/vector-icons/Ionicons'
import AsyncStorage from "@react-native-async-storage/async-storage"
import Slider from '@react-native-community/slider'
import { removeAlarm, scheduleAlarm } from "expo-alarm-module"
import * as Notifications from "expo-notifications"
import { useFocusEffect } from "expo-router"
import { useCallback, useRef, useState } from "react"
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Flow } from 'react-native-animated-spinkit'
import { LiquidGauge } from 'react-native-liquid-gauge'
import { SafeAreaView } from "react-native-safe-area-context"
import Snackbar from 'react-native-snackbar'
import ConfirmationModal from "./components/ConfirmationModal"
import SettingsModal from "./components/SettingsModal"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

type TimerDataType = {
  startTime: number;
  duration: number;
  maxTime: number;
  timerRunning: boolean;
  alarmOn?: boolean;
}

export default function TimerApp() {
  const [timerRunning, setTimerRunning] = useState(false)
  const [maxTime, setMaxTime] = useState(43200)
  const [remainingTime, setRemainingTime] = useState(43200)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [alarmOn, setAlarmOn] = useState(false)

  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdownFromRealTime = useCallback((remainingSeconds: number) => {
    let timeLeft = remainingSeconds;
    setRemainingTime(timeLeft);

    if (timerInterval) {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }

    timerInterval.current = setInterval(() => {
      timeLeft -= 1;
      setRemainingTime(timeLeft);

      if (timeLeft <= 0) {
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
        }
        setTimerRunning(false);
        setRemainingTime(0);
        // Limpiar datos cuando termine
        AsyncStorage.removeItem("timerData");
      }
    }, 1000);
  }, []);

  const checkExistingTimer = useCallback(async () => {
    try {
      const timerData = await AsyncStorage.getItem("timerData")
      if (timerData) {
        const { startTime, duration, alarmOn } = JSON.parse(timerData)
        const currentTime = Date.now()
        const elapsedTime = Math.floor((currentTime - startTime) / 1000)
        setMaxTime(duration)
        setRemainingTime(duration - elapsedTime)
        setTimerRunning(true)
        setAlarmOn(alarmOn || false)
        if (elapsedTime < duration) {
          const remaining = duration - elapsedTime
          setTimerRunning(true)
          setRemainingTime(remaining)
          startCountdownFromRealTime(remaining)
        } else {
          await AsyncStorage.removeItem("timerData")
          setTimerRunning(false)
          setRemainingTime(0)
        }
      }
    } catch (error) {
      console.error("Error verificando timer existente:", error)
    }
  }, [startCountdownFromRealTime])

  useFocusEffect(() => {
    checkExistingTimer();
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  });

  const startTimer = async (seconds: number) => {
    try {
      setTimerRunning(true)

      const timerData: TimerDataType = {
        startTime: Date.now(),
        duration: seconds,
        maxTime: seconds,
        timerRunning: true,
        alarmOn: alarmOn,
      }

      await AsyncStorage.setItem("timerData", JSON.stringify(timerData))

      if (alarmOn) {
        alarmActivation(seconds)
      } else await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡El tiempo ha terminado! 🔔",
          body: `Han pasado ${seconds / 3600} horas.`,
          sound: true,
          vibrate: [0, 500, 250, 250],
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: seconds,
          repeats: false,
        },
      })
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Ya paso la mitad del tiempo!",
          sound: false,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: seconds / 2,
          repeats: false,
        },
      })
      // Iniciar el intervalo de countdown desde el tiempo restante REAL
      startCountdownFromRealTime(seconds)
    } catch (error) {
      console.error("Error iniciando timer:", error)
      setTimerRunning(false)
      Alert.alert("Error", "No se pudo iniciar el timer")
    }
    Snackbar.show({
      text: `Se ha iniciado el temporizador, ${maxTime / 3600} horas restantes`,
      duration: Snackbar.LENGTH_SHORT,
      textColor: 'wihite',
    });
  }

  const stopTimer = async () => {
    try {
      setTimerRunning(false);
      setRemainingTime(43200);
      removeAlarm("alarm1");
      await AsyncStorage.removeItem("timerData");
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
      // Cancelar notificaciones de progreso
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error("Error deteniendo timer:", error);
    }
    setTimerRunning(false);
    setRemainingTime(43200);
    removeAlarm("alarm1");
  };

  const alarmActivation = (seconds: number) => {
    let newDate = new Date();
    newDate.setSeconds(newDate.getSeconds() + seconds);
    scheduleAlarm(
      {
        uid: "alarm1",
        day: newDate,
        title: "¡El tiempo ha terminado! 🔔",
        description: `Han pasado ${seconds / 3600} horas.`,
        showDismiss: true,
        showSnooze: true,
        snoozeInterval: 10,
        snoozeText: "10 min. más",
        dismissText: "Desactivar",
        repeating: true,
        active: true
      } as any
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => setShowSettingsModal(true)} style={{ position: 'absolute', top: 35, right: 15 }} disabled={timerRunning}>
        <Ionicons name="settings" size={32} color={timerRunning? 'grey' : Colors.primary} />
      </TouchableOpacity>
      <View style={[styles.titleContainer, GStyles.shadow, timerRunning ? { borderColor: 'grey' } : null]}>
        <Text style={[styles.title, timerRunning ? { color: 'grey' } : null]}>Selecciona el máximo de horas</Text>
        <Slider
          style={{ width: '100%', height: 70, }}
          minimumValue={4}
          maximumValue={12}
          value={maxTime / 3600}
          onSlidingComplete={(value) => {
            setMaxTime(value * 3600)
          }}
          disabled={timerRunning}
          step={1}
          minimumTrackTintColor={Colors.secondary}
          maximumTrackTintColor="#000000"
          thumbTintColor={Colors.primary}
          renderStepNumber
        />
      </View>
      <LiquidGauge
        config={{
          circleColor: Colors.primary,
          textColor: Colors.background,
          waveTextColor: '#FFAAAA',
          waveColor: Colors.secondary,
          circleThickness: 0.1,
          waveAnimateTime: 1000,
          textSize: 0,
        }}
        value={(maxTime - remainingTime) * 100 / maxTime}
        width={200}
        height={200}
      />
      <Flow animating={timerRunning} color={Colors.secondary} />
      <View style={styles.buttonContainer}>
        {timerRunning ? (
          <Button title="Detener" onPress={() => setShowConfirmationModal(true)} color={Colors.primary} />
        ) : (
          <Button
            title={"Iniciar"}
            onPress={() => startTimer(maxTime)}
            color={Colors.primary}
          />
        )}
      </View>
      <ConfirmationModal setShowConfirmationModal={setShowConfirmationModal} stopTimer={stopTimer} showConfirmationModal={showConfirmationModal} />
      <SettingsModal setShowSettingsModal={setShowSettingsModal} setAlarmOn={setAlarmOn} showSettingsModal={showSettingsModal} alarmOn={alarmOn} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.primary,
  },
  titleContainer: {
    width: "100%",
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  buttonContainer: {
    gap: 15,
    width: "100%",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
})
