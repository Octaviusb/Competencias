import crypto from 'crypto';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { auditLog } from './audit.js';

class ElectronicPayrollService {
  constructor(prisma) {
    this.prisma = prisma;
    this.xmlBuilder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      suppressEmptyNode: true
    });
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true
    });
  }

  // Generate CUNE (Código Único de Nómina Electrónica)
  generateCUNE(employerNit, employeeId, periodId, sequenceNumber) {
    const data = `${employerNit}${employeeId}${periodId}${sequenceNumber}${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32).toUpperCase();
  }

  // Generate electronic payroll document
  async generateElectronicDocument(payslipId, organizationId) {
    const payslip = await this.prisma.payslip.findUnique({
      where: { id: payslipId },
      include: {
        employee: true,
        period: true,
        organization: true,
        items: true
      }
    });

    if (!payslip) {
      throw new Error('Payslip not found');
    }

    // Generate CUNE
    const sequenceNumber = await this.getNextSequenceNumber(organizationId);
    const cune = this.generateCUNE(
      payslip.organization.name, // Using name as NIT placeholder
      payslip.employeeId,
      payslip.periodId,
      sequenceNumber
    );

    // Build XML document structure (based on DIAN requirements)
    const xmlData = {
      'nomina': {
        '@_xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        '@_xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        '@_xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        '@_xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
        '@_xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
        '@_xmlns:sts': 'urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2',
        '@_xmlns:xades': 'http://uri.etsi.org/01903/v1.3.2#',
        'ext:UBLExtensions': {
          'ext:UBLExtension': [
            {
              'ext:ExtensionContent': {
                'sts:DianExtensions': {
                  'sts:InvoiceControl': {
                    'sts:InvoiceAuthorization': '123456789', // Placeholder
                    'sts:AuthorizationPeriod': {
                      'cbc:StartDate': payslip.period.startDate.toISOString().split('T')[0],
                      'cbc:EndDate': payslip.period.endDate.toISOString().split('T')[0]
                    },
                    'sts:AuthorizedInvoices': {
                      'sts:Prefix': 'NE',
                      'sts:From': '1',
                      'sts:To': '999999999'
                    }
                  },
                  'sts:InvoiceSource': {
                    'cbc:IdentificationCode': 'CO',
                    'sts:SoftwareProvider': {
                      'sts:ProviderID': '123456789', // Software provider NIT
                      'sts:SoftwareID': '123456789'
                    }
                  },
                  'sts:SoftwareSecurityCode': cune
                }
              }
            }
          ]
        },
        'cbc:UBLVersionID': 'UBL 2.1',
        'cbc:CustomizationID': '10',
        'cbc:ProfileID': 'DIAN 2.1',
        'cbc:ProfileExecutionID': '1',
        'cbc:ID': cune,
        'cbc:UUID': {
          '@_schemeName': 'CUNE',
          '#text': cune
        },
        'cbc:IssueDate': new Date().toISOString().split('T')[0],
        'cbc:IssueTime': new Date().toISOString().split('T')[1].split('.')[0],
        'cbc:DueDate': payslip.period.payDate.toISOString().split('T')[0],
        'cbc:InvoiceTypeCode': '102', // Nómina electrónica
        'cbc:Note': 'Nómina Electrónica',
        'cbc:DocumentCurrencyCode': 'COP',
        'cbc:LineCountNumeric': '1',
        'cac:AccountingSupplierParty': {
          'cac:Party': {
            'cac:PartyIdentification': {
              'cbc:ID': {
                '@_schemeID': '31',
                '@_schemeName': '31',
                '#text': payslip.organization.name // NIT placeholder
              }
            },
            'cac:PartyName': {
              'cbc:Name': payslip.organization.name
            },
            'cac:PartyTaxScheme': {
              'cbc:RegistrationName': payslip.organization.name,
              'cbc:CompanyID': {
                '@_schemeID': '31',
                '@_schemeName': '31',
                '#text': payslip.organization.name
              },
              'cbc:TaxLevelCode': '0'
            },
            'cac:PartyLegalEntity': {
              'cbc:RegistrationName': payslip.organization.name,
              'cbc:CompanyID': {
                '@_schemeID': '31',
                '@_schemeName': '31',
                '#text': payslip.organization.name
              }
            }
          }
        },
        'cac:AccountingCustomerParty': {
          'cac:Party': {
            'cac:PartyIdentification': {
              'cbc:ID': {
                '@_schemeID': '13', // CC for Colombian ID
                '@_schemeName': '13',
                '#text': payslip.employeeId // Placeholder for employee ID
              }
            },
            'cac:Person': {
              'cbc:FirstName': payslip.employee.firstName,
              'cbc:FamilyName': payslip.employee.lastName
            }
          }
        },
        'cac:PaymentMeans': {
          'cbc:ID': '1',
          'cbc:PaymentMeansCode': '31', // Transferencia bancaria
          'cbc:PaymentDueDate': payslip.period.payDate.toISOString().split('T')[0],
          'cac:PayeeFinancialAccount': {
            'cbc:ID': '123456789' // Account number placeholder
          }
        },
        'cac:TaxTotal': {
          'cbc:TaxAmount': {
            '@_currencyID': 'COP',
            '#text': payslip.taxes.toFixed(2)
          },
          'cac:TaxSubtotal': {
            'cbc:TaxableAmount': {
              '@_currencyID': 'COP',
              '#text': payslip.baseSalary.toFixed(2)
            },
            'cbc:TaxAmount': {
              '@_currencyID': 'COP',
              '#text': payslip.taxes.toFixed(2)
            },
            'cac:TaxCategory': {
              'cbc:Percent': '15.00',
              'cac:TaxScheme': {
                'cbc:ID': '01',
                'cbc:Name': 'IVA'
              }
            }
          }
        },
        'cac:LegalMonetaryTotal': {
          'cbc:LineExtensionAmount': {
            '@_currencyID': 'COP',
            '#text': payslip.baseSalary.toFixed(2)
          },
          'cbc:TaxExclusiveAmount': {
            '@_currencyID': 'COP',
            '#text': payslip.baseSalary.toFixed(2)
          },
          'cbc:TaxInclusiveAmount': {
            '@_currencyID': 'COP',
            '#text': (payslip.baseSalary + payslip.taxes).toFixed(2)
          },
          'cbc:PayableAmount': {
            '@_currencyID': 'COP',
            '#text': payslip.netPay.toFixed(2)
          }
        },
        'cac:InvoiceLine': {
          'cbc:ID': '1',
          'cbc:InvoicedQuantity': {
            '@_unitCode': 'DAY',
            '#text': '30' // Placeholder for worked days
          },
          'cbc:LineExtensionAmount': {
            '@_currencyID': 'COP',
            '#text': payslip.baseSalary.toFixed(2)
          },
          'cac:PricingReference': {
            'cac:AlternativeConditionPrice': {
              'cbc:PriceAmount': {
                '@_currencyID': 'COP',
                '#text': payslip.baseSalary.toFixed(2)
              },
              'cbc:PriceTypeCode': '01'
            }
          },
          'cac:TaxTotal': {
            'cbc:TaxAmount': {
              '@_currencyID': 'COP',
              '#text': payslip.taxes.toFixed(2)
            },
            'cac:TaxSubtotal': {
              'cbc:TaxableAmount': {
                '@_currencyID': 'COP',
                '#text': payslip.baseSalary.toFixed(2)
              },
              'cbc:TaxAmount': {
                '@_currencyID': 'COP',
                '#text': payslip.taxes.toFixed(2)
              },
              'cac:TaxCategory': {
                'cbc:Percent': '15.00',
                'cac:TaxScheme': {
                  'cbc:ID': '01',
                  'cbc:Name': 'IVA'
                }
              }
            }
          },
          'cac:Item': {
            'cbc:Description': 'Salario Básico'
          },
          'cac:Price': {
            'cbc:PriceAmount': {
              '@_currencyID': 'COP',
              '#text': payslip.baseSalary.toFixed(2)
            }
          }
        }
      }
    };

    const xmlContent = this.xmlBuilder.build(xmlData);

    // Create electronic document record
    const electronicDocument = await this.prisma.electronicPayrollDocument.create({
      data: {
        payslipId,
        cune,
        documentType: 'nomina_electronica',
        periodType: 'mensual',
        paymentMethod: '31', // Transferencia bancaria
        employerNit: payslip.organization.name, // Placeholder
        employerName: payslip.organization.name,
        employeeId: payslip.employeeId,
        employeeName: payslip.employee.firstName,
        employeeLastName: payslip.employee.lastName,
        contractType: '01', // Indefinido
        position: payslip.employee.title || 'Empleado',
        salary: payslip.baseSalary,
        workedDays: 30, // Placeholder
        earnedIncome: payslip.baseSalary + payslip.overtime,
        deductions: payslip.deductions + payslip.taxes,
        netPayment: payslip.netPay,
        paymentDate: payslip.period.payDate,
        xmlContent,
        organizationId
      }
    });

    // Audit log
    auditLog('ELECTRONIC_PAYROLL_GENERATED', null, organizationId, {
      resource: 'ElectronicPayrollDocument',
      resourceId: electronicDocument.id,
      changes: { cune, employeeId: payslip.employeeId, payslipId }
    });

    return electronicDocument;
  }

  // Get next sequence number for CUNE generation
  async getNextSequenceNumber(organizationId) {
    const lastDocument = await this.prisma.electronicPayrollDocument.findFirst({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });

    return lastDocument ? parseInt(lastDocument.cune.substring(24, 32), 16) + 1 : 1;
  }

  // Sign document digitally (placeholder implementation)
  async signDocument(documentId, privateKey) {
    const document = await this.prisma.electronicPayrollDocument.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Create digital signature (simplified)
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(document.xmlContent);
    const signature = sign.sign(privateKey, 'base64');

    await this.prisma.electronicPayrollDocument.update({
      where: { id: documentId },
      data: {
        digitalSignature: signature,
        status: 'signed'
      }
    });

    // Audit log
    auditLog('ELECTRONIC_PAYROLL_SIGNED', null, document.organizationId, {
      resource: 'ElectronicPayrollDocument',
      resourceId: documentId,
      changes: { status: 'signed' }
    });

    return signature;
  }

  // Transmit to DIAN (placeholder)
  async transmitToDIAN(documentId) {
    const document = await this.prisma.electronicPayrollDocument.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Create transmission record
    const transmission = await this.prisma.electronicPayrollTransmission.create({
      data: {
        documentId,
        status: 'sent',
        organizationId: document.organizationId
      }
    });

    // Simulate DIAN API call
    try {
      // Here would be the actual API call to DIAN
      // For now, simulate success
      const response = { status: 'accepted', code: '200', message: 'Documento aceptado' };

      await this.prisma.electronicPayrollTransmission.update({
        where: { id: transmission.id },
        data: {
          status: response.status,
          responseCode: response.code,
          responseMessage: response.message
        }
      });

      await this.prisma.electronicPayrollDocument.update({
        where: { id: documentId },
        data: {
          status: response.status,
          transmissionDate: new Date()
        }
      });

      // Audit log
      auditLog('ELECTRONIC_PAYROLL_TRANSMITTED', null, document.organizationId, {
        resource: 'ElectronicPayrollDocument',
        resourceId: documentId,
        changes: { status: response.status, transmissionResult: response }
      });

      return { success: true, response };
    } catch (error) {
      await this.prisma.electronicPayrollTransmission.update({
        where: { id: transmission.id },
        data: {
          status: 'rejected',
          responseCode: error.code || '500',
          responseMessage: error.message,
          retryCount: { increment: 1 },
          nextRetryDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Retry in 24 hours
        }
      });

      throw error;
    }
  }

  // Check compliance calendar
  checkComplianceCalendar(employeeCount, currentDate = new Date()) {
    const phases = [
      { maxEmployees: 50, startDate: new Date('2023-01-01') },
      { maxEmployees: 250, startDate: new Date('2024-01-01') },
      { maxEmployees: Infinity, startDate: new Date('2025-01-01') }
    ];

    const applicablePhase = phases.find(phase => employeeCount <= phase.maxEmployees);
    return currentDate >= applicablePhase.startDate;
  }

  // Retry failed transmissions
  async retryFailedTransmissions() {
    const failedTransmissions = await this.prisma.electronicPayrollTransmission.findMany({
      where: {
        status: 'rejected',
        retryCount: { lt: 3 },
        nextRetryDate: { lte: new Date() }
      },
      include: { document: true }
    });

    for (const transmission of failedTransmissions) {
      try {
        await this.transmitToDIAN(transmission.documentId);
      } catch (error) {
        console.error(`Retry failed for document ${transmission.documentId}:`, error);
      }
    }
  }
}

export default ElectronicPayrollService;