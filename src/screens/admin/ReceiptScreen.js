import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from "../../theme/Colors";

export default function ReceiptScreen({ navigation, route }) {
    const { 
        transactionId = "TXN-88291-OCT", 
        amount = "150.00", 
        paidAmount,
        date = "Oct 01, 2023", 
        method = "Credit Card", 
        studentName = "Student Name", 
        plan = "Tuition Fee",
        batchName = "",
        feeMonth = "",
        feeType = ""
    } = route.params || {};

    const displayAmount = paidAmount && parseFloat(paidAmount) > 0 ? paidAmount : amount;
    const isPartial = paidAmount && parseFloat(amount) > parseFloat(paidAmount);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="close" size={24} color={Colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transaction Receipt</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.receiptCard}>
                    <View style={styles.logoContainer}>
                        <Icon name="check-decagram" size={64} color="#10B981" />
                    </View>

                    <Text style={styles.successText}>Payment Successful</Text>
                    <Text style={styles.amountText}>₹{displayAmount}</Text>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Transaction ID</Text>
                        <Text style={styles.value}>{transactionId}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date</Text>
                        <Text style={styles.value}>{date}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Payment Method</Text>
                        <Text style={styles.value}>{method}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Student</Text>
                        <Text style={styles.value}>{studentName}</Text>
                    </View>

                    {batchName ? (
                        <View style={styles.row}>
                            <Text style={styles.label}>Class / Batch</Text>
                            <Text style={styles.value}>{batchName}</Text>
                        </View>
                    ) : null}

                    {feeType ? (
                        <View style={styles.row}>
                            <Text style={styles.label}>Fee Type</Text>
                            <Text style={styles.value}>{feeType}</Text>
                        </View>
                    ) : null}

                    {feeMonth && feeMonth !== 'N/A' ? (
                        <View style={styles.row}>
                            <Text style={styles.label}>Month</Text>
                            <Text style={styles.value}>{feeMonth}</Text>
                        </View>
                    ) : null}

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Description</Text>
                        <Text style={styles.value}>{plan}</Text>
                    </View>

                    {isPartial ? (
                        <View style={styles.row}>
                            <Text style={styles.label}>Total Plan Fee</Text>
                            <Text style={styles.value}>₹{amount}</Text>
                        </View>
                    ) : null}

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Paid</Text>
                        <Text style={styles.totalValue}>₹{displayAmount}</Text>
                    </View>
                    
                    {isPartial ? (
                        <View style={[styles.row, {marginTop: 10}]}>
                            <Text style={[styles.label, {color: '#E11D48', fontWeight: 'bold'}]}>Pending Balance</Text>
                            <Text style={[styles.value, {color: '#E11D48'}]}>₹{parseFloat(amount) - parseFloat(paidAmount)}</Text>
                        </View>
                    ) : null}
                </View>

                <TouchableOpacity style={styles.downloadBtn} onPress={() => alert("Downloading PDF...")}>
                    <Icon name="download-outline" size={20} color={Colors.WHITE} style={{ marginRight: 8 }} />
                    <Text style={styles.btnText}>Download Receipt</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareBtn} onPress={() => alert("Opening share dialog...")}>
                    <Icon name="share-variant-outline" size={20} color={Colors.TEXT_PRIMARY} style={{ marginRight: 8 }} />
                    <Text style={styles.shareText}>Share Receipt</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.BG_CONTENT },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F1F5F9",
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.PRIMARY_DARK },
    content: { padding: 20 },
    receiptCard: {
        backgroundColor: Colors.WHITE,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#ECFDF5",
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    successText: { fontSize: 18, fontWeight: 'bold', color: "#10B981", marginBottom: 8 },
    amountText: { fontSize: 36, fontWeight: 'bold', color: Colors.PRIMARY_DARK, marginBottom: 24 },
    divider: { width: '100%', height: 1, backgroundColor: "#F1F5F9", marginVertical: 16 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    label: { fontSize: 14, color: Colors.TEXT_SECONDARY, fontWeight: "500" },
    value: { fontSize: 14, color: Colors.TEXT_PRIMARY, fontWeight: "bold", textAlign: 'right' },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: Colors.PRIMARY_DARK },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: Colors.PRIMARY_DARK },

    downloadBtn: {
        backgroundColor: Colors.TEXT_PRIMARY,
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    btnText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 16 },
    shareBtn: {
        backgroundColor: Colors.WHITE,
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.BORDER,
    },
    shareText: { color: Colors.TEXT_PRIMARY, fontWeight: 'bold', fontSize: 16 },
});
