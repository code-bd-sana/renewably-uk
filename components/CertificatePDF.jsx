import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { BLUEDROP_BASE64, PEX_BASE64 } from "@/utils/imageBase64";

const styles = StyleSheet.create({
  page: {
    padding: 25, // Reduced from 30
    fontFamily: "Helvetica",
  },
  // Header styles
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "medium",
  },
  headerLogo: {
    width: 80,
    height: 22,
  },
  // Main title section
  mainTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 11,
  },
  titleTextContainer: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 16,
    color: "#0F47A8",
    fontWeight: "bold",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 10,
    color: "#0F47A8",
    fontWeight: "semibold",
  },
  pexLogo: {
    width: 35,
    height: 38,
  },
  // Policy info box
  policyBox: {
    backgroundColor: "#f0f7ff",
    padding: 12,
    borderRadius: 6,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  policyBoxTitle: {
    fontSize: 12,
    color: "#0F47A8",
    fontWeight: "semibold",
    marginBottom: 6,
  },
  policyText: {
    fontSize: 8,
    color: "#374151",
    fontWeight: "medium",
    marginBottom: 3,
  },
  policyNumber: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 3,
  },
  policySmallText: {
    fontSize: 6,
    color: "#6b7280",
    marginTop: 3,
  },
  // Two column section
  twoColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 11,
    gap: 12,
  },
  column: {
    width: "48%",
  },
  infoCard: {
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 12,
    color: "#0F47A8",
    fontWeight: "bold",
    marginBottom: 11,
  },
  companyName: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "semibold",
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: "row",
    marginTop: 3,
  },
  addressText: {
    fontSize: 10,
    color: "#4b5563",
    lineHeight: 1.3,
  },
  // Policyholder details
  policyholderSection: {
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 6,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  policyholderTitle: {
    fontSize: 12,
    color: "#0F47A8",
    fontWeight: "bold",
    marginBottom: 9,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 11,
  },
  detailColumn: {
    width: "48%",
  },
  detailLabel: {
    fontSize: 9,
    color: "#374151",
    fontWeight: "semibold",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.3,
  },
  premiumAmount: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "bold",
    marginBottom: 2,
  },
  // Scheme information
  schemeSection: {
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  schemeTitle: {
    fontSize: 12,
    color: "#0F47A8",
    fontWeight: "semibold",
    marginBottom: 12,
  },
  schemeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  schemeItem: {
    width: "48%",
    marginBottom: 8,
  },
  schemeLabel: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "semibold",
    marginBottom: 2,
  },
  schemeValue: {
    fontSize: 10,
    color: "#4b5563",
  },
  // Information box
  infoBox: {
    backgroundColor: "#FFFBEF",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  infoText: {
    fontSize: 8,
    color: "#4b5563",
    lineHeight: 1.4,
    marginBottom: 5,
  },
  infoLink: {
    fontSize: 8,
    color: "#0F47A8",
    marginBottom: 5,
  },
  // Insurer section
  insurerSection: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    paddingTop: 12,
    marginBottom: 16,
  },
  insurerTitle: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "semibold",
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 7,
    gap: 25,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contactLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 1,
  },
  contactValue: {
    fontSize: 8,
    color: "#374151",
  },
  verifiedBadge: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "medium",
    textAlign: "center",
    alignSelf: "center",
  },
  // Footer
  footer: {
    backgroundColor: "#0F47A8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 6,
    marginTop: 2,
  },
  footerText: {
    fontSize: 7,
    color: "white",
    lineHeight: 1.2,
  },
});

