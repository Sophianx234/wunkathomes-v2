import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 60,
    fontFamily: 'Helvetica',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E7',
    paddingBottom: 10,
    color: '#18181B',
  },
  body: {
    fontSize: 11,
    lineHeight: 1.8,
    color: '#18181B',
  },
  paragraph: {
    marginBottom: 15,
  },
  bold: {
    fontWeight: 700,
  },
  signatures: {
    marginTop: 60,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#E4E4E7',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sigCol: {
    width: '45%',
  },
  sigTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#A1A1AA',
    letterSpacing: 1,
    marginBottom: 20,
  },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#D4D4D8',
    paddingBottom: 8,
  },
  sigName: {
    fontSize: 12,
    fontWeight: 700,
  },
  sigMeta: {
    fontSize: 9,
    color: '#A1A1AA',
    marginTop: 10,
    lineHeight: 1.5,
  },
});

export default function TenancyDocumentPDF({ selectedActivation }: any) {
  const formatDate = (date: string | Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Standard Tenancy Agreement</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.paragraph}>
            This Tenancy Agreement is formally established between <Text style={styles.bold}>WunkatHomes Ltd.</Text> (referred to as the "Landlord") and <Text style={styles.bold}>{selectedActivation?.user?.name || "Tenant"}</Text> (referred to as the "Tenant").
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>1. The Property:</Text> The Landlord agrees to rent, and the Tenant agrees to occupy the property known as <Text style={styles.bold}>{selectedActivation?.lease?.propertyName || "Property"}</Text> located at <Text style={styles.bold}>{selectedActivation?.lease?.propertyLocation || `Unit ${selectedActivation?.lease?.unitNumber || "N/A"}`}</Text>.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>2. Lease Duration:</Text> This agreement begins on <Text style={styles.bold}>{formatDate(selectedActivation?.lease?.startDate)}</Text> and will remain active until <Text style={styles.bold}>{selectedActivation?.lease?.endDate ? formatDate(selectedActivation?.lease?.endDate) : "the end of the agreed term"}</Text>, unless ended earlier under the terms of this agreement.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>3. Rent & Payment:</Text> The total rent payment of <Text style={styles.bold}>GHS {selectedActivation?.lease?.totalRentAmount ? selectedActivation.lease.totalRentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}</Text> has been successfully processed and verified.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>4. Smart Lock & Property Access:</Text> Access to the property is managed securely via a Tuya Smart Lock system. The Tenant agrees to keep their personal access PIN confidential and not share it with unauthorized individuals.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>5. Tenant Responsibilities:</Text> The Tenant agrees to maintain the interior of the property in good condition, use the property only for residential living, and allow the Landlord or maintenance teams to enter for repairs with fair prior notice.
          </Text>
        </View>

        <View style={styles.signatures}>
          <View style={styles.sigCol}>
            <Text style={styles.sigTitle}>Landlord Signature</Text>
            <View style={styles.sigLine}>
              <Text style={styles.sigName}>WunkatHomes Ltd.</Text>
            </View>
            <Text style={styles.sigMeta}>Verified System Counter-Signature</Text>
          </View>
          
          <View style={styles.sigCol}>
            <Text style={styles.sigTitle}>Tenant E-Signature</Text>
            <View style={styles.sigLine}>
              <Text style={styles.sigName}>{selectedActivation?.lease?.signatureAudit?.typedName || selectedActivation?.user?.name || "Tenant"}</Text>
            </View>
            <Text style={styles.sigMeta}>Date: {selectedActivation?.lease?.signatureAudit?.signedAt || "Pending"}</Text>
            <Text style={styles.sigMeta}>IP Addr: {selectedActivation?.lease?.signatureAudit?.ipAddress || "N/A"}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
