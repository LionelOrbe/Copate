import { Colors } from '@/assets/Contants/Colors'
import { GStyles } from '@/assets/Contants/GeneralStyles'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useEffect, useState } from 'react'
import { Button, Modal, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'

type SettingsModalProps = {
    showSettingsModal: boolean
    setShowSettingsModal: (value: boolean) => void
    setAlarmOn: React.Dispatch<React.SetStateAction<boolean>>
    alarmOn: boolean
}


const SettingsModal = (props: SettingsModalProps) => {

    useEffect(() => {
        setAlarmOn(props.alarmOn);
    }, [props.alarmOn])

    const [alarmOn, setAlarmOn] = useState(false)

    const onCancelModal = () => {
        props.setShowSettingsModal(false);
    }

    const onChangeAlarm = () => {
        setAlarmOn(!alarmOn);
    }

    const onAcceptModal = () => {
        props.setAlarmOn(alarmOn);
        props.setShowSettingsModal(false);
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.showSettingsModal}
            onRequestClose={() => props.setShowSettingsModal(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={[styles.modalTitle, GStyles.shadow]}>Configuración</Text>
                    <View style={styles.itemContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={styles.modalText}>¿Activar alarma?</Text>
                            <TouchableOpacity>                             
                            <Ionicons name="information-circle-outline" size={30} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <Switch value={alarmOn} onChange={onChangeAlarm} thumbColor={alarmOn? Colors.primary : Colors.secondary} trackColor={{ true: Colors.secondary, false: 'white' }} />
                    </View>
                    <View style={styles.modalButtonContainer}>
                        <Button
                            title="Cancelar"
                            onPress={onCancelModal}
                            color="#666"
                        />
                        <Button
                            title="Aceptar"
                            onPress={onAcceptModal}
                            color={Colors.primary}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default SettingsModal

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: Colors.background,
        width: "90%",
        paddingBottom: 20,
        borderRadius: 10,
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
    modalText: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        color: Colors.primary,
        lineHeight: 24,
    },
    modalButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 70,
    },
    modalTitle: {
        width: "100%",
        fontSize: 20,
        fontWeight: "bold",
        backgroundColor: Colors.primary,
        color: 'white',
        borderRadius: 10,
        padding: 10,
        textAlign: "center",
        marginBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 20,
        paddingVertical: 10,
    },
})