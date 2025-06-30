import { Colors } from '@/assets/Contants/Colors'
import React from 'react'
import { Button, Modal, StyleSheet, Text, View } from 'react-native'

type ConfirmationModalProps = {
  showConfirmationModal: boolean
  setShowConfirmationModal: (value: boolean) => void
  stopTimer: () => void
}

const ConfirmationModal = (props: ConfirmationModalProps) => {
  return (
     <Modal
             animationType="slide"
             transparent={true}
             visible={props.showConfirmationModal}
             onRequestClose={() => props.setShowConfirmationModal(false)}
           >
             <View style={styles.modalContainer}>
               <View style={styles.modalContent}>
                 <Text style={styles.modalText}>¿Estás segura de que deseas detener la cuenta?</Text>
                 <View style={styles.modalButtonContainer}>
                   <Button
                     title="Cancelar"
                     onPress={() => props.setShowConfirmationModal(false)}
                     color="#666"
                   />
                   <Button
                     title="Detener"
                     onPress={() => {
                       props.setShowConfirmationModal(false);
                       props.stopTimer();
                     }}
                     color={Colors.primary}
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
        backgroundColor: Colors.background,
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
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: Colors.primary,
      },
      modalButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 40,
      },
})