const CertificatePDF = ({ certificate, contractor }) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Certificate Template</Text>
          <Image
            src={BLUEDROP_BASE64}
            style={styles.headerLogo}
            alt='Bluedrop Logo'
          />
        </View>

        {/* Main Title */}
        <View style={styles.mainTitleContainer}>
          <View style={styles.titleTextContainer}>
            <Text style={styles.mainTitle}>Insurance Backed Guarantee</Text>
            <Text style={styles.subtitle}>
              Certificate & Schedule of Insurance
            </Text>
          </View>
          <Image src={PEX_BASE64} style={styles.pexLogo} alt='Pex Logo' />
        </View>

        {/* Policy Info Box */}
        <View style={styles.policyBox}>
          <Text style={styles.policyBoxTitle}>Cover Option</Text>
          <Text style={styles.policyText}>Insurance Backed Guarantee</Text>
          <Text style={styles.policyNumber}>
            Policy Number:{" "}
            <Text style={{ fontWeight: "bold" }}>
              BDIGWE
              {certificate.policyNo || certificate.policyNumber || "000000"}
            </Text>
          </Text>
          <Text style={styles.policySmallText}>
            Please refer to your policy wording for full details
          </Text>
        </View>

        {/* Two Column Section */}
        <View style={styles.twoColumns}>
          {/* Agent/Broker */}
          <View style={styles.column}>
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Agent/Broker</Text>
              <Image
                src={BLUEDROP_BASE64}
                style={{ width: 65, height: 12, marginBottom: 3 }}
                alt='Bluedrop Logo'
              />
              <View style={styles.addressContainer}>
                <Text style={styles.addressText}>
                  The Mill Suite, Hardmans Business Centre
                </Text>
              </View>
            </View>
          </View>

          {/* Installation Contractor */}
          <View style={styles.column}>
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Installation Contractor</Text>
              <Text style={styles.companyName}>
                {contractor?.companyName ||
                  certificate.rawData?.insurance?.contractorName ||
                  "North West Energy Grants Ltd"}
              </Text>
              <View style={styles.addressContainer}>
                <Text style={styles.addressText}>
                  {contractor?.address ||
                    certificate.rawData?.insurance?.contractorAddress ||
                    "2464 Royal Ln. Mesa, New Jersey 45463"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Policyholder Details - Made more compact */}
        <View style={styles.policyholderSection}>
          <Text style={styles.policyholderTitle}>
            Insured / Policyholder Details
          </Text>

          {/* Name & Inception Date - Single line if possible */}
          <View style={styles.detailRow}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>
                {certificate.holderName ||
                  certificate.policyHolderName ||
                  "Mr Leslie Corcoran"}
              </Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Inception Date</Text>
              <Text style={styles.detailValue}>
                {certificate.inceptionDate ||
                  formatDate(certificate.createdAt) ||
                  "05/09/2025"}
              </Text>
            </View>
          </View>

          {/* Address & Expiry Date */}
          <View style={styles.detailRow}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={[styles.detailValue, { maxLines: 2 }]}>
                {certificate.address ||
                  certificate.policyHolderAddress ||
                  certificate.rawData?.insurance?.address ||
                  "Shadyview Gn, Richardson, California 62639"}
              </Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Expiry Date</Text>
              <Text style={styles.detailValue}>
                {certificate.expiryDate || "05/09/2027"}
              </Text>
            </View>
          </View>

          {/* Installation Type & Premium */}
          <View style={styles.detailRow}>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Type of Installation</Text>
              <Text style={styles.detailValue}>
                {certificate.productType || "Gas-Fired Condensing Boiler"}
              </Text>
            </View>
            <View style={styles.detailColumn}>
              <Text style={styles.detailLabel}>Premium</Text>
              <Text style={styles.premiumAmount}>
                {certificate.price || "£19.04"}
              </Text>
              <Text style={styles.policySmallText}>
                Including Fire policy Premium Tax
              </Text>
            </View>
          </View>
        </View>

        {/* Scheme Information */}
        <View style={styles.schemeSection}>
          <Text style={styles.schemeTitle}>Scheme Information</Text>
          <View style={styles.schemeGrid}>
            <View style={styles.schemeItem}>
              <Text style={styles.schemeLabel}>Retrofit Assessor</Text>
              <Text style={styles.schemeValue}>
                {certificate.retrofitAssessor ||
                  certificate.rawData?.insurance?.retrofitAssessor ||
                  "Savannah Nguyen"}
              </Text>
            </View>
            <View style={styles.schemeItem}>
              <Text style={styles.schemeLabel}>Retrofit Coordinator</Text>
              <Text style={styles.schemeValue}>
                {certificate.retrofitCoordinator ||
                  certificate.rawData?.insurance?.retrofitCoordinator ||
                  "Cameron Williamson"}
              </Text>
            </View>
            <View style={styles.schemeItem}>
              <Text style={styles.schemeLabel}>Funding Partner</Text>
              <Text style={styles.schemeValue}>
                {certificate.fundingPartner ||
                  certificate.rawData?.insurance?.fundingPartner ||
                  "Bessie Cooper"}
              </Text>
            </View>
            <View style={styles.schemeItem}>
              <Text style={styles.schemeLabel}>Scheme Provider</Text>
              <Text style={styles.schemeValue}>
                {certificate.schemeProvider ||
                  certificate.rawData?.insurance?.schemeProvider ||
                  "Ronald Richards"}
              </Text>
            </View>
          </View>
        </View>

        {/* Information Box - Reduced height */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            This document includes information provided to us. It shows you who
            is insured, the period of insurance, the level of cover, and the
            premium paid. This policy is made up of this document, the IBG and
            the Policy Wording documents. These documents can be found:
          </Text>
          <Text style={styles.infoLink}>
            www.bluedropservices.co.uk/Insurance-Backed-Guarantee
          </Text>
          <Text style={styles.infoText}>
            Should the property be sold please pass this document to your
            solicitor for transfer to the new owner.
          </Text>
        </View>

        {/* Insurer Section - More compact */}
        <View style={styles.insurerSection}>
          <Text style={styles.insurerTitle}>
            Insurer – Financial & Legal Insurance Company Ltd
          </Text>

          <View style={styles.contactRow}>
            <View style={styles.contactItem}>
              <View>
                <Text style={styles.contactLabel}>Claims Line</Text>
                <Text style={styles.contactValue}>01760 658687</Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <View>
                <Text style={styles.contactLabel}>Claims Email</Text>
                <Text style={styles.contactValue}>
                  claims@bluedropservices.co.uk
                </Text>
              </View>
            </View>
          </View>

          <View style={{ alignItems: "center", marginTop: 8 }}>
            <Text style={styles.verifiedBadge}>
              Verified & Authenticated Certificate
            </Text>
          </View>
        </View>

        {/* Footer - Reduced height */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Bluedrop Services Limited. All rights reserved.
          </Text>
          <Text style={styles.footerText}>
            Certificate ID: BDIGWE{certificate?.policyNumber || "000000"} |
            Issue Date: {formatDate(certificate.createdAt) || "16/12/2025"}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default CertificatePDF;
