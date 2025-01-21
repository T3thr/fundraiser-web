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
  protected client: JWT;
  protected sheets: any;
  protected readonly SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '';
  protected readonly SHEET_NAME = 'รายชื่อ67';
  protected readonly RANGE = `${this.SHEET_NAME}!A6:O`;

  constructor() {
    this.client = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      // Update scopes to include write permission
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/spreadsheets' // Add write permission
      ]
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
        payments: []
      }));
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      throw error;
    }
  }

  async updatePaymentStatus(studentId: string, month: string, amount: number): Promise<boolean> {
    try {
      const monthToColumn: Record<string, string> = {
        'กรกฎาคม': 'E',
        'สิงหาคม': 'F',
        'กันยายน': 'G',
        'ตุลาคม': 'H',
        'พฤศจิกายน': 'I',
        'ธันวาคม': 'J',
        'มกราคม': 'K',
        'กุมภาพันธ์': 'L',
        'มีนาคม': 'M'
      };

      // Find student row
      const students = await this.getStudents();
      const studentIndex = students.findIndex(s => s.id === studentId);
      
      if (studentIndex === -1) {
        throw new Error(`Student with ID ${studentId} not found`);
      }

      const rowNumber = studentIndex + 6; // Adding 6 because data starts from row 6
      const column = monthToColumn[month.toLowerCase()];
      
      if (!column) {
        throw new Error(`Invalid month: ${month}`);
      }

      const range = `${this.SHEET_NAME}!${column}${rowNumber}`;

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.SPREADSHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[amount.toString()]]
        }
      });

      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }
}

export const sheetsService = new GoogleSheetsService();