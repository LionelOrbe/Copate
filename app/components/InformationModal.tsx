import { Colors } from '@/assets/Contants/Colors'
import { GStyles } from '@/assets/Contants/GeneralStyles'
import React from 'react'
import { Button, Modal, StyleSheet, Text, View } from 'react-native'

type InfoModalProps = {
    title: string;
    messagge: string;
    showInfoModal: boolean;
    setShowInfoModal: (value: boolean) => void;
}


const InfoModal = (props: InfoModalProps) => {

     return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.showInfoModal}
            onRequestClose={() => props.setShowInfoModal(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={[styles.modalTitle, GStyles.shadow]}>{props.title || 'Información'}</Text>                  
                    <Text style={styles.modalText}>{props.messagge}</Text>                 
                    <View style={styles.modalButtonContainer}>   
                        <Button
                            title="    Ok    "
                            onPress={() => props.setShowInfoModal(false)}
                            color={Colors.primary}                                                        
                        />
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default InfoModal

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
        color: 'grey',
        lineHeight: 24,
        marginHorizontal: 20,
    },
    modalButtonContainer: {        
        marginTop: 20,
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
})