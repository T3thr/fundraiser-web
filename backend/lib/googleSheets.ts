// @/backend/lib/googleSheets.ts
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export interface StudentData {
  no: string;
  id: string;
  name: string;
  payments?: PaymentData[];
}

export interface PaymentData {
  month: string;
  paid: boolean;
  paymentDate?: Date;
  amount: number;
}

export class GoogleSheetsService {
  private client: JWT;
  private sheets: any;
  private readonly SPREADSHEET_ID = '1NsIzGV38P-fEyQKCSdXw7Ph8Kr0p70jh4tMSPFnyEEU';
  private readonly SHEET_NAME = 'reg'; // Add your sheet name here
  private readonly RANGE = `${this.SHEET_NAME}!A2:C`; // Update range to include sheet name

  constructor() {
    this.client = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.client });
  }

  async getStudents(): Promise<StudentData[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.SPREADSHEET_ID,
        range: this.RANGE,
      });

      return response.data.values.map((row: any[]): StudentData => ({
        no: row[0],
        id: row[1],
        name: row[2],
        payments: [] // Initialize empty payments array
      }));
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      throw error;
    }
  }
}

export const sheetsService = new GoogleSheetsService();