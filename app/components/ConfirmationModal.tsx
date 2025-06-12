import React from 'react'
import { Button, Modal, StyleSheet, Text, View } from 'react-native'

type ConfirmationModalProps = {
  showRestartModal: boolean
  setShowRestartModal: (value: boolean) => void
  startTimer: (seconds: number) => void
}

const ConfirmationModal = (props: ConfirmationModalProps) => {
  return (
     <Modal
             animationType="slide"
             transparent={true}
             visible={props.showRestartModal}
             onRequestClose={() => props.setShowRestartModal(false)}
           >
             <View style={styles.modalContainer}>
               <View style={styles.modalContent}>
                 <Text style={styles.modalText}>¿Estás segura de que deseas reiniciar?</Text>
                 <View style={styles.modalButtonContainer}>
                   <Button
                     title="Cancelar"
                     onPress={() => props.setShowRestartModal(false)}
                     color="#666"
                   />
                   <Button
                     title="Reiniciar"
                     onPress={() => {
                       props.setShowRestartModal(false);
                       props.startTimer(12);
                     }}
                     color="#ff4444"
                   />
                 </View>
               </View>
             </View>
           </Modal>
  )
}

export default ConfirmationModal

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      },
      modalContent: {
        backgroundColor: "white",
        padding: 20,
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
        fontSize: 18,
        marginBottom: 20,
        textAlign: "center",
      },
      modalButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
      },
})