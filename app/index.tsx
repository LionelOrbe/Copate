import { Colors } from "@/assets/Contants/Colors"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Slider from '@react-native-community/slider'
import * as BackgroundFetch from "expo-background-fetch"
import * as Notifications from "expo-notifications"
import * as TaskManager from "expo-task-manager"
import { useEffect, useState } from "react"
import { Alert, Button, StyleSheet, Text, View } from "react-native"
import { LiquidGauge } from 'react-native-liquid-gauge'
import ConfirmationModal from "./components/ConfirmationModal"

// Nombre de la tarea en segundo plano
const BACKGROUND_TIMER_TASK = "background-timer-task"

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

// Definir la tarea en segundo plano
TaskManager.defineTask(BACKGROUND_TIMER_TASK, async () => {
  try {
    const timerData = await AsyncStorage.getItem("timerData")

    if (timerData) {
      const { startTime, duration } = JSON.parse(timerData)
      const currentTime = Date.now()
      const elapsedTime = Math.floor((currentTime - startTime) / 1000)

      if (elapsedTime >= duration) {
        // El timer ha terminado
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "¡Es hora de limpiarte!",
            body: `Han pasado ${duration} horas.`,
            sound: true,
          },
          trigger: null, // Mostrar inmediatamente
        })

        // Limpiar los datos del timer
        await AsyncStorage.removeItem("timerData")

        return BackgroundFetch.BackgroundFetchResult.NewData
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NoData
  } catch (error) {
    console.error("Error en background task:", error)
    return BackgroundFetch.BackgroundFetchResult.Failed
  }
})

export default function TimerApp() {
  const [timerRunning, setTimerRunning] = useState(false)
  const [maxTime, setMaxTime] = useState(12)
  const [remainingTime, setRemainingTime] = useState(12)
  const [showRestartModal, setShowRestartModal] = useState(false)

  useEffect(() => {
    // Registrar la tarea en segundo plano
    registerBackgroundTask()

    // Solicitar permisos de notificaciones
    requestNotificationPermissions()

    // Verificar si hay un timer en progreso al iniciar la app
    checkExistingTimer()

    return () => {
      // Limpiar interval si existe
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [])

  let timerInterval: ReturnType<typeof setInterval>

  const registerBackgroundTask = async () => {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_TIMER_TASK, {
        minimumInterval: 15000, // Mínimo 15 segundos
        stopOnTerminate: false,
        startOnBoot: true,
      })
    } catch (error) {
      console.error("Error registrando background task:", error)
    }
  }

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        "Permisos requeridos",
        "Se necesitan permisos de notificaciones para que funcione el timer en segundo plano.",
      )
    }
  }

  const checkExistingTimer = async () => {
    try {
      const timerData = await AsyncStorage.getItem("timerData")
      if (timerData) {
        const { startTime, duration } = JSON.parse(timerData)
        const currentTime = Date.now()
        const elapsedTime = Math.floor((currentTime - startTime) / 1000)

        if (elapsedTime < duration) {
          // Hay un timer en progreso - calcular tiempo restante REAL
          const remaining = duration - elapsedTime
          setTimerRunning(true)
          setRemainingTime(remaining)

          // Iniciar countdown desde el tiempo restante REAL
          startCountdownFromRealTime(remaining)
        } else {
          // El timer ya terminó, limpiar datos
          await AsyncStorage.removeItem("timerData")
          setTimerRunning(false)
          setRemainingTime(0)
        }
      }
    } catch (error) {
      console.error("Error verificando timer existente:", error)
    }
  }

  const updateNotificationProgress = async (elapsedSeconds: number) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Ha${elapsedSeconds === 1 ? '' : 'n'} pasado ${elapsedSeconds} hora${elapsedSeconds === 1 ? '' : 's'}.`,
          sound: false,
        },
        trigger: null, // Mostrar inmediatamente
      });
    } catch (error) {
      console.error("Error actualizando notificación de progreso:", error);
    }
  };

  const startCountdownFromRealTime = (remainingSeconds: number) => {
    let timeLeft = remainingSeconds;
    const totalSeconds = remainingSeconds;
    setRemainingTime(timeLeft);

    if (timerInterval) {
      clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
      const elapsedSeconds = totalSeconds - timeLeft;
      timeLeft -= 1;
      setRemainingTime(timeLeft);

      // Actualizar notificación de progreso
      elapsedSeconds && updateNotificationProgress(elapsedSeconds);

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        setTimerRunning(false);
        setRemainingTime(0);
        // Limpiar datos cuando termine
        AsyncStorage.removeItem("timerData");
      }
    }, 1000);
  }

  const startTimer = async (seconds: number) => {
    try {
      setTimerRunning(true)

      // Guardar datos del timer en AsyncStorage con timestamp actual
      const timerData = {
        startTime: Date.now(),
        duration: seconds,
      }

      await AsyncStorage.setItem("timerData", JSON.stringify(timerData))

      // Programar notificación para cuando termine el tiempo
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Es hora de limpiarte!",
          body: `Han pasado ${seconds} horas.`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: seconds,
          repeats: false,
        },
      })

      // Iniciar countdown desde el tiempo completo
      startCountdownFromRealTime(seconds)
    } catch (error) {
      console.error("Error iniciando timer:", error)
      setTimerRunning(false)
      Alert.alert("Error", "No se pudo iniciar el timer")
    }
  }

  const stopTimer = async () => {
    try {
      // Cancelar notificaciones programadas
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Limpiar datos del timer
      await AsyncStorage.removeItem("timerData");

      // Limpiar estado
      setTimerRunning(false);
      setRemainingTime(0);

      if (timerInterval) {
        clearInterval(timerInterval);
      }

      // Cancelar notificaciones de progreso
      await Notifications.dismissAllNotificationsAsync(); // Asegurarse de cancelar todas las notificaciones activas
    } catch (error) {
      console.error("Error deteniendo timer:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Selecciona el máximo de horas</Text>
        <Slider
          style={{ width: '100%', height: 70, }}
          minimumValue={6}
          maximumValue={12}
          value={maxTime}
          onSlidingComplete={(value) => {
            setMaxTime(value)
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
      <View style={styles.buttonContainer}>
        {timerRunning ? (
          <Button
            title={"Reiniciar"}
            onPress={() => setShowRestartModal(true)}
          />
        ) : (
          <Button
            title={"Iniciar"}
            onPress={() => startTimer(maxTime)}
            color={Colors.secondary}
          />
        )}

        {timerRunning && <Button title="Detener Timer" onPress={stopTimer} color={Colors.primary} />}
      </View>
      <ConfirmationModal setShowRestartModal={setShowRestartModal} startTimer={startTimer} showRestartModal={showRestartModal} />
    </View>
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
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  timerDisplay: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 15,
    marginBottom: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "monospace",
  },
  statusText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
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
