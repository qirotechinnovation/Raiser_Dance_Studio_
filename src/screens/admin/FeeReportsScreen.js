import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import Share from "react-native-share";
import adminService from "../../api/adminService";
import Colors from "../../theme/Colors";
import BaseScreen from "../../components/BaseScreen";
import { Picker } from "@react-native-picker/picker";

const MONTHS = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];

export default function FeeReportsScreen({ navigation }) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentMonth]);
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    
    const [stats, setStats] = useState({ collected: 0, outstanding: 0 });
    const [pendingList, setPendingList] = useState([]);
    
    useEffect(() => {
        fetchReportData();
    }, [selectedMonth, selectedYear]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const allRes = await adminService.getAllFees().catch(() => ({ data: [] }));
            const allFees = Array.isArray(allRes?.data) ? allRes.data : [];

            const monthIndex = MONTHS.indexOf(selectedMonth);

            let collected = 0;
            let outstanding = 0;
            const pendingArr = [];

            allFees.forEach(fee => {
                const isPaid = fee.status?.toUpperCase() === 'PAID';
                
                if (isPaid && fee.paidDate) {
                    const d = new Date(fee.paidDate);
                    if (d.getMonth() === monthIndex && d.getFullYear() === parseInt(selectedYear)) {
                        collected += (fee.amount || 0);
                    }
                } else if (!isPaid) {
                    // It's pending. Check if it's due in this month or earlier, or if feeMonth matches.
                    // For simplicity, let's include if it was due in this selected month.
                    if (fee.dueDate) {
                        const d = new Date(fee.dueDate);
                        if (d.getMonth() === monthIndex && d.getFullYear() === parseInt(selectedYear)) {
                            const balance = (fee.amount || 0) - (fee.paidAmount || 0);
                            outstanding += balance;
                            pendingArr.push({ ...fee, balance });
                        }
                    } else if (fee.feeMonth && fee.feeMonth.includes(selectedMonth) && fee.feeMonth.includes(selectedYear)) {
                        const balance = (fee.amount || 0) - (fee.paidAmount || 0);
                        outstanding += balance;
                        pendingArr.push({ ...fee, balance });
                    }
                }
            });

            setStats({ collected, outstanding });
            setPendingList(pendingArr);

        } catch (error) {
            console.error("Error fetching report data", error);
            Alert.alert("Error", "Could not load report data");
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async () => {
        if (pendingList.length === 0 && stats.collected === 0 && stats.outstanding === 0) {
            Alert.alert("No Data", "There is no data to generate a report for this month.");
            return;
        }

        setGenerating(true);
        try {
            let tableRows = pendingList.map((item, index) => {
                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.student?.name || 'Unknown'}</td>
                        <td>${item.student?.batch?.name || item.plan || 'N/A'}</td>
                        <td>₹${item.amount}</td>
                        <td>₹${item.paidAmount || 0}</td>
                        <td style="color: red; font-weight: bold;">₹${item.balance}</td>
                    </tr>
                `;
            }).join('');

            const htmlContent = `
                <html>
                    <head>
                        <style>
                            body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
                            h1 { color: #E11D48; text-align: center; margin-bottom: 5px; }
                            h3 { text-align: center; color: #555; margin-top: 0; }
                            .summary-container { display: flex; justify-content: space-between; margin-top: 30px; margin-bottom: 30px; }
                            .summary-box { background: #f8fafc; padding: 15px 25px; border-radius: 10px; border: 1px solid #e2e8f0; text-align: center; flex: 1; margin: 0 10px; }
                            .summary-title { font-size: 14px; color: #64748b; font-weight: bold; text-transform: uppercase; }
                            .summary-value { font-size: 24px; font-weight: bold; margin-top: 10px; }
                            .collected { color: #10B981; }
                            .pending { color: #F59E0B; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                            th { background-color: #E11D48; color: white; }
                            tr:nth-child(even) { background-color: #f2f2f2; }
                            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
                        </style>
                    </head>
                    <body>
                        <h1>Raiser's Dance Studio</h1>
                        <h3>Monthly Fee Report - ${selectedMonth} ${selectedYear}</h3>
                        
                        <div class="summary-container">
                            <div class="summary-box">
                                <div class="summary-title">Total Collected</div>
                                <div class="summary-value collected">₹${stats.collected.toLocaleString('en-IN')}</div>
                            </div>
                            <div class="summary-box">
                                <div class="summary-title">Total Outstanding</div>
                                <div class="summary-value pending">₹${stats.outstanding.toLocaleString('en-IN')}</div>
                            </div>
                        </div>

                        <h2 style="margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Pending Fees Details</h2>
                        
                        ${pendingList.length > 0 ? `
                        <table>
                            <tr>
                                <th>#</th>
                                <th>Student Name</th>
                                <th>Batch / Plan</th>
                                <th>Total Fee</th>
                                <th>Paid So Far</th>
                                <th>Balance Due</th>
                            </tr>
                            ${tableRows}
                        </table>
                        ` : '<p style="text-align: center; font-style: italic; color: #666;">No pending fees for this month.</p>'}

                        <div class="footer">
                            Generated on ${new Date().toLocaleString()}<br>
                            Raiser's Dance Studio Management System
                        </div>
                    </body>
                </html>
            `;

            const options = {
                html: htmlContent,
                fileName: `Fee_Report_${selectedMonth}_${selectedYear}`,
                directory: 'Documents',
            };

            const file = await RNHTMLtoPDF.convert(options);
            
            // Share the generated PDF
            const shareOptions = {
                title: 'Share Fee Report',
                url: `file://${file.filePath}`,
                type: 'application/pdf'
            };
            
            await Share.open(shareOptions);

        } catch (error) {
            console.error("PDF Generation Error: ", error);
            Alert.alert("Error", "Could not generate or share PDF report.");
        } finally {
            setGenerating(false);
        }
    };

    const renderSummaryCard = (title, amount, isPositive) => (
        <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{title}</Text>
            <Text style={[styles.summaryAmount, { color: isPositive ? "#10B981" : "#F59E0B" }]}>
                ₹{Number(amount).toLocaleString()}
            </Text>
        </View>
    );

    const renderPendingItem = ({ item }) => (
        <View style={styles.recordCard}>
            <View style={styles.recordMainInfo}>
                <Text style={styles.studentName}>{item.student?.name || 'Unknown'}</Text>
                <Text style={styles.planSubtitle}>
                    {item.plan} {item.student?.batch?.name ? ` • ${item.student.batch.name}` : ''}
                </Text>
            </View>
            <View style={styles.priceContainer}>
                <Text style={styles.balancePrice}>₹{item.balance}</Text>
                <Text style={styles.totalPrice}>out of ₹{item.amount}</Text>
            </View>
        </View>
    );

    return (
        <BaseScreen title="Fee Reports" showBack={true} onBack={() => navigation.goBack()}>
            <View style={styles.filterContainer}>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={selectedMonth}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                    >
                        {MONTHS.map(m => <Picker.Item key={m} label={m} value={m} />)}
                    </Picker>
                </View>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={selectedYear}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedYear(itemValue)}
                    >
                        {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                            <Picker.Item key={y} label={y.toString()} value={y.toString()} />
                        ))}
                    </Picker>
                </View>
            </View>

            <View style={styles.summaryRow}>
                {renderSummaryCard("Total Collected", stats.collected, true)}
                {renderSummaryCard("Total Outstanding", stats.outstanding, false)}
            </View>

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Pending Dues ({pendingList.length})</Text>
                <TouchableOpacity 
                    style={[styles.pdfBtn, generating && { opacity: 0.7 }]} 
                    onPress={generatePDF}
                    disabled={generating || loading}
                >
                    {generating ? (
                        <ActivityIndicator size="small" color={Colors.WHITE} />
                    ) : (
                        <>
                            <Icon name="file-pdf-box" size={18} color={Colors.WHITE} style={{ marginRight: 5 }} />
                            <Text style={styles.pdfBtnText}>Export PDF</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={pendingList}
                        renderItem={renderPendingItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 50 }}
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', marginTop: 20, color: Colors.TEXT_MUTED }}>
                                No pending fees for this month.
                            </Text>
                        }
                    />
                )}
            </View>
        </BaseScreen>
    );
}

const styles = StyleSheet.create({
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 10,
        gap: 15
    },
    pickerWrapper: {
        flex: 1,
        backgroundColor: Colors.WHITE,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: Colors.BORDER,
        overflow: 'hidden',
        height: 50,
        justifyContent: 'center'
    },
    picker: {
        width: '100%',
        height: '100%'
    },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 20 },
    summaryCard: {
        width: "47%",
        backgroundColor: Colors.WHITE,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "#FCE7F3",
        elevation: 2,
        shadowColor: Colors.PRIMARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        alignItems: 'center'
    },
    summaryTitle: { fontSize: 13, color: Colors.TEXT_SECONDARY, fontWeight: "600", marginBottom: 8 },
    summaryAmount: { fontSize: 22, fontWeight: "bold" },
    
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 30,
        marginBottom: 10
    },
    listTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.TEXT_DARK },
    pdfBtn: {
        flexDirection: 'row',
        backgroundColor: Colors.PRIMARY,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        alignItems: 'center'
    },
    pdfBtnText: { color: Colors.WHITE, fontWeight: 'bold', fontSize: 13 },

    listContainer: { flex: 1, paddingHorizontal: 20 },
    recordCard: {
        backgroundColor: Colors.WHITE,
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.BORDER
    },
    recordMainInfo: { flex: 1 },
    studentName: { fontSize: 15, fontWeight: "bold", color: "#000" },
    planSubtitle: { fontSize: 12, color: Colors.TEXT_SECONDARY, marginTop: 4 },
    priceContainer: { alignItems: "flex-end" },
    balancePrice: { fontSize: 16, fontWeight: "bold", color: "#E11D48" },
    totalPrice: { fontSize: 11, color: Colors.TEXT_MUTED, marginTop: 2 }
});
