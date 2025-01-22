// @/backend/lib/googleSheets.ts
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { MONTH_MAPPINGS } from './constants';

export interface StudentData {
  no: string;
  id: string;
  nickname: string;
  name: string;
  jul: string;
  aug: string;
  sep: string;
  oct: string;
  nov: string;
  dec: string;
  jan: string;
  feb: string;
  mar: string;
  note: string;
  payments?: PaymentData[];
}

export interface PaymentData {
  month: string;
  paid: boolean;
  paymentDate?: Date;
  amount: number;
}

export class GoogleSheetsService {
  private client: JWT | undefined;
  private sheets: any;
  private readonly SPREADSHEET_ID: string;
  private readonly SHEET_NAME = 'รายชื่อ67';
  private readonly RANGE = `${this.SHEET_NAME}!A6:O`;
  private initialized = false;

  constructor() {
    this.SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '';
    if (!this.SPREADSHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID environment variable is not set');
    }
    this.initializeClient();
  }

  private initializeClient() {
    try {
      // Ensure private key is properly formatted
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('GOOGLE_PRIVATE_KEY environment variable is not set');
      }

      const formattedKey = privateKey.replace(/\\n/g, '\n');

      this.client = new JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: formattedKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.client });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Google Sheets client:', error);
      throw new Error('Google Sheets authentication failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async ensureAuthenticated() {
    if (!this.initialized) {
      throw new Error('Google Sheets service not properly initialized');
    }

    try {
      // Test the authentication by making a minimal API call
      await this.sheets.spreadsheets.get({
        spreadsheetId: this.SPREADSHEET_ID,
        fields: 'spreadsheetId'
      });
    } catch (error: any) {
      if (error.code === 403) {
        throw new Error('Permission denied: Please check Google Sheets API credentials and permissions');
      }
      throw error;
    }
  }

  private convertMonthNameToThai(month: string): string {
    const englishMonth = month.toLowerCase();
    const thaiMonth = MONTH_MAPPINGS[englishMonth as keyof typeof MONTH_MAPPINGS];
    if (!thaiMonth) {
      throw new Error(`Invalid month name: ${month}`);
    }
    return thaiMonth;
  }

  async getStudents(): Promise<StudentData[]> {
    try {
      await this.ensureAuthenticated();

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.SPREADSHEET_ID,
        range: this.RANGE,
      });

      if (!response.data.values) {
        throw new Error('No data found in spreadsheet');
      }

      return response.data.values.map((row: any[]): StudentData => ({
        no: row[0] || '',
        name: row[1] || '',
        nickname: row[2] || '',
        id: row[3] || '',
        jul: row[4] || '',
        aug: row[5] || '',
        sep: row[6] || '',
        oct: row[7] || '',
        nov: row[8] || '',
        dec: row[9] || '',
        jan: row[10] || '',
        feb: row[11] || '',
        mar: row[12] || '',
        note: row[13] || '',
        payments: []
      }));
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      throw this.handleGoogleSheetsError(error);
    }
  }

  async updatePaymentStatus(studentId: string, month: string, amount: number): Promise<boolean> {
    try {
      await this.ensureAuthenticated();

      const thaiMonth = this.convertMonthNameToThai(month);
      const column = MONTH_MAPPINGS[thaiMonth as keyof typeof MONTH_MAPPINGS];
      
      if (!column) {
        throw new Error(`Invalid Thai month mapping: ${thaiMonth}`);
      }

      // Find student row with retry mechanism
      let attempts = 0;
      const maxAttempts = 3;
      let students;

      while (attempts < maxAttempts) {
        try {
          students = await this.getStudents();
          break;
        } catch (error) {
          attempts++;
          if (attempts === maxAttempts) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      if (!students) {
        throw new Error('Failed to fetch student data');
      }

      const studentIndex = students.findIndex(s => s.id === studentId);
      if (studentIndex === -1) {
        throw new Error(`Student with ID ${studentId} not found`);
      }

      const rowNumber = studentIndex + 6;
      const range = `${this.SHEET_NAME}!${column}${rowNumber}`;

      // Batch update both main sheet and payment record
      const batchUpdateRequest = {
        spreadsheetId: this.SPREADSHEET_ID,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: [
            {
              range,
              values: [[amount.toString()]]
            },
            {
              range: 'payment_record!A:D',
              values: [[
                new Date().toISOString(),
                studentId,
                thaiMonth,
                amount.toString()
              ]]
            }
          ]
        }
      };

      await this.sheets.spreadsheets.values.batchUpdate(batchUpdateRequest);
      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw this.handleGoogleSheetsError(error);
    }
  }

  private handleGoogleSheetsError(error: any): Error {
    if (error.code === 403) {
      return new Error(
        'Google Sheets permission error: Please ensure the service account has edit access to the spreadsheet'
      );
    }
    if (error.code === 404) {
      return new Error(
        'Spreadsheet not found: Please check the spreadsheet ID and sharing permissions'
      );
    }
    return new Error(
      `Google Sheets operation failed: ${error.message || 'Unknown error'}`
    );
  }
}

export const sheetsService = new GoogleSheetsService();