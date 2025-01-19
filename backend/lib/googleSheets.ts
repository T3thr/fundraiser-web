// @/backend/lib/googleSheets.ts
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export interface StudentData {
  no: string;
  id: string;
  nickname: string;
  name: string;
  jul: string;
  aug: string;
  sep: string;
  nov: string;
  oct: string;
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
  private client: JWT;
  private sheets: any;
  private readonly SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || ''; // Use environment variable for spreadsheet ID
  private readonly SHEET_NAME = 'รายชื่อ67'; // Add your sheet name here
  private readonly RANGE = `${this.SHEET_NAME}!A6:O`; // Update range to include sheet name

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
        name: row[1],
        nickname: row[2],
        id: row[3],
        jul: row[4],
        aug: row[5],
        sep: row[6],
        oct: row[7],
        nov: row[8],
        dec: row[9],
        jan: row[10],
        feb: row[11],
        mar: row[12],
        note: row[13],
        payments: [] // Initialize empty payments array
      }));
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      throw error;
    }
  }
}

export const sheetsService = new GoogleSheetsService();