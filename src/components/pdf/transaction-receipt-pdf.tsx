import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E7',
    paddingBottom: 20,
    marginBottom: 30,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#18181B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#71717A',
  },
  label: {
    fontSize: 8,
    color: '#A1A1AA',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 11,
    color: '#18181B',
    marginBottom: 12,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  amountLabel: {
    fontSize: 9,
    color: '#A1A1AA',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: 900,
    color: '#18181B',
  },
  statusBadge: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
  },
  statusText: {
    fontSize: 9,
    color: '#047857',
    textTransform: 'uppercase',
  },
  entitiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E4E4E7',
    paddingTop: 30,
    marginBottom: 30,
  },
  entityBox: {
    width: '45%',
  },
  entityLabel: {
    fontSize: 9,
    color: '#A1A1AA',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  entityTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#18181B',
    marginBottom: 4,
  },
  entitySub: {
    fontSize: 10,
    color: '#71717A',
  },
  entityAsset: {
    fontSize: 9,
    color: '#52525B',
    marginTop: 6,
  },
  breakdownSection: {
    borderTopWidth: 1,
    borderTopColor: '#E4E4E7',
    paddingTop: 20,
  },
  breakdownTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#A1A1AA',
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomStyle: 'dashed',
    borderBottomColor: '#E4E4E7',
    paddingVertical: 10,
  },
  rowLabel: {
    fontSize: 10,
    color: '#71717A',
  },
  rowValue: {
    fontSize: 10,
    fontWeight: 700,
    color: '#18181B',
    textTransform: 'capitalize',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#18181B',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 900,
    color: '#18181B',
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#E4E4E7',
    paddingTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#71717A',
    marginBottom: 15,
  },
  footerSecure: {
    fontSize: 7,
    color: '#A1A1AA',
    textTransform: 'uppercase',
  }
});

// Assuming similar props as transaction-reciept.tsx
export default function TransactionReceiptPDF({ transaction, dateStr, formattedAmount }: any) {
  const isSuccess = transaction.status === "Success" || transaction.status === "success";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* React PDF Image requires absolute URL or static import in some envs. We'll skip the local image for safety or use a placeholder text if image fails, but lets try to just render text for logo to avoid build issues. */}
            <Text style={styles.title}>WunkatHomes Ltd.</Text>
            <Text style={styles.subtitle}>Official Payment Receipt</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.label}>Date Issued</Text>
            <Text style={styles.value}>{dateStr}</Text>
            <Text style={styles.label}>Transaction Ref</Text>
            <Text style={[styles.value, { color: '#52525B', fontSize: 9 }]}>{transaction.reference}</Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Total Amount Paid</Text>
          <Text style={styles.amount}>{formattedAmount}</Text>
          <View style={[styles.statusBadge, !isSuccess && { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.statusText, !isSuccess && { color: '#B91C1C' }]}>{transaction.status}</Text>
          </View>
        </View>

        {/* Entities */}
        <View style={styles.entitiesGrid}>
          <View style={styles.entityBox}>
            <Text style={styles.entityLabel}>Billed To</Text>
            <Text style={styles.entityTitle}>{transaction?.user?.name || "N/A"}</Text>
            <Text style={styles.entitySub}>{transaction?.user?.email || "N/A"}</Text>
          </View>
          <View style={styles.entityBox}>
            <Text style={styles.entityLabel}>Property / Asset</Text>
            <Text style={styles.entityTitle}>{transaction?.listing?.title || "N/A"}</Text>
            <Text style={styles.entitySub}>{transaction?.listing?.property?.location || "N/A"}</Text>
            <Text style={styles.entityAsset}>Asset Type: {transaction?.listing?.property?.propertyType?.replace(/_/g, " ") || "N/A"}</Text>
          </View>
        </View>

        {/* Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>Payment Breakdown</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Payment Method</Text>
            <Text style={styles.rowValue}>{transaction?.channel?.replace(/_/g, " ") || 'Secure Gateway'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Payment Purpose</Text>
            <Text style={styles.rowValue}>{transaction?.paymentPurpose?.replace(/_/g, " ") || 'Rent'}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formattedAmount}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>If you have any questions regarding this official receipt, please contact support at support@wunkathomes.com.</Text>
          <View style={{ borderTopWidth: 1, borderTopColor: '#E4E4E7', paddingTop: 10, width: '100%', alignItems: 'center' }}>
            <Text style={styles.footerSecure}>Generated Securely by WunkatHomes</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
