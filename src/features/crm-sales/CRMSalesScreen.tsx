import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import {
  Users,
  UserPlus,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  Check,
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Tag,
  DollarSign,
  Briefcase,
  Layers,
  Send,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import {
  crmApi,
  CustomerData,
  LeadData,
  EnquiryData,
  FollowUpData,
  QuotationData,
  SalesOrderData,
} from '../../api/crm';

type CRMTab = 'customers' | 'leads' | 'enquiries' | 'followups' | 'quotations' | 'sales_orders';

export const CRMSalesScreen: React.FC<{ onBackToDashboard?: () => void }> = ({ onBackToDashboard }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CRMTab>('leads');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // CRM Datasets
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryData[]>([]);
  const [followups, setFollowups] = useState<FollowUpData[]>([]);
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrderData[]>([]);

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationData | null>(null);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrderData | null>(null);

  // Form creation modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formRemarks, setFormRemarks] = useState('');

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [custRes, leadRes, enqRes, flwRes, quoRes, soRes] = await Promise.allSettled([
        crmApi.getCustomers(),
        crmApi.getLeads(),
        crmApi.getEnquiries(),
        crmApi.getFollowUps(),
        crmApi.getQuotations(),
        crmApi.getSalesOrders(),
      ]);

      if (custRes.status === 'fulfilled') setCustomers(custRes.value);
      if (leadRes.status === 'fulfilled') setLeads(leadRes.value);
      if (enqRes.status === 'fulfilled') setEnquiries(enqRes.value);
      if (flwRes.status === 'fulfilled') setFollowups(flwRes.value);
      if (quoRes.status === 'fulfilled') setQuotations(quoRes.value);
      if (soRes.status === 'fulfilled') setSalesOrders(soRes.value);
    } catch (err) {
      console.warn('Error loading CRM records from backend:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  // Reset status filter on tab change
  const handleTabChange = (tab: CRMTab) => {
    setActiveTab(tab);
    setStatusFilter('all');
    setSearchQuery('');
  };

  // Convert Lead Action
  const handleConvertLead = async (leadId: string) => {
    Alert.alert(
      'Convert to Customer',
      'Do you want to convert this lead into a registered customer and generate a commercial opportunity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Convert Now',
          onPress: async () => {
            try {
              await crmApi.convertLeadToCustomer(leadId);
              Alert.alert('Success', 'Lead successfully converted to registered Customer!');
              loadData(true);
              setSelectedLead(null);
            } catch (err: any) {
              Alert.alert('Conversion Alert', err?.response?.data?.error || 'Failed to convert lead.');
            }
          },
        },
      ]
    );
  };

  // Quotation Approval Action
  const handleApproveQuotation = async (quotationId: string) => {
    try {
      await crmApi.approveQuotation(quotationId, user?.name || user?.username, 'Approved via Mobile App');
      Alert.alert('Quotation Approved', `Quotation ${quotationId} has been successfully approved.`);
      loadData(true);
      setSelectedQuotation(null);
    } catch (err: any) {
      Alert.alert('Approval Error', err?.response?.data?.error || err?.message || 'Authorization failed.');
    }
  };

  // Quotation Rejection Action
  const handleRejectQuotation = async (quotationId: string) => {
    Alert.prompt
      ? Alert.prompt('Reject Quotation', 'Please enter reason for rejection:', async (reason) => {
          if (!reason) return;
          try {
            await crmApi.rejectQuotation(quotationId, reason);
            Alert.alert('Quotation Rejected', `Quotation ${quotationId} rejected.`);
            loadData(true);
            setSelectedQuotation(null);
          } catch (err: any) {
            Alert.alert('Rejection Error', err?.response?.data?.error || 'Rejection failed.');
          }
        })
      : Alert.alert('Reject Quotation', 'Mark quotation as rejected?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: async () => {
              try {
                await crmApi.rejectQuotation(quotationId, 'Commercial pricing adjustment required');
                Alert.alert('Quotation Rejected', `Quotation ${quotationId} rejected.`);
                loadData(true);
                setSelectedQuotation(null);
              } catch (err: any) {
                Alert.alert('Rejection Error', err?.response?.data?.error || 'Rejection failed.');
              }
            },
          },
        ]);
  };

  // Form Submit Handler
  const handleCreateSubmit = async () => {
    if (!formCompanyName.trim()) {
      Alert.alert('Validation Error', 'Company / Client Name is required.');
      return;
    }
    if (!formContactPerson.trim()) {
      Alert.alert('Validation Error', 'Contact Person is required.');
      return;
    }
    if (!formMobile.trim()) {
      Alert.alert('Validation Error', 'Mobile Number is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (activeTab === 'customers') {
        await crmApi.createCustomer({
          companyName: formCompanyName.trim(),
          contactPerson: formContactPerson.trim(),
          mobile: formMobile.trim(),
          email: formEmail.trim(),
          billingAddress: formRemarks.trim(),
        });
        Alert.alert('Success', 'Customer registered successfully in ERP.');
      } else if (activeTab === 'leads') {
        await crmApi.createLead({
          companyName: formCompanyName.trim(),
          contactPerson: formContactPerson.trim(),
          mobile: formMobile.trim(),
          email: formEmail.trim(),
          productName: formProduct.trim() || 'Process Machinery',
          remarks: formRemarks.trim(),
        });
        Alert.alert('Success', 'New lead registered successfully.');
      } else if (activeTab === 'enquiries') {
        await crmApi.createEnquiry({
          customerName: formCompanyName.trim(),
          contactPerson: formContactPerson.trim(),
          contactMobile: formMobile.trim(),
          machineProduct: formProduct.trim() || 'Custom Equipment',
          requirement: formRemarks.trim() || 'Commercial enquiry specs',
          budget: Number(formAmount) || 0,
        });
        Alert.alert('Success', 'Enquiry recorded successfully.');
      } else if (activeTab === 'followups') {
        await crmApi.createFollowUp({
          leadOrCustomerName: formCompanyName.trim(),
          leadOrCustomerId: 'REF-001',
          date: new Date().toISOString().split('T')[0],
          purpose: formProduct.trim() || 'Commercial Follow-up',
          notes: formRemarks.trim(),
        });
        Alert.alert('Success', 'Follow-up logged successfully.');
      } else if (activeTab === 'quotations') {
        await crmApi.createQuotation({
          customerName: formCompanyName.trim(),
          contactPerson: formContactPerson.trim(),
          contactMobile: formMobile.trim(),
          contactEmail: formEmail.trim(),
          machineProduct: formProduct.trim() || 'Fabrication Equipment',
          date: new Date().toISOString().split('T')[0],
          subtotal: Number(formAmount) || 250000,
        });
        Alert.alert('Success', 'Quotation drafted successfully.');
      } else if (activeTab === 'sales_orders') {
        await crmApi.createSalesOrder({
          customerName: formCompanyName.trim(),
          orderDate: new Date().toISOString().split('T')[0],
          grandTotal: Number(formAmount) || 350000,
          customerPoNumber: formRemarks.trim() || 'PO-VERIFIED',
        });
        Alert.alert('Success', 'Sales Order confirmed successfully.');
      }

      setCreateModalVisible(false);
      setFormCompanyName('');
      setFormContactPerson('');
      setFormMobile('');
      setFormEmail('');
      setFormProduct('');
      setFormAmount('');
      setFormRemarks('');
      loadData(true);
    } catch (err: any) {
      Alert.alert('Submission Error', err?.response?.data?.error || err?.message || 'Failed to save record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter chips depending on tab
  const filterChips = useMemo(() => {
    switch (activeTab) {
      case 'leads':
        return [
          { id: 'all', label: 'All Leads' },
          { id: 'new', label: 'New' },
          { id: 'contacted', label: 'Contacted' },
          { id: 'qualified', label: 'Qualified' },
          { id: 'quotation_sent', label: 'Quoted' },
          { id: 'won', label: 'Won' },
        ];
      case 'quotations':
        return [
          { id: 'all', label: 'All Quotations' },
          { id: 'draft', label: 'Draft' },
          { id: 'approved', label: 'Approved' },
          { id: 'sent', label: 'Sent' },
          { id: 'rejected', label: 'Rejected' },
        ];
      case 'sales_orders':
        return [
          { id: 'all', label: 'All Orders' },
          { id: 'confirmed', label: 'Confirmed' },
          { id: 'in_production', label: 'Production' },
          { id: 'completed', label: 'Completed' },
        ];
      default:
        return [
          { id: 'all', label: 'All' },
          { id: 'active', label: 'Active' },
          { id: 'pending', label: 'Pending' },
        ];
    }
  }, [activeTab]);

  return (
    <View style={styles.container}>
      {/* CRM KPI Ribbon */}
      <View style={styles.kpiRibbon}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiItemValue}>{customers.length}</Text>
            <Text style={styles.kpiItemLabel}>Customers</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={[styles.kpiItemValue, { color: colors.accent }]}>{leads.length}</Text>
            <Text style={styles.kpiItemLabel}>Active Leads</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={[styles.kpiItemValue, { color: colors.warning }]}>{enquiries.length}</Text>
            <Text style={styles.kpiItemLabel}>Enquiries</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={[styles.kpiItemValue, { color: colors.purple }]}>{quotations.length}</Text>
            <Text style={styles.kpiItemLabel}>Quotations</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={[styles.kpiItemValue, { color: colors.success }]}>{salesOrders.length}</Text>
            <Text style={styles.kpiItemLabel}>Sales Orders</Text>
          </View>
        </ScrollView>
      </View>

      {/* Segmented Tab Navigation */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {[
            { id: 'leads', label: 'Leads', count: leads.length },
            { id: 'customers', label: 'Customers', count: customers.length },
            { id: 'enquiries', label: 'Enquiries', count: enquiries.length },
            { id: 'followups', label: 'Follow-ups', count: followups.length },
            { id: 'quotations', label: 'Quotations', count: quotations.length },
            { id: 'sales_orders', label: 'Sales Orders', count: salesOrders.length },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => handleTabChange(tab.id as CRMTab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabButtonText, isSelected && styles.tabButtonTextActive]}>
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search & Actions Bar */}
      <View style={styles.actionRow}>
        <View style={styles.searchBox}>
          <Search size={15} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab.replace('_', ' ')}...`}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={15} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setCreateModalVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={16} color={colors.textInverse} />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Chips */}
      <View style={styles.filterChipRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipScroll}>
          {filterChips.map((chip) => {
            const isSelected = statusFilter === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setStatusFilter(chip.id)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main List Rendering */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerText}>Loading {activeTab.replace('_', ' ')} records...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          showsVerticalScrollIndicator={false}
        >
          {/* TAB 1: LEADS */}
          {activeTab === 'leads' && (
            leads.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Users size={32} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Leads Found</Text>
                <Text style={styles.emptySub}>Tap '+ New' to create an industrial inquiry lead.</Text>
              </Card>
            ) : (
              leads
                .filter((l) => {
                  const matchQ =
                    !searchQuery.trim() ||
                    (l.companyName && l.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (l.leadNo && l.leadNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (l.contactPerson && l.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));
                  const matchS = statusFilter === 'all' || l.status === statusFilter;
                  return matchQ && matchS;
                })
                .map((lead, idx) => (
                  <Card key={lead.id || idx} style={styles.recordCard}>
                    <TouchableOpacity onPress={() => setSelectedLead(lead)} activeOpacity={0.8}>
                      <View style={styles.cardHeaderRow}>
                        <View>
                          <Text style={styles.codeText}>{lead.leadNo || lead.id || `LEAD-00${idx + 1}`}</Text>
                          <Text style={styles.cardTitle}>{lead.companyName || 'Industrial Client'}</Text>
                        </View>
                        <Badge
                          label={(lead.status || 'new').toUpperCase()}
                          variant={lead.status === 'won' ? 'success' : lead.status === 'qualified' ? 'primary' : 'warning'}
                          size="sm"
                        />
                      </View>

                      <Text style={styles.productText}>
                        {lead.productName || 'Heavy Engineering Equipment'} {lead.quantity ? `• Qty: ${lead.quantity}` : ''}
                      </Text>

                      <View style={styles.contactRow}>
                        <Users size={12} color={colors.textMuted} />
                        <Text style={styles.contactText}>{lead.contactPerson || 'Contact'}</Text>
                        <Text style={styles.contactDot}>•</Text>
                        <Phone size={12} color={colors.textMuted} />
                        <Text style={styles.contactText}>{lead.mobile || '—'}</Text>
                      </View>

                      <View style={styles.cardFooterRow}>
                        <Badge
                          label={`Priority: ${(lead.priority || 'medium').toUpperCase()}`}
                          variant={lead.priority === 'urgent' ? 'danger' : 'neutral'}
                          size="sm"
                        />
                        <View style={styles.rowRight}>
                          <TouchableOpacity
                            style={styles.convertBtn}
                            onPress={() => handleConvertLead(lead.id || lead.leadNo || '')}
                          >
                            <Sparkles size={12} color={colors.bronze} />
                            <Text style={styles.convertBtnText}>Convert to Customer</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Card>
                ))
            )
          )}

          {/* TAB 2: CUSTOMERS */}
          {activeTab === 'customers' && (
            customers.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Building size={32} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Customers Registered</Text>
                <Text style={styles.emptySub}>Convert a lead or add a direct client account.</Text>
              </Card>
            ) : (
              customers
                .filter((c) => {
                  const matchQ =
                    !searchQuery.trim() ||
                    (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (c.customerCode && c.customerCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()));
                  const matchS = statusFilter === 'all' || (c.status || 'active') === statusFilter;
                  return matchQ && matchS;
                })
                .map((cust, idx) => (
                  <Card key={cust.id || idx} style={styles.recordCard}>
                    <TouchableOpacity onPress={() => setSelectedCustomer(cust)} activeOpacity={0.8}>
                      <View style={styles.cardHeaderRow}>
                        <View>
                          <Text style={styles.codeText}>{cust.customerCode || cust.id || `CUST-00${idx + 1}`}</Text>
                          <Text style={styles.cardTitle}>{cust.companyName}</Text>
                        </View>
                        <Badge label={(cust.category || 'standard').toUpperCase()} variant="primary" size="sm" />
                      </View>

                      <View style={styles.contactRow}>
                        <Users size={12} color={colors.textMuted} />
                        <Text style={styles.contactText}>{cust.contactPerson}</Text>
                        <Text style={styles.contactDot}>•</Text>
                        <MapPin size={12} color={colors.textMuted} />
                        <Text style={styles.contactText}>{cust.city || 'Vadodara'}{cust.state ? `, ${cust.state}` : ''}</Text>
                      </View>

                      <View style={styles.cardFooterRow}>
                        <Text style={styles.metaLabel}>GSTIN: {cust.gstin || 'Unregistered'}</Text>
                        <Text style={styles.metaLabel}>{cust.paymentTerms || 'Standard Terms'}</Text>
                      </View>
                    </TouchableOpacity>
                  </Card>
                ))
            )
          )}

          {/* TAB 3: ENQUIRIES */}
          {activeTab === 'enquiries' && (
            enquiries.length === 0 ? (
              <Card style={styles.emptyCard}>
                <FileText size={32} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Enquiries Logged</Text>
              </Card>
            ) : (
              enquiries
                .filter((e) => !searchQuery.trim() || (e.customerName && e.customerName.toLowerCase().includes(searchQuery.toLowerCase())))
                .map((enq, idx) => (
                  <Card key={enq.id || idx} style={styles.recordCard}>
                    <View style={styles.cardHeaderRow}>
                      <View>
                        <Text style={styles.codeText}>{enq.enquiryNo || enq.id}</Text>
                        <Text style={styles.cardTitle}>{enq.customerName}</Text>
                      </View>
                      <Badge label={(enq.status || 'new').toUpperCase()} variant="warning" size="sm" />
                    </View>
                    <Text style={styles.productText}>{enq.machineProduct} {enq.quantity ? `(${enq.quantity} Units)` : ''}</Text>
                    {enq.requirement ? <Text style={styles.subDetailText} numberOfLines={2}>{enq.requirement}</Text> : null}
                  </Card>
                ))
            )
          )}

          {/* TAB 4: FOLLOW-UPS */}
          {activeTab === 'followups' && (
            followups.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Clock size={32} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Follow-ups Scheduled</Text>
              </Card>
            ) : (
              followups.map((flw, idx) => (
                <Card key={flw.id || idx} style={styles.recordCard}>
                  <View style={styles.cardHeaderRow}>
                    <View>
                      <Text style={styles.codeText}>{flw.followUpNo || `FLW-00${idx + 1}`}</Text>
                      <Text style={styles.cardTitle}>{flw.leadOrCustomerName}</Text>
                    </View>
                    <Badge label={(flw.status || 'pending').toUpperCase()} variant={flw.status === 'completed' ? 'success' : 'warning'} size="sm" />
                  </View>
                  <View style={styles.contactRow}>
                    <Calendar size={12} color={colors.textMuted} />
                    <Text style={styles.contactText}>Date: {flw.date}</Text>
                    <Text style={styles.contactDot}>•</Text>
                    <Text style={styles.contactText}>Type: {(flw.type || 'call').toUpperCase()}</Text>
                  </View>
                  {flw.purpose ? <Text style={styles.subDetailText}>{flw.purpose}</Text> : null}
                </Card>
              ))
            )
          )}

          {/* TAB 5: QUOTATIONS */}
          {activeTab === 'quotations' && (
            quotations.length === 0 ? (
              <Card style={styles.emptyCard}>
                <FileText size={32} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Quotations Prepared</Text>
              </Card>
            ) : (
              quotations
                .filter((q) => {
                  const matchQ = !searchQuery.trim() || (q.customerName && q.customerName.toLowerCase().includes(searchQuery.toLowerCase())) || (q.quotationNumber && q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()));
                  const matchS = statusFilter === 'all' || (q.status || 'draft') === statusFilter;
                  return matchQ && matchS;
                })
                .map((quo, idx) => {
                  const statusVal = quo.status || 'draft';
                  const isApproved = statusVal === 'approved';
                  return (
                    <Card key={quo.id || idx} style={styles.recordCard}>
                      <TouchableOpacity onPress={() => setSelectedQuotation(quo)} activeOpacity={0.8}>
                        <View style={styles.cardHeaderRow}>
                          <View>
                            <Text style={styles.codeText}>{quo.quotationNumber || quo.id} ({quo.currentRevision || 'Rev-00'})</Text>
                            <Text style={styles.cardTitle}>{quo.customerName}</Text>
                          </View>
                          <Badge
                            label={statusVal.toUpperCase()}
                            variant={isApproved ? 'success' : statusVal === 'rejected' ? 'danger' : statusVal === 'sent' ? 'primary' : 'warning'}
                            size="sm"
                          />
                        </View>

                        <Text style={styles.productText}>{quo.machineProduct || 'Process Machinery Scope'}</Text>

                        <View style={styles.cardFooterRow}>
                          <Text style={styles.amountText}>
                            ₹ {(quo.grandTotal || quo.grand_total || quo.subtotal || 245000).toLocaleString('en-IN')}
                          </Text>
                          <View style={styles.actionBtnRow}>
                            {!isApproved && (
                              <TouchableOpacity
                                style={styles.approveBtn}
                                onPress={() => handleApproveQuotation(quo.id || quo.quotationNumber || '')}
                              >
                                <Check size={12} color={colors.textInverse} />
                                <Text style={styles.approveBtnText}>Approve</Text>
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              style={styles.viewDetailBtn}
                              onPress={() => setSelectedQuotation(quo)}
                            >
                              <Text style={styles.viewDetailText}>Details</Text>
                              <ChevronRight size={13} color={colors.primary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Card>
                  );
                })
            )
          )}

          {/* TAB 6: SALES ORDERS */}
          {activeTab === 'sales_orders' && (
            salesOrders.length === 0 ? (
              <Card style={styles.emptyCard}>
                <TrendingUp size={32} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Sales Orders Recorded</Text>
              </Card>
            ) : (
              salesOrders
                .filter((so) => !searchQuery.trim() || (so.customerName && so.customerName.toLowerCase().includes(searchQuery.toLowerCase())) || (so.salesOrderNumber && so.salesOrderNumber.toLowerCase().includes(searchQuery.toLowerCase())))
                .map((so, idx) => (
                  <Card key={so.id || idx} style={styles.recordCard}>
                    <TouchableOpacity onPress={() => setSelectedSalesOrder(so)} activeOpacity={0.8}>
                      <View style={styles.cardHeaderRow}>
                        <View>
                          <Text style={styles.codeText}>{so.salesOrderNumber || so.id}</Text>
                          <Text style={styles.cardTitle}>{so.customerName}</Text>
                        </View>
                        <Badge label={(so.status || 'confirmed').toUpperCase()} variant="success" size="sm" />
                      </View>

                      <View style={styles.contactRow}>
                        <Text style={styles.contactText}>PO Ref: {so.customerPoNumber || 'Direct'}</Text>
                        <Text style={styles.contactDot}>•</Text>
                        <Calendar size={12} color={colors.textMuted} />
                        <Text style={styles.contactText}>Due: {so.deliveryDate || so.targetDeliveryDate || 'TBD'}</Text>
                      </View>

                      <View style={styles.cardFooterRow}>
                        <Text style={styles.amountText}>
                          ₹ {(so.grandTotal || so.grand_total || so.totalAmount || 350000).toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.metaLabel}>{so.paymentTerms || 'Confirmed Terms'}</Text>
                      </View>
                    </TouchableOpacity>
                  </Card>
                ))
            )
          )}
        </ScrollView>
      )}

      {/* LEAD DETAIL MODAL */}
      <Modal visible={!!selectedLead} animationType="slide" transparent onRequestClose={() => setSelectedLead(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.codeText}>{selectedLead?.leadNo}</Text>
                <Text style={styles.modalTitle}>{selectedLead?.companyName}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedLead(null)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Contact Person</Text>
                <Text style={styles.detailVal}>{selectedLead?.contactPerson} ({selectedLead?.mobile})</Text>
              </View>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Scope of Equipment</Text>
                <Text style={styles.detailVal}>{selectedLead?.productName} • Machine: {selectedLead?.machineType || 'Fabrication'}</Text>
              </View>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Priority & Status</Text>
                <Text style={styles.detailVal}>Priority: {(selectedLead?.priority || 'medium').toUpperCase()} | Status: {(selectedLead?.status || 'new').toUpperCase()}</Text>
              </View>
              {selectedLead?.remarks ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Requirement Remarks</Text>
                  <Text style={styles.detailVal}>{selectedLead?.remarks}</Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Convert to Registered Customer"
                onPress={() => selectedLead && handleConvertLead(selectedLead.id || selectedLead.leadNo || '')}
                variant="accent"
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* QUOTATION DETAIL MODAL */}
      <Modal visible={!!selectedQuotation} animationType="slide" transparent onRequestClose={() => setSelectedQuotation(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.codeText}>{selectedQuotation?.quotationNumber} ({selectedQuotation?.currentRevision || 'Rev-00'})</Text>
                <Text style={styles.modalTitle}>{selectedQuotation?.customerName}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedQuotation(null)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Equipment Scope</Text>
                <Text style={styles.detailVal}>{selectedQuotation?.machineProduct || 'Process Equipment'}</Text>
              </View>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Financial Totals</Text>
                <Text style={styles.detailVal}>
                  Subtotal: ₹ {(selectedQuotation?.subtotal || 0).toLocaleString('en-IN')} | Tax: ₹ {(selectedQuotation?.taxAmount || selectedQuotation?.tax_amount || 0).toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.amountText, { marginTop: 4 }]}>
                  Grand Total: ₹ {(selectedQuotation?.grandTotal || selectedQuotation?.grand_total || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Approval Status</Text>
                <Text style={styles.detailVal}>Status: {(selectedQuotation?.status || 'draft').toUpperCase()} {selectedQuotation?.approvedBy ? `• Approved By: ${selectedQuotation.approvedBy}` : ''}</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooterRow}>
              {selectedQuotation?.status !== 'approved' && (
                <>
                  <Button
                    title="Reject"
                    variant="danger"
                    onPress={() => selectedQuotation && handleRejectQuotation(selectedQuotation.id || selectedQuotation.quotationNumber || '')}
                    style={{ flex: 1, marginRight: spacing.sm }}
                  />
                  <Button
                    title="Approve Proposal"
                    variant="primary"
                    onPress={() => selectedQuotation && handleApproveQuotation(selectedQuotation.id || selectedQuotation.quotationNumber || '')}
                    style={{ flex: 1 }}
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* CREATE RECORD MODAL */}
      <Modal visible={createModalVisible} animationType="slide" transparent onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New {activeTab.replace('_', ' ').toUpperCase()}</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company / Client Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Larsen & Toubro Heavy Fab"
                  placeholderTextColor={colors.textMuted}
                  value={formCompanyName}
                  onChangeText={setFormCompanyName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Person *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Rajesh Sharma"
                  placeholderTextColor={colors.textMuted}
                  value={formContactPerson}
                  onChangeText={setFormContactPerson}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  value={formMobile}
                  onChangeText={setFormMobile}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="contact@client.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formEmail}
                  onChangeText={setFormEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Equipment / Product Scope</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 50 KL SS316 Reaction Vessel"
                  placeholderTextColor={colors.textMuted}
                  value={formProduct}
                  onChangeText={setFormProduct}
                />
              </View>

              {(activeTab === 'quotations' || activeTab === 'sales_orders' || activeTab === 'enquiries') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Estimated Value (₹)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 500000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={formAmount}
                    onChangeText={setFormAmount}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Remarks & Specifications</Text>
                <TextInput
                  style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
                  placeholder="Special instructions or technical clarifications..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  value={formRemarks}
                  onChangeText={setFormRemarks}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title={submitting ? 'Submitting to Backend...' : 'Submit to ERP'}
                onPress={handleCreateSubmit}
                loading={submitting}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  kpiRibbon: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs + 2,
  },
  kpiScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  kpiItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  kpiItemValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  kpiItemLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 1,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 38,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: borderRadius.md,
    gap: 4,
    ...shadows.sm,
  },
  addBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipRow: {
    paddingVertical: spacing.xs + 2,
  },
  filterChipScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  centerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  emptySub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  recordCard: {
    padding: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 1,
  },
  productText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginVertical: 4,
  },
  subDetailText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 4,
  },
  contactText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  contactDot: {
    color: colors.textMuted,
    fontSize: 10,
    marginHorizontal: 2,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 6,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bronzeLight,
    borderWidth: 1,
    borderColor: '#E7DED5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  convertBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.bronze,
  },
  amountText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  metaLabel: {
    fontSize: 10.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 3,
  },
  approveBtnText: {
    color: colors.textInverse,
    fontSize: 10.5,
    fontWeight: '700',
  },
  viewDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  viewDetailText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalBody: {
    maxHeight: 400,
  },
  detailSection: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2,
  },
  detailVal: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  modalFooterRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 42,
    fontSize: 12.5,
    color: colors.textPrimary,
  },
});